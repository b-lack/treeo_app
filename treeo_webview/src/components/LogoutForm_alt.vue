<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4 class="text-xs-center" >

        <router-link :to="{ name: 'profile' }">
          <v-avatar color="red" size="100" :to="{ name: 'profile' }">
            <span class="white--text headline">G</span>
          </v-avatar>
        </router-link>

        <p>
          <LogoutBtn/>
        </p>

      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import LogoutBtn from '../components/LogoutBtn'

import LocalstorageService from '../service/localstorageService'

import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'

import router from '../router'

export default {
  mixins: [validationMixin],

  validations: {
    username: { required, email },
    password: { required }
  },

  data: () => ({
    username: '',
    password: '',
    authenticated: false
  }),

  created: function () {
    this.checkAuthentification()
  },

  computed: {
    usernameErrors () {
      const errors = []
      if (!this.$v.username.$dirty) return errors
      !this.$v.username.email && errors.push(this.$t('auth.error.notEmail'))
      !this.$v.username.required && errors.push(this.$t('auth.error.requiredUsername'))
      return errors
    },
    passwordErrors () {
      const errors = []
      if (!this.$v.password.$dirty) return errors
      !this.$v.password.required && errors.push(this.$t('auth.error.requiredPassword'))
      return errors
    }
  },

  components: {
    LogoutBtn
  },

  methods: {
    checkAuthentification () {
      this.authenticated = !!LocalstorageService.get('authenticated')
    },
    submit () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        LocalstorageService.set('authenticated', true)
        router.push({ path: 'dashboard' })
      }
    },
    clear () {
      this.$v.$reset()
      this.username = ''
      this.password = ''
    },
    logout () {
      LocalstorageService.remove('authenticated')
      this.checkAuthentification()
      router.push({ path: 'login' })
    }
  }
}
</script>

<style>

</style>
