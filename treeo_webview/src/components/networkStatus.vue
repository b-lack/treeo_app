<template>
  <div>
    <div
      class="of-server-msg"
      v-if="$store.state.netWorkStatus==='none'"
    >
      {{$t('msg.offline')}}
    </div>
  </div>
</template>

<script>
import LocalstorageService from '../service/localstorageService'

export default {
  props: [
    'rowsData'
  ],
  data: () => ({
    synchMobile: false
  }),
  mounted () {
    this.synchMobile = LocalstorageService.get('synchMobile') === 'true'
  }
}
</script>
