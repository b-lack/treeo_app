<template>
  <div>
    <AddFab v-bind:routeTo="'/plot/' + $route.params.id + '/survey/add'"/>
    <List db="surveys" v-bind:parentId="$route.params.id"/>
  </div>
</template>

<script>
import AddFab from '../components/AddFab'
import List from '../components/List'

export default {
  components: {
    AddFab,
    List
  }
}
</script>
