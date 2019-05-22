<template>
  <div>
    <TreeAddEdit ref="treeAdd" db="trees" v-bind:parentId="$route.params.surveyId" />
  </div>
</template>

<script>

import TreeAddEdit from '../components/TreeAddEdit'

export default {
  components: {
    TreeAddEdit
  }
}
</script>
