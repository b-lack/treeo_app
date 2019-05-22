<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center fill-height>
      <v-flex class="text-xs-center" >

        <ErrorMsg ref="errorMsgs"/>
        <v-form v-if="!emailsend">
          <p>
            {{ $t("authentication.text.forgot_password") }}
          </p>
          <v-text-field
            prepend-icon="email"
            v-model="username"
            v-bind:label="$t('authentication.placeholder.username')"
            :error-messages="usernameErrors"
            @input="$v.username.$touch()"
            @blur="$v.username.$touch()"
            required
            autocomplete
            type="email"
            name="email"
          ></v-text-field>

          <v-layout align-center justify-center>
            <v-spacer></v-spacer>
            <v-btn color="primary" :loading="loading" :disabled="loading || $store.state.netWorkStatus=='none'" @click="submit">{{ $t("authentication.button.request_password") }}</v-btn>
            <v-spacer></v-spacer>
          </v-layout>

          <p class="mt-3">
            <router-link to="/login">{{ $t("authentication.button.login") }}</router-link>
          </p>
        </v-form>

        <div class="subheading" v-else>
          <v-icon>mail</v-icon><br/>{{ $t("authentication.text.password_sent") }}
          <br/>
          <a @click="emailsend=false">{{ $t("authentication.text.request_new_password") }}</a>
          <v-layout align-center justify-center class="mt-4">
            <v-spacer></v-spacer>
            <v-btn color="primary" to="/login">{{ $t("authentication.button.login") }}</v-btn>
            <v-spacer></v-spacer>
          </v-layout>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import ApiService from '../service/apiService'
import AuthService from '../service/authService'
import ErrorMsg from '../components/ErrorMsg'
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'

import router from '../router'

export default {
  mixins: [validationMixin],
  components: {
    ErrorMsg
  },
  validations: {
    username: { required, email }
  },

  data: () => ({
    username: '',
    errorArr: [],
    loading: false,
    emailsend: false
  }),

  activated () {
    this.clear()
  },

  computed: {
    usernameErrors () {
      const errors = []
      if (!this.$v.username.$dirty) return errors
      !this.$v.username.email && errors.push(this.$t('auth.error.notEmail'))
      !this.$v.username.required && errors.push(this.$t('auth.error.requiredUsername'))
      return errors
    }
  },

  methods: {
    submit () {
      const that = this
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.loading = true

        const dataSend = {
          email: this.username,
          reseturl: ApiService.forgotPasswordBase
        }

        ApiService.send('forgotPassword', {}, dataSend).then(response => {
          that.loading = false
          this.emailsend = true
        }).catch((error) => {
          that.loading = false
          that.$refs.errorMsgs.add(error.response.data.message)
        })
      }
    },
    clear () {
      this.$v.$reset()
      this.username = ''
    }
  }
}
</script>
