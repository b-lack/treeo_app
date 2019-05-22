<template>
  <div>
    <div v-if="rows.length == 0 && !loading" class="of-loading-indicator">
      <div class="text-xs-center">
        <v-icon>inbox</v-icon><br/>
        {{ $t('label.noDataFound')}}
      </div>
    </div>
    <div v-if="loading" class="of-loading-indicator">
      <div class="text-xs-center">
        <v-progress-circular
          indeterminate
          color="primary"
          width="2"
        ></v-progress-circular><br/>
        {{ $t('label.loading')}}
      </div>
    </div>
    <v-layout column v-if="(layout=== 'list' || !layout)">
      <ListSurveys v-if="db=='surveys' && rows.length" :rowsData="rows" :showAction="showAction"/>
      <ListTrees v-if="db=='trees' && rows.length" :rowsData="rows" :showAction="showAction"/>
      <ListPlots v-if="db=='plots' && rows.length" :db="db" :rowsData="rows" :showAction="showAction"/>
    </v-layout>
  </div>
</template>

<script>

import PouchDbService from '../service/pouchDbService'
import AuthService from '../service/authService'

import ListPlots from '../components/ListPlots'
import ListSurveys from '../components/ListSurveys'
import ListTrees from '../components/ListTrees'

export default {
  name: 'List',
  components: {
    ListPlots,
    ListSurveys,
    ListTrees
  },
  props: [
    'db',
    'parentId',
    'limit',
    'layout',
    'name',
    'showAction'
  ],
  data: function () {
    return {
      database: 0,
      rows: [],
      farmer_id: null,
      loading: false,
      lastParentId: null
    }
  },
  mounted: function () {
    this.database = new PouchDbService(this.db)
    this.searchResults()
  },
  activated: function () {
    this.refresh()
  },
  computed: {
    sortedRows: function () {
      let _rows = this.rows.slice()
      _rows.sort((a, b) => {
        return b.created_at - a.created_at
      })
      return _rows
    }
  },
  methods: {
    refresh () {
      this.allDocsByParentId(this.parentId)
    },
    searchResults: function () {
      const that = this

      const indexObj = {
        index: {
          fields: [
            'created_at',
            'parentId',
            'farmer_id'
          ],
          name: 'byCreation'
        }
      }

      if (this.db === 'trees') {
        indexObj.index.name = 'byTimestamp'
        indexObj.index.fields[0] = 'timestamp'
      }

      return this.database.createIndex(this.db, indexObj).then(function (result) {
        that.allDocsByParentId(that.parentId)
      }).then(() => {
        this.loading = false
      })
    },
    allDocsByParentId: function (parentId) {
      const that = this
      let parent; let findObj; let _farmer_id = AuthService.getProfile().id

      if (this.parentId !== this.lastParentId || this.farmer_id !== _farmer_id) {
        this.loading = true
        that.rows.splice(0, that.rows.length)
      }
      this.lastParentId = this.parentId
      this.farmer_id = _farmer_id

      findObj = {
        selector: {
          'created_at': { $gt: null },
          'parentId': { $eq: parentId },
          'farmer_id': { $eq: this.farmer_id }
        },
        sort: [{ created_at: 'desc' }]
      }
      if (this.limit) findObj.limit = parseInt(this.limit)
      if (this.db === 'trees') {
        findObj = {
          selector: {
            'timestamp': { $gt: null },
            'parentId': { $eq: parentId },
            'farmer_id': { $eq: this.farmer_id }
          },
          sort: [{ timestamp: 'desc' }]
        }
      }
      this.database.find(findObj, { attachments: true }).then(function (result) {
        that.rows.splice(0, that.rows.length)
        that.rows = result.docs
      }).then(() => {
        that.loading = false
      })
    }
  }
}
</script>

<style>
.of-dash-card{
  height: calc(50vw - 24px);
}
.of-loading-indicator{
  margin-top: 100px;
}
</style>
