<template>
  <div>
    <v-layout v-for="(error, index) in errorList" my-3 :key="index">
      <v-alert
        :key="index"
        :value="true"
        color="error"
        icon="priority_high"
      >{{error}}
      </v-alert>
    </v-layout>
  </div>
</template>

<script>
export default {
  data () {
    return {
      errorList: [],
      timer: null
    }
  },
  watch: {
    errors: function (newVal, oldVal) {
      this.setTimer()
    }
  },
  methods: {
    handleError (error) {
      if (!error.response || !error.response.data) return
      if (error.response.data.errors) { this.addErrors(error.response.data.errors) } else if (error.response.data.message) { this.add(error.response.data.message) }
    },
    add (msg) {
      this.errorList.push(msg)
    },
    addErrors (erorrs) {
      for (let key in erorrs) {
        for (let errorKey in erorrs[key]) { this.errorList.push(erorrs[key][errorKey]) }
      }
      this.setTimer()
    },
    setTimer () {
      const that = this
      if (this.timer != null) { window.clearTimeout(this.timer) }
      this.timer = window.setTimeout(function () {
        that.errorList.splice(0, that.errorList.length)
      }, 5000)
    }
  }
}
</script>
