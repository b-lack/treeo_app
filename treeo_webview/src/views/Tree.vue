<template>
  <div>
    <TreeDetail dbName="trees" v-bind:entryId="$route.params.treeId" />
  </div>
</template>

<script>
// import SurveyDetail from '../components/SurveyDetail';
import TreeDetail from '../components/TreeDetail'
// import SurveyOverview from '../components/SurveyOverview';

export default {
  components: {
    TreeDetail,
    // SurveyOverview
  }
}
</script>
