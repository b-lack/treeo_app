<template>
  <v-radio-group class="of-radio-group" v-model="selection">
  <v-container fluid>

    <v-card
      v-for="row in rowsData"
      :key="row._id"
      class=" mb-2"
      :class="{'white--text': $store.state.ongoingPlots.indexOf(row._id) !== -1}"
      style="color: blue-grey"
      :dark="$store.state.ongoingPlots.indexOf(row._id) !== -1"
      @click.native="selectRowAction(row._id)"
      >
        <v-layout>
          <v-flex>
            <v-container>
              <v-layout>
                <v-flex class="of-nogrow" v-if="showAction">
                    <v-radio color="primary" :value="row._id" class="mr-1"></v-radio>
                </v-flex>
                <v-flex class="of-nogrow" v-if="!showAction && $store.state.ongoingPlots.indexOf(row._id) !== -1">
                  <v-progress-circular
                    indeterminate
                    color="white"
                    :size="16"
                    :width="1"
                    left
                    class="mr-3"
                  ></v-progress-circular>
                </v-flex>
                <v-flex>
                    <div class="headline">Plot {{ row.name || row.id || 'new'}}</div>
                </v-flex>
                <v-spacer></v-spacer>
                <!--<v-flex v-if="" class="of-nogrow">
                  <div class="body-1">- m away</div>
                </v-flex>-->
              </v-layout>
              <v-layout>
                <div class="subheading">
                  <LookUpValue :id="row.species_id" endpoint="species/all"/>
                  <span v-if="row.planting_date">, {{ row.planting_date | moment("YYYY-MM") }}</span>
                </div>
              </v-layout>
            </v-container>
          </v-flex>
        </v-layout>

        <v-divider></v-divider>
        <div class="pl-2 ma-1 grey--text">
          {{$t('label.created')}}: {{ row.created_at | moment("YYYY-MM-DD, h:mm:ss a") }}
        </div>
      </v-card>
      <v-card v-if="showAction" class=" mb-2" @click.native="selectRowAction('new')">
          <v-layout>
            <v-flex>
              <v-container>
                <v-layout>
                  <v-flex class="of-nogrow" v-if="showAction">
                      <v-radio color="primary" value="new" class="mr-1"></v-radio>
                  </v-flex>

                  <v-flex>
                      <div class="headline">{{$t('page.plotAdd.title')}}</div>
                  </v-flex>

                </v-layout>

              </v-container>
            </v-flex>
          </v-layout>
        </v-card>
        <AddTreeBtn v-if="showAction" :treeSelection="selection"/>

      <v-dialog
        v-model="stopServeyDialog"
        max-width="400"
      >
        <v-card>
          <v-card-title class="headline primary" primary-title>
            <span class="white--text">{{$t('dialog.quitSurvey.title')}}</span>
          </v-card-title>

          <v-card-text class="text-xs-center">
            {{$t('dialog.quitSurvey.text')}}
          </v-card-text>

          <v-card-actions>

            <v-btn
              @click="stopServeyDialog=false"
              :disabled="loading"
              flat
            >
              {{$t('dialog.quitSurvey.disagree')}}
            </v-btn>

            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :disabled="loading"
              :loading="loading"
              @click="stopSurvey()"
            >
              {{$t('dialog.quitSurvey.agree')}}
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-dialog>

  </v-container>
  </v-radio-group>
</template>

<script>

import LookUpValue from '../components/LookUpValue'
import HelperService from '../service/helperService'

import AddTreeBtn from '../components/AddTreeBtn'

export default {
  name: 'ListPlots',
  components: {
    LookUpValue,
    AddTreeBtn
  },
  props: [
    'rowsData', 'db', 'showAction'
  ],
  data: () => ({
    loading: false,
    stopServeyDialog: false,
    selection: null
  }),
  mounted () {
    this.autoSelect()
  },
  activated () {
    this.autoSelect()
  },
  methods: {
    autoSelect () {
      if (this.showAction && this.$store.state.ongoingPlots.length > 0) this.$router.push({ name: 'dashboard' })

      this.selection = this.rowsData[0]._id
    },
    selectRowAction (value) {
      this.selection = value
      if (!this.showAction) {
        this.$router.push({ path: '/plot/' + value })
      }
    },
    stopSurvey () {
      HelperService.endSurvey(this.$store.state.ongoingSurveys[0], () => {
        this.stopServeyDialog = false
        this.$router.push({ path: '/dashboard' })
      })
    },
    addTreeFn (plotId) {
      const that = this

      const createSurveyResponse = HelperService.createSurveyStart(plotId)
      createSurveyResponse.then(function (res) {
        that.$store.commit('setOngoingPlots', [plotId])
        that.$store.commit('setOngoingSurveys', [res.id])
        that.$router.push({ path: '/plot/' + plotId + '/survey/' + res.id + '/tree/add' })
      }).then(function () {
        that.loading = false
      })
    }
  }
}

</script>
<style>
.of-nogrow{
  flex-grow: 0;
}
.v-input__control{
  width: 100% !important;
}
.v-input--radio-group{
  margin-top: 0;
}
.of-radio-group .v-messages{
  display: none;
}
.of-radio-group .v-input__slot{
  margin:0 !important;
}
</style>
