<template>
  <div class="layout fill-height justify-center align-center">
    <div>
      <LoginForm v-if="!authenticated" />

      <p class="text-xs-center">
        <LangSelection />
      </p>
    </div>
  </div>
</template>
<script>
import LoginForm from '../components/LoginForm'
import LangSelection from '../components/LangSelection'

import LocalstorageService from '../service/localstorageService'

export default {
  components: {
    LoginForm,
    LangSelection
  },
  data: () => ({
    authenticated: false
  }),
  created: function () {
    this.checkAuthentification()
  },
  methods: {
    checkAuthentification () {
      this.authenticated = !!LocalstorageService.get('authenticated')
    }
  }
}
</script>
