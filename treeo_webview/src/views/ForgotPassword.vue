<template>
  <div class="layout fill-height justify-center align-center">
    <div>
      <NetworkStatus/>
      <ForgotPasswordForm />

      <p class="text-xs-center">
        <LangSelection />
      </p>
    </div>
  </div>
</template>

<script>
import ForgotPasswordForm from '../components/ForgotPasswordForm'
import LangSelection from '../components/LangSelection'

export default {
  components: {
    ForgotPasswordForm,
    LangSelection
  }
}
</script>
