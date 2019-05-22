<template>
  <div class="layout fill-height justify-center align-center">
    <div>
      <NetworkStatus/>
      <RegistrateFarmerForm />
      <p class="text-xs-center">
        <LangSelection />
      </p>
    </div>
  </div>
</template>

<script>
import RegistrateFarmerForm from '../components/RegisterFarmerForm'
import LangSelection from '../components/LangSelection'

export default {
  components: {
    RegistrateFarmerForm,
    LangSelection
  }
}
</script>
