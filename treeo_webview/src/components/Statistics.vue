<template>
  <v-container>
    <v-card>
      <v-layout row wrap>
        <v-flex xs6>
          <div>
            <v-card-text>
              {{$t('page.statistics.treesCount')}}<br/>
              <span class="of-cal-result">{{trees}}</span>
            </v-card-text>
          </div>
        </v-flex>
        <v-flex xs6>
          <div>
            <v-card-text>
              {{$t('page.statistics.volume')}}<br/>
              <span class="of-cal-result">{{outputVolume}}</span>
              <span class="of-cal-unit">m³</span>
            </v-card-text>
          </div>
        </v-flex>

        <v-flex xs12>
          <div>
            <v-card-text class="pt-0">
              {{$t('page.statistics.value')}}<br/>
              <v-layout>
                <v-flex shrink class="of-cal-result">
                  {{outputCalculatedValueLow}}
                </v-flex>
                <v-flex shrink class="of-cal-border of-cal-border-start"></v-flex>
                <v-flex grow>
                  <v-layout column class="of-cal-rage-wrapper">
                    <v-flex grow></v-flex>
                    <v-flex shrink class="of-cal-range"></v-flex>
                    <v-flex grow></v-flex>
                  </v-layout>
                </v-flex>
                <v-flex shrink class="of-cal-border of-cal-border-end"></v-flex>
                <v-flex shrink class="of-cal-result">
                  {{outputCalculatedValueHigh}}
                </v-flex>
              </v-layout>
            </v-card-text>
          </div>
        </v-flex>
      </v-layout>
    </v-card>
  </v-container>
</template>

<script>

import PouchDbService from '../service/pouchDbService'
import AuthService from '../service/authService'
import Vue from 'vue'

export default {
  props: [
    'parentId'
  ],
  components: {
  },

  data () {
    return {
      volume: 0,
      outputVolume: '0',
      trees: 0,
      value: 600000,
      calculatedValue: 0,
      outputCalculatedValueHigh: '0',
      outputCalculatedValueLow: '0',
      values: {
        20: 100000,
        30: 250000,
        40: 500000
      },
      rows: [],
      range: 0.2
    }
  },
  watch: {
    calculatedValue: function (newValue) {
      let _range = newValue * this.range
      const valueHigh = Math.round( (newValue + _range) / 1000000 )
      const valueLow = Math.round( (newValue - _range) / 1000000 )
      const resultHigh = valueHigh.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      const resultLow = valueLow.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

      Vue.nextTick(() => {
        this.outputCalculatedValueHigh = resultHigh + ' jt'
        this.outputCalculatedValueLow = resultLow + ' jt'
      })
    },
    volume: function (newValue) {
      const result = Math.round(newValue).toString().replace(/\D/g, '')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      Vue.nextTick(() => {
        this.outputVolume = result
      })
    }
  },
  mounted: function () {
    this.plotsDb = new PouchDbService('plots')
    this.surveysDb = new PouchDbService('surveys')
    this.treesDb = new PouchDbService('trees')
    this.init()
  },
  activated: function () {
    this.farmer_id = AuthService.getProfile().id
    this.init()
  },
  methods: {
    init () {
      this.rows.splice(0, this.rows.length - 1)

      if (!this.parentId) {
        this.getPlots()
      } else {
        this.getPlot(this.parentId)
      }
    },
    getPlot (parentId) {
      const that = this
      that.getSurveys([parentId]).then((result) => {
        return that.getTrees(that.createIdArrayFromArray(result))
      }).then(result => {
        let trees = []
        result.forEach((element, index) => {
          trees = [...trees, ...element.docs]
        })
        that.volume = that.calVolume(trees)
        that.trees = trees.length
      })
    },
    getPlots () {
      const that = this
      this.plotsDb.getAll().then(function (result) {
        return that.getSurveys(that.createIdArray(result.docs))
      }).then((result) => {
        return that.getTrees(that.createIdArrayFromArray(result))
      }).then(result => {
        let trees = []
        result.forEach((element, index) => {
          trees = [...trees, ...element.docs]
        })
        that.volume = that.calVolume(trees)
        that.trees = trees.length
      })
    },
    createIdArray (docs) {
      let ids = []
      docs.forEach((element, index) => {
        ids.push(element._id)
      })
      return ids
    },
    createIdArrayFromArray (docsArray) {
      let ids = []
      docsArray.forEach((element, index) => {
        if (element.docs.length) { ids.push(element.docs[0]._id) }
      })
      return ids
    },
    calVolume (trees) {
      let dbh_cm = 0; let mean_dbh_cm = 0; let tree_dbh_cm = 0; let tree_volume = 0; let volume = 0; let height = 0; let tree_value = 0
      const formfactor = 0.5

      this.calculatedValue = 0

      trees.forEach((element, index) => {
        tree_dbh_cm = parseFloat(element.dbh_cm)

        height = 1.3 + 31.028 * Math.pow((1 - Math.exp(-0.039 * tree_dbh_cm)), 0.854)

        tree_volume = 2 * Math.PI * Math.pow(((tree_dbh_cm / 100)/2), 2) * height * formfactor
        volume += tree_volume

        if (tree_dbh_cm < 20) tree_value = 0
        else if (tree_dbh_cm >= 20 && tree_dbh_cm < 30) tree_value = 100000 * tree_volume
        else if (tree_dbh_cm >= 30 && tree_dbh_cm < 40) tree_value = 250000 * tree_volume
        else if (tree_dbh_cm >= 40) tree_value = 500000 * tree_volume

        this.calculatedValue += tree_value
      })

      // mean_dbh_cm = dbh_cm/trees.length;

      return volume
    },
    getSurvey (parentId) {
      const that = this
      let findObj = {
        selector: {
          'created_at': { $gt: null },
          'parentId': { $eq: parentId },
          'farmer_id': { $eq: this.farmer_id }
        },
        sort: [{ created_at: 'desc' }]
      }
      return this.surveysDb.createIndex(this.surveysDb, this.surveysDb.byParentIndex).then(function (result) {
        return that.surveysDb.find(findObj)
      })
    },
    getSurveys (parentIds) {
      let promises = []

      parentIds.forEach((element, index) => {
        promises.push(this.getSurvey(element))
      })
      return Promise.all(promises)
    },
    getTree (parentId) {
      const that = this
      let findObj = {
        selector: {
          'created_at': { $gt: null },
          'parentId': { $eq: parentId },
          'farmer_id': { $eq: this.farmer_id }
        },
        sort: [{ created_at: 'desc' }]
      }
      return this.treesDb.createIndex(this.treesDb, this.treesDb.byParentIndex).then(function (result) {
        return that.treesDb.find(findObj)
      })
    },
    getTrees (parentIds) {
      let promises = []
      let findObj = Object.assign({}, this.surveysDb.byParent)
      delete findObj.limit

      parentIds.forEach((element, index) => {
        promises.push(this.getTree(element))
      })
      return Promise.all(promises)
    }
  }
}
</script>
<style>
.of-cal-result{
  font-size: 35px;
}
.of-cal-unit{
  padding-left: 10px;
}
.of-cal-range{
  background: #000;
  height: 3px;
  border:none;
}
.of-cal-border{
  background: #000;
  width: 3px;
  border:none;
  margin: 15px 10px 15px 0;
}
.of-cal-border-start{
  margin: 15px 0 15px 10px;
}
.of-cal-rage-wrapper{
  height: 100%;
}
</style>
