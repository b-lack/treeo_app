<template>
  <div class="of-servey-status pa-2">
    <v-btn
      color="primary"
      block
      @click="addTreeFn()"
      :disabled="!treeSelection && (!plotsLoaded || !surveysLoaded)"
      :loading="!treeSelection && (!plotsLoaded || !surveysLoaded)"
    >
      {{ $t("button.addTree") }}
    </v-btn>
  </div>
</template>

<script>
import PouchDbService from '../service/pouchDbService'
import HelperService from '../service/helperService'

export default {
  props: ['treeSelection'],
  data () {
    return {
      plots: [],
      surveys: [],
      stopDialog: false,
      plotsLoaded: false,
      surveysLoaded: false,
      plotsDb: null,
      surveysDb: null,
      storeWatcher: function () {}
    }
  },
  mounted () {
    this.plotsDb = new PouchDbService('plots')
    this.surveysDb = new PouchDbService('surveys')
    this.createWatcher()
    this.refreshOngoing()
  },
  activated () {
    this.createWatcher()
    this.refreshOngoing()
  },
  deactivated () {
    this.removeWatch()
  },
  methods: {
    refreshOngoing () {
      const that = this
      this.surveysLoaded = this.plotsLoaded = false

      this.plotsDb.createIndex('plots', this.plotsDb.indexObj).then(function (result) {
        that.getCurrentPlots(that.plotsDb.findObj)
      })
      this.surveysDb.createIndex('surveys', this.surveysDb.indexObj).then(function (result) {
        that.getCurrentSurvey(that.surveysDb.findObj)
      })
    },
    createWatcher () {
      this.removeWatch()
      this.storeWatcher = this.$store.watch(state => state.ongoingPlots, (newValue, oldValue) => {
        this.check4OngoingPlots()
      })
    },
    removeWatch () {
      this.storeWatcher()
    },
    check4OngoingPlots () {
      if (this.treeSelection && this.$store.state.ongoingPlots.length > 0) this.$router.push({ name: 'dashboard' })
    },
    getCurrentPlots (findObj) {
      const that = this
      this.plotsDb.find(findObj).then(function (result) {
        that.plots = result.docs
      }).then((res) => {
        that.plotsLoaded = true
      })
    },
    getCurrentSurvey (findObj) {
      const that = this
      this.surveysDb.find(findObj).then(function (result) {
        let plotIdArray = []
        result.docs.forEach((element) => {
          plotIdArray.push(element.parentId)
        })

        that.$store.commit('setOngoingPlots', plotIdArray)

        let surveysIdArray = []
        result.docs.forEach((element) => {
          surveysIdArray.push(element._id)
        })

        that.$store.commit('setOngoingSurveys', surveysIdArray)
        that.surveys = result.docs
      }).then((res) => {
        that.surveysLoaded = true
      })
    },
    addTreeFn () {
      const that = this
      if (this.treeSelection) {
        if (this.$store.state.ongoingSurveys.length > 0) {
          that.$router.push({ path: '/dashboard' })
        } else if (this.treeSelection === 'new') { this.$router.push({ path: '/plot/add' }) } else {
          HelperService.createSurveyStart(this.treeSelection).then((res) => {
            that.$router.push({ path: '/plot/' + that.treeSelection + '/survey/' + res.id + '/tree/add' })
          })
        }
        return
      }
      if (this.plots.length === 0) {
        this.$router.push({ path: '/plot/add' })
      } else if (this.$store.state.ongoingSurveys.length) {
        this.$router.push({ path: '/plot/' + this.$store.state.ongoingPlots[0] + '/survey/' + this.$store.state.ongoingSurveys[0] + '/tree/add' })
      } else {
        this.$router.push({ path: '/plots' })
      }
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
