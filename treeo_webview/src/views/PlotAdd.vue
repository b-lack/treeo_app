<template>
  <div class="layout fill-height justify-center align-center">
    <div>
      <div class="headline mx-3 mt-3">
        {{$t('page.plotAdd.title')}}
      </div>
      <PlotAddEdit db="plots" />
    </div>

  </div>
</template>

<script>
import PlotAddEdit from '../components/PlotAddEdit'

export default {
  components: {
    PlotAddEdit
  }
}
</script>
