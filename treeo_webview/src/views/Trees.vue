<template>
  <div class="ma-3">
    <!--<AddFab v-bind:routeTo="'/plot/' + $route.params.id + '/survey/' + $route.params.surveyId + '/tree/add'"/>-->
    <List db="trees" :parentId="$route.params.surveyId"/>
  </div>
</template>

<script>
import List from '../components/List'

export default {
  components: {
    List
  }
}
</script>
