<template>
  <div>
    <v-card class="elevation-0">
      <v-img
        :src="detail.local_image"
        v-if="detail.local_image"
      ></v-img>
      <v-img
        :src="basePath + detail.image"
        v-if="detail.image"
      ></v-img>
      <div class="grey--text pa-2 ml-2">{{ detail.timestamp | moment("YYYY-MM-DD, h:mm:ss a") }}</div>
       <v-card-title primary-title>
           <v-flex xs6>
             <div color="secondary">
               <span class="grey--text"><v-icon>space_bar</v-icon> {{ $t('label.diameter')}}</span>
               <div class="headline">{{ detail.dbh_cm }} cm</div>
             </div>
           </v-flex>
           <v-flex xs6>
             <div color="secondary">
               <span class="grey--text"><v-icon size="16">nature</v-icon> {{$t('page.plot.labels.species')}}</span>
               <div class="headline">{{detail.species}}</div>
             </div>
           </v-flex>

           <v-flex xs6>
             <div color="secondary">
               <span class="grey--text"><v-icon>location_on</v-icon> {{ $t('label.accuracy')}}</span>
               <div class="headline">{{ Math.round(detail.accuracy) }} m</div>
             </div>
           </v-flex>
           <v-flex xs6 v-if="detail.height_m">
             <div color="secondary">
               <span class="grey--text"><v-icon size="16">swap_vert</v-icon> {{$t('label.height')}}</span>
               <div class="headline">{{ Math.round(detail.height_m*100)/100}} m</div>
             </div>
           </v-flex>

         <div>
         </div>
       </v-card-title>
       <v-card-text v-if="!detail.id">
         <v-btn
           color="error"
           block
           outline
           flat
           @click="deleteDialog = true"
         >
           {{ $t("dialog.deleteTree.agree") }} <v-icon right>delete</v-icon>
         </v-btn>
       </v-card-text>
     </v-card>
     <v-dialog
        v-model="deleteDialog"
        max-width="290"
      >
        <v-card>
          <v-card-title class="headline primary white--text" primary-title>{{ $t("dialog.deleteTree.title") }}</v-card-title>

          <v-card-text>
            {{ $t("dialog.deleteTree.text") }}
          </v-card-text>

          <v-card-actions>

            <v-btn
              color="primary"
              flat="flat"
              @click="deleteDialog = false"
            >
              {{ $t("dialog.deleteTree.disagree") }}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              @click="deleteEntry"
            >
              {{ $t("dialog.deleteTree.agree") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
   </div>
</template>

<script>
import router from '../router'
import PouchDbService from '../service/pouchDbService'

export default {
  props: [
    'dbName',
    'entryId'
  ],
  data () {
    return {
      detail: {},
      database: null,
      deleteDialog: false,
      area: null,
      basePath: window.config.base + window.config.squareMedia
    }
  },
  activated: function () {
    this.database = new PouchDbService(this.dbName)
    this.getById(this.entryId)
  },
  methods: {
    showMap: function (geoJsonFeature) {
      let feature = this.$ol.addPolygonToLayer(geoJsonFeature)
      this.$ol.showMap(250)
      this.$ol.focusFeature(feature)
      this.area = this.$ol.getArea(feature)
    },
    getById: function (id) {
      const that = this
      this.database.get(id).then(function (response) {
        that.detail = response
      })
    },
    deleteEntry: function () {
      const that = this
      this.$file.deleteFileByUrl(this.detail.local_image).then(() => {
        return that.database.remove(that.detail)
      }).then(function (response) {
        if (response.ok) router.go(-1)
        that.deleteDialog = false
      }).catch(function (err) {
        that.deleteDialog = false
      })
    }
  }
}
</script>

<style>
.of-sec-btn{
  right: 70px;
}
</style>
