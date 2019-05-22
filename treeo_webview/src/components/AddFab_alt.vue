<template>
  <v-btn fab fixed bottom right color="primary" @click.native="$Helper.to(routeTo)">
    <v-icon dark>add</v-icon>
  </v-btn>
</template>

<script>
export default {
  props: ['routeTo']
}
</script>
