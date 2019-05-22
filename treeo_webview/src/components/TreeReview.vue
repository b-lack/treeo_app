<template>
  <div class="of-review-wrapper" v-if="rows.length">
    <div
      v-for="row in rows"
      :key="row._id"
      @click="toImage(row._id)"
    >
      <img :src="row.local_image"/>
    </div>
  </div>
</template>

<script>
import PouchDbService from '../service/pouchDbService'
import AuthService from '../service/authService'

export default {
  props: [],
  data () {
    return {
      rows: []
    }
  },
  mounted () {
    this.treesDb = new PouchDbService('trees')

    this.treesDb.createIndex('', this.treesDb.byParentIndex).then(() => {
      this.update()
    })
  },
  activated () {
    this.farmer_id = AuthService.getProfile().id
    this.findObj = {
      selector: {
        'created_at': { $gt: true },
        'parentId': { $eq: this.$route.params.surveyId },
        'farmer_id': { $eq: this.farmer_id }
      },
      sort: [{ created_at: 'desc' }],
      limit: 1
    }

    this.update()
  },
  deactivated () {
  },
  methods: {
    toImage (id) {
      this.$Helper.routeChild(this.$route, id)
    },
    update () {
      this.rows.splice(0, this.rows.length)
      this.getLastImage()
    },
    getLastImage () {
      const that = this
      this.treesDb.find(this.findObj).then(function (result) {
        that.rows = result.docs
      })
    }
  }
}
</script>
<style>
.of-review-wrapper{
  position:fixed;
  z-index: 5;
  right: 12px;
  bottom: 98px;

}
.of-review-wrapper > * {
  border: 2px solid #fff;
  min-width: 50px;
  min-height: 50px;
}
.of-review-wrapper img{
  width: 100px;
  display: block;
}
</style>
