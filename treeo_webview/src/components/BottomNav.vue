<template>
    <div class="of-servey-status pa-2">
      <!--<v-btn outline @click="clear">
        {{ $t("form.button.clear") }}
      </v-btn>-->
      <v-btn block v-bind:loading="loading" :disabled="invalid" color="primary" @click="send">
        {{ $t("button.addTree") }}
        <!--<v-icon right dark v-if="$t('button.addTreeIcon')">{{ $t("button.addTreeIcon") }}</v-icon>-->
      </v-btn>
      <!--<v-btn v-if="setSendAndStart" outline color="primary" @click="sendAndStart">
        {{ $t("form.button.saveAndStart") }}
        <v-icon right dark>{{ $t("form.button.submitIcon") }}</v-icon>
      </v-btn>-->
    </div>
</template>

<script>
export default {
  props: [
    'setSendAndStart',
    'form',
    'loading',
    'invalid'
  ],
  methods: {
    send () {
      this.$emit('send')
    },
    sendAndStart () {
      this.$emit('sendAndStart')
    },
    clear () {
      this.$emit('clear')
    }
  }
}
</script>
<style>

.of-servey-status{
  position: fixed;
  width: 100%;
  border-top: 1px solid #ddd;
  bottom: 0;
  left: 0;
  z-index: 1;
  background: #fff;
}
</style>
