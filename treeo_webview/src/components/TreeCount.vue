<template>
  <span>
    <v-progress-circular
      indeterminate
      color="primary"
      v-if="loading"
    ></v-progress-circular>
    <span v-else>{{treeCount}}</span>
  </span>
</template>

<script>
import AuthService from '../service/authService'
import PouchDbService from '../service/pouchDbService'

export default {
  props: [
    'parentId'
  ],
  data () {
    return {
      treeCount: 0,
      loading: false,
      db: 'trees'
    }
  },

  created () {
    this.userId = AuthService.getUserId()
    this.database = new PouchDbService(this.db)
    this.databaseSurvey = new PouchDbService('surveys')
    this.getLatestSurvey()
  },
  activated () {
    this.getLatestSurvey()
  },
  methods: {
    getLatestSurvey: function () {
      const that = this
      const indexObj = {
        index: {
          fields: [
            'created_at',
            'parentId',
            'userId'
          ],
          name: 'byCreation'
        }
      }
      this.databaseSurvey.createIndex('surveys', indexObj).then(function (result) {
        that.allSurveyDocsByParentId(that.parentId)
      })
    },
    allSurveyDocsByParentId: function (parentId) {
      const that = this
      let findObj

      this.loading = true

      findObj = {
        selector: {
          'created_at': { $lte: Date.now() },
          'parentId': { $eq: parentId },
          'userId': { $eq: this.userId }
        },
        sort: [{ created_at: 'desc' }],
        limit: 1
      }

      this.databaseSurvey.find(findObj, { attachments: false }).then(function (result) {
        if (result.docs[0]) { that.searchResults(result.docs[0]._id) }
        that.loading = false
      }).catch(function () {
        that.loading = false
      })
    },
    searchResults: function (parentId) {
      const that = this
      const indexObj = {
        index: {
          fields: [
            'created_at',
            'parentId',
            'userId'
          ],
          name: 'byCreation'
        }
      }
      this.database.createIndex(this.db, indexObj).then(function (result) {
        that.allDocsByParentId(parentId)
      })
    },
    allDocsByParentId: function (parentId) {
      const that = this
      let findObj

      this.loading = true

      findObj = {
        selector: {
          'created_at': { $lte: Date.now() },
          'parentId': { $eq: parentId },
          'userId': { $eq: this.userId }
        },
        sort: [{ created_at: 'desc' }]
      }

      this.database.find(findObj, { attachments: false }).then(function (result) {
        that.treeCount = result.docs.length
        that.loading = false
      }).catch(function (err) {
        that.loading = false
      })
    }
  }
}
</script>
