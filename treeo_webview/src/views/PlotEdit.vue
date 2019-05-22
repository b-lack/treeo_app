<template>
  <div>
    <PlotAddEdit db="plots" :id="$route.params.id" />
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
