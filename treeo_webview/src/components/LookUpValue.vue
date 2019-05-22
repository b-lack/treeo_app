<template>
  <span>
    {{value}}
  </span>
</template>

<script>
import LocalstorageService from '../service/localstorageService'
import ApiService from '../service/apiService'

export default {
  props: ['id', 'endpoint'],
  data: () => ({
    value: ''
  }),
  mounted () {
    const that = this
    const storageKey = 'lookup_' + this.endpoint
    const localLookup = LocalstorageService.get(storageKey)

    if (localLookup) {
      this.items = JSON.parse(localLookup)
      this.getValue()
    } else {
      let request = ApiService.send('lookUp', null, null, null, null, null, this.endpoint)
      request.then(response => {
        that.items = response.data.data
        LocalstorageService.set(storageKey, JSON.stringify(response.data.data))
        that.getValue()
      })
    }
  },

  methods: {
    getValue (value) {
      this.items.forEach((element) => {
        if (element.id === this.id) this.value = element.name
      })
    }
  }
}
</script>
