<template>
  <div :class="{ 'of-has-footer': $store.state.ongoingSurveys }" >
    <Statistics :key="($store.state.update+1)"/>
    <GeoPoint3 ref="geoPoint" type="Point" :dialog="false" />
    <div class="headline mx-3 mt-3">
      Plots
    </div>
    <List db="plots" layout="list" name="Plot" :showAction="false" :key="$store.state.update"/>
    <AddTreeBtn :key="$store.state.updateToolbar+2"/>
  </div>
</template>

<script>
import Statistics from '../components/Statistics'
import AddTreeBtn from '../components/AddTreeBtn'
import List from '../components/List'
import GeoPoint3 from '../components/GeoPoint3'

import PouchDbService from '../service/pouchDbService'
import SynchService from '../service/synchService'
import LocalStorageService from '../service/localstorageService'

export default {
  components: {
    Statistics,
    AddTreeBtn,
    List,
    GeoPoint3
  },
  data: () => ({
    intervalid: null
  }),
  activated: function () {
    this.checkAutoSynch()
  },
  methods: {
    checkAutoSynch () {
      const latestSynch = parseInt(LocalStorageService.get('latestSynch'))
      const dataUpdated = LocalStorageService.get('dataUpdated') === 'true'
      const currentDateTimestamp = Date.now()

      const updateAfter = 8.64e+7 * 7

      if (!latestSynch) {
        this.synch()
      } else if (dataUpdated) {
        this.synch()
      } else if (latestSynch) {
        if (latestSynch < currentDateTimestamp - updateAfter) {
          this.synch()
        }
      }
    },
    synch () {
      SynchService.synch()
    },
  }
}
</script>

<style>
.of-has-footer{
  margin-bottom: 60px;
}
</style>
