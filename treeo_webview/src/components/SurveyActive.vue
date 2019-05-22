<template>
  <div class="of-servey-status">
    <v-card
      v-for="row in rows"
      :key="row._id"
    >
      <v-container
        fluid
        class="pa-1"
      >
        <v-layout>
          <v-flex>
            <div>

              <v-card-actions>
                <v-spacer/>
                <v-btn flat color="orange" @click="stopDialog = true">Stop Survey</v-btn>
                <v-btn color="primary" @click="$router.push({path:'/plot/' + row.parentId + '/survey/' + row._id + '/tree/add'})">Add Tree</v-btn>
              </v-card-actions>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
      <v-dialog
         v-model="stopDialog"
         max-width="290"
       >
         <v-card>
           <v-card-title class="headline">{{ $t("alert.stopSurveyTitle") }}</v-card-title>
           <v-card-text>
             {{ $t("alert.stopSurveyText") }}
           </v-card-text>
           <v-card-actions>
             <v-spacer></v-spacer>

             <v-btn
               color="primary"
               flat="flat"
               @click="stopDialog = false"
             >
               {{ $t("alert.button.disagree") }}
             </v-btn>
             <v-btn
               color="error"
               flat="flat"
               @click="deActivateSurvey(row)"
             >
               {{ $t("alert.button.agree") }}
             </v-btn>
           </v-card-actions>
         </v-card>
       </v-dialog>
    </v-card>
  </div>
</template>

<script>
import router from '../router'
import PouchDbService from '../service/pouchDbService'
import AuthService from '../service/authService'
import store from '../store'

export default {
  data () {
    return {
      DbFind: {},
      DbIndex: {},
      rows: [],
      stopDialog: false
    }
  },
  activated () {
    const that = this
    this.userId = AuthService.getUserId()

    this.DbIndex = {
      index: {
        fields: [
          'created_at',
          'end',
          'extId',
          'userId'
        ],
        name: 'runningServey'
      }
    }
    this.DbFind = {
      selector: {
        'created_at': { $lte: Date.now() },
        'end': { $exists: false },
        'extId': { $exists: false },
        'userId': { $eq: this.userId }
      }
    }

    this.database = new PouchDbService('surveys')
    this.database.createIndex('surveys', this.DbIndex).then(function (result) {
      that.getCurrentSurvey()
    })
  },
  methods: {
    getCurrentSurvey () {
      const that = this
      this.database.find(this.DbFind).then(function (result) {
        that.$store.commit('setOngoingSurveys', result.docs.length)

        that.rows = result.docs
      })
    },
    deActivateSurvey (row) {
      const that = this

      row.end = Date.now()
      this.database.post(row).then(function () {
        that.getCurrentSurvey()
      }).catch(function () {

      }).then(function () {
        that.stopDialog = false
      })
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
  z-index: 10;
}
</style>
