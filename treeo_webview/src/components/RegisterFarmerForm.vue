<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center fill-height>
      <v-flex class="text-xs-center" >

        <NetworkStatus/>
        <ErrorMsg ref="errorMsgs"/>
        <v-form>

          <v-text-field
            prepend-icon="person"
            v-model="username"
            v-bind:label="$t('authentication.placeholder.name')"
            :error-messages="usernameErrors"
            @input="$v.username.$touch()"
            @blur="$v.username.$touch()"
            required
            autocomplete
            type="email"
            name="email"
          ></v-text-field>

          <v-text-field
            prepend-icon="email"
            v-model="useremail"
            v-bind:label="$t('authentication.placeholder.username')"
            :error-messages="useremailErrors"
            @input="$v.username.$touch()"
            @blur="$v.username.$touch()"
            required
            autocomplete
            type="email"
            name="email"
          ></v-text-field>

          <v-dialog
            ref="dialog"
            :return-value.sync="birthday"
            lazy
            full-width
            width="290px"
          >
            <v-text-field
              slot="activator"
              v-model="birthday"
              :label="$t('authentication.placeholder.birthday')"
              prepend-icon="event"
              readonly
            ></v-text-field>
            <v-date-picker v-model="birthday" scrollable>
              <v-spacer></v-spacer>
              <v-btn flat color="primary" @click="$refs.dialog.save(birthday)">{{$t('dialog.datePicker.agree')}}</v-btn>
            </v-date-picker>
          </v-dialog>

          <v-select
            prepend-icon="people"
            :items="genders"
            :label="$t('authentication.placeholder.gender')"
              v-model="gender"
             item-text="name"
             item-value="id"
             ref="lookUp"
             required
          ></v-select>

          <v-layout align-center justify-center>
            <v-spacer></v-spacer>
            <v-btn color="primary" :loading="loading" :disabled="loading || $store.state.netWorkStatus=='none'" @click="submit">{{ $t("authentication.button.registerFarmer") }}</v-btn>
            <v-spacer></v-spacer>
          </v-layout>
        </v-form>

        <p class="mt-3">
          <router-link to="/login">{{ $t("authentication.button.login") }}</router-link>
        </p>
        <v-divider/>
      </v-flex>
    </v-layout>

  </v-container>
</template>

<script>

import ApiService from '../service/apiService'
// import PouchDbService from '../service/pouchDbService'
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
    username: { required },
    useremail: { required, email },
    birthday: { required },
    gender: { required }
  },

  data: () => ({
    username: '',
    useremail: '',
    birthday: '',
    gender: 'm',
    genders: [{ 'name': 'Female', 'id': 'f' }, { 'name': 'Male', 'id': 'm' }],
    errorArr: [],
    loading: false
  }),
  deactivated () {

  },
  computed: {
    usernameErrors () {
      const errors = []
      if (!this.$v.username.$dirty) return errors
      !this.$v.username.required && errors.push(this.$t('authentication.error.requiredName'))
      return errors
    },
    useremailErrors () {
      const errors = []
      if (!this.$v.useremail.$dirty) return errors
      !this.$v.useremail.email && errors.push(this.$t('authentication.error.notEmail'))
      !this.$v.useremail.required && errors.push(this.$t('authentication.error.requiredUsername'))
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

      if (this.$v.$invalid) {
        // console.log('$invalid');
      } else {
        this.loading = true

        const dataSend = {
          anme: this.name,
          email: this.username,
          birthday: this.birthday,
          gender: this.gender
        }

        const request = ApiService.send('registrateFarmer', {}, dataSend)

        /* request.then(response => {
          return AuthService.login(response, this.username)
          //return AuthService.getLoggedInProfile()
        }).then(response => {
          router.push({ path: 'dashboard' })
        }).catch(error => {
          that.$refs.errorMsgs.handleError(error)
        }).then(() => {
        this.clear()
        that.loading = false
      }) */
      }
    },

    clear () {
      this.$v.$reset()
      this.username = ''
      this.useremail = ''
      this.birthday = ''
      this.gender = ''
    }

  }
}
</script>
