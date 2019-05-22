<template>
  <v-container class="of-form-wrapper" fluid fill-height>
    <v-layout align-center justify-center fill-height>
      <v-flex class="text-xs-center" >
        <v-avatar class="of-avatar-logo mb-3" size="100">
          <img :src="fwLogo" alt="fairventures logo"/>
        </v-avatar>
        <NetworkStatus/>
        <ErrorMsg ref="errorMsgs"/>
        <v-form>

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

          <v-text-field
            prepend-icon="lock"
            v-model="password"
            v-bind:label="$t('authentication.placeholder.password')"
            :error-messages="passwordErrors"
            type="password"
            @input="$v.password.$touch()"
            @blur="$v.password.$touch()"
            required
            autocomplete
            name="password"
          ></v-text-field>

          <v-layout align-center justify-center>
            <v-spacer></v-spacer>
            <v-btn color="primary" :loading="loading" :disabled="loading || $store.state.netWorkStatus=='none'" @click="submit">{{ $t("authentication.button.login") }}</v-btn>
            <v-spacer></v-spacer>
          </v-layout>
        </v-form>

        <p class="mt-3">
          <router-link to="/forgotPassword">{{ $t("authentication.link.forgot_password") }}</router-link>
        </p>
        <p class="mt-3">
          <v-btn flat color="primary" :disabled="true" @click="$router.push({name: 'registerFarmer'})">{{ $t("authentication.link.register_farmer") }}</v-btn>
        </p>
        <v-divider/>
      </v-flex>
    </v-layout>

  </v-container>
</template>

<script>
import fwLogo from '../assets/img/drawable-xxxhdpi-icon.png'
import ApiService from '../service/apiService'
import AuthService from '../service/authService'
import NetworkStatus from '../components/networkStatus'

import ErrorMsg from '../components/ErrorMsg'

import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'

import router from '../router'

export default {
  mixins: [validationMixin],
  components: {
    ErrorMsg,
    NetworkStatus
  },
  validations: {
    username: { required, email },
    password: { required }
  },

  data: () => ({
    username: '',
    password: '',
    fwLogo: fwLogo,
    errorArr: [],
    loading: false
  }),

  computed: {
    usernameErrors () {
      const errors = []

      if (!this.$v.username.$dirty) return errors
      !this.$v.username.email && errors.push(this.$t('authentication.error.notEmail'))
      !this.$v.username.required && errors.push(this.$t('authentication.error.requiredUsername'))

      return errors
    },
    passwordErrors () {
      const errors = []

      if (!this.$v.password.$dirty) return errors
      !this.$v.password.required && errors.push(this.$t('authentication.error.requiredPassword'))

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
          password: this.password
        }

        const request = ApiService.send('login', {}, dataSend)

        request.then(response => {
          return AuthService.login(response, this.username)
        }).then(response => {
          router.push({ path: 'dashboard' })
        }).catch(error => {
          that.$refs.errorMsgs.handleError(error)
          that.loading = false
        }).then(() => {
          that.loading = false
        })
      }
    },

    clear () {
      this.$v.$reset()
      this.username = ''
      this.password = ''
    }

  }
}
</script>

<style>
.of-form-wrapper{
  width: 100vw;
  max-width: 500px !important;
}
</style>
