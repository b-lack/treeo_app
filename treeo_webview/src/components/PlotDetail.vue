<template>
  <div>
    <ListPlots v-if="plotRows.length" :db="db" :rowsData="plotRows" :showAction="false"/>
  </div>
</template>

<script>

import PouchDbService from '../service/pouchDbService'
import ListPlots from '../components/ListPlots'

export default {
  components: {
    ListPlots
  },
  data () {
    return {
      db: 'plots',
      plotDatabase: null,
      surveyDatabase: null,
      treeDatabase: null,
      plotRows: [],
      surveyRows: [],
      treeRows: []
    }
  },
  mounted: function () {
    this.plotDatabase = new PouchDbService('plots')
    this.surveyDatabase = new PouchDbService('surveys')
  },
  activated: function () {
    this.update()
  },
  methods: {
    update () {
      this.getById(this.plotDatabase, this.$route.params.id, this.plotRows)
      // this.getById(this.surveyDatabase, this.$route.params.id, this.surveyRows, this.getTrees)
    },
    getTrees (id) {
      this.treeDatabase = new PouchDbService('trees')
      this.getById(this.treeDatabase, this.$route.params.id, this.treeRows)
    },
    getById (database, id, resultArray, successFn) {
      database.get(id).then(function (response) {
        resultArray.length = 0
        resultArray.push(response)

        if (typeof successFn === 'function') successFn(response._id)
      })
    }
  }
}
</script>
