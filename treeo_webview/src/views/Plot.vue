<template>
  <div>

    <PlotDetail dbName="plots" :entryId="$route.params.id" />
    <Statistics :parentId="$route.params.id" :key="($store.state.update+3)"/>
    <div class="headline mx-3 mt-3">
      Surveys
    </div>
    <List db="surveys" :parentId="$route.params.id"/>
  </div>
</template>

<script>
import PlotDetail from '../components/PlotDetail'
import List from '../components/List'
import Statistics from '../components/Statistics'

export default {
  components: {
    PlotDetail,
    List,
    Statistics
  }
}
</script>
