<template>
  <div>
    <v-select
      :items.sync="items"
      :value="value"
      :label="label"
       @change="update($event)"
       item-text="name"
       item-value="id"
       ref="lookUp"
       required
    ></v-select>
  </div>
</template>

<script>
import LocalstorageService from '../service/localstorageService'
import ApiService from '../service/apiService'

export default {
  props: ['value', 'endpoint', 'label'],
  data: () => ({
    items: [],
  }),
  activated () {
    const storageKey = 'lookup_' + this.endpoint
    const localLookup = LocalstorageService.get(storageKey)

    if (localLookup) {
      this.items = JSON.parse(localLookup)
    } else {
      let request = ApiService.send('lookUp', null, null, null, null, null, this.endpoint)
      request.then(response => {
        this.items = response.data.data
        LocalstorageService.set(storageKey, JSON.stringify(response.data.data))
      })
    }
  },
  methods: {
    update (value) {
      this.$emit('input', value)
    }
  }
}
</script>
