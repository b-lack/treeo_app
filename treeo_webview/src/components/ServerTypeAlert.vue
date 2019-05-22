<template>
  <div
    :key="$store.state.updateToolbar+1"
    v-if="showStageMsg"
    class="of-server-msg"
  >
      You are currently on STAGE
  </div>
</template>

<script>

export default {
  data: () => ({
    showStageMsg: false
  }),
  mounted () {
    this.showStageMsg = window.config.name === 'stage'
  }
}
</script>

<style>
.of-server-msg{
  background-color: #333;
  color: #fff;
  padding: 20px;
  margin: 5px;
  border-radius: 2px;
}
</style>
