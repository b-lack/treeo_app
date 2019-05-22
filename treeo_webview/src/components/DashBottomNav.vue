<template>
  <v-bottom-nav
    :active.sync="activeTab"
    :value="true"
    fixed
    color="white"
  >
    <v-btn
      color="primary"
      flat
      value="dashboard"
      to="dashboard"
    >
      <span>Dashboard</span>
      <v-icon>apps</v-icon>
    </v-btn>

    <v-btn
      color="primary"
      flat
      value="charts"
      to="charts"
    >
      <span>Charts</span>
      <v-icon>insert_chart</v-icon>
    </v-btn>
  </v-bottom-nav>
</template>

<script>
export default {
  props: [
    'active'
  ],
  data () {
    return {
      activeTab: null
    }
  },
  activated () {
    this.activeTab = this.active
  }
}
</script>
