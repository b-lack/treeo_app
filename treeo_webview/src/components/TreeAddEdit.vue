<template>
  <div class="of-has-bottom-nav">
    <v-form ref="form" v-model="valid" lazy-validation>
      <CameraPreview ref="CanvasRef" class="of-canvas-camera"/>
      <div class="of-frame-wrapper">
        <div class="of-frame-top"></div>
        <div class="of-frame-bottom"></div>
      </div>
      <TreeReview ref="ReviewRef"/>

      <v-text-field
        v-model.trim="$v.formContent.diameter.$model"
        label="Diameter"
        type="number"
        required
        class="of-hidden-form"
      ></v-text-field>

      <GeoPoint3 ref="geoPoint" v-model="$v.formContent.feature.$model" :entryId="id" :camerastatus="cameraStatus" type="Point" :dialog="true" />

      <div class="of-camera-control pa-3">
        <v-btn block color="primary" :loading="computing" :disabled="(loading || computing || successDialog || formContent.feature.geometry.coordinates.length!=2) && !isLocal" large dark @click="takePicture">
          {{$t('page.addTree.button.measureTree')}}
        </v-btn>
      </div>

    </v-form>
    <v-dialog
      v-model="successDialog"
      max-width="400"
      persistent
    >
      <v-card>

        <v-card-title primary-title :class="[!$v.$invalid ? 'headline primary' : 'headline error']">
          <span class="white--text" v-if="!$v.$invalid">{{$t('dialog.measuredSuccess.title')}}</span>
          <span class="white--text" v-else>{{$t('dialog.measuredSuccess.errorTitle')}}</span>
        </v-card-title>
        <div class="ma-2 mx-5">
          <img class="of-img-preview" ref="imagePreview" :src="imagePreviewUrl"/>
          <img v-if="enableAi" class="of-img-preview" ref="imageAiPreview" :src="imageAiPreviewUrl"/>
        </div>
        <v-card-text class="text-xs-center pa-1">
            <span class="grey--text"><v-icon>space_bar</v-icon> Diameter</span><br/>
            <span class="headline">
              <v-progress-circular
                indeterminate
                :size="16"
                :width="2"
                color="primary"
                v-if="calcDiameter"
              ></v-progress-circular>

              <v-icon v-if="$v.formContent.diameter.$invalid" color="error" class="pr-3">warning</v-icon>
              <span v-if="calcDiameter==false">{{formContent.diameter}}</span> cm
            </span>
        </v-card-text>

        <div v-if="!$v.$invalid">
          <v-divider/>
          <v-card-text class="text-xs-center py-0">
            <v-checkbox color="primary" v-model="hideMeasuredDialog" :label="$t('dialog.measuredSuccess.hideMeasuredDialog')"></v-checkbox>
          </v-card-text>
        </div>

        <v-divider/>
        <v-card-actions>

          <v-btn @click="repeatPicture">
            {{$t('dialog.measuredSuccess.disagree')}}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="saveImage"
            :disabled="$v.$invalid || loading || calcDiameter || $v.formContent.diameter.$invalid"
            :loading="loading"
          >
            {{$t('dialog.measuredSuccess.agree')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="errorDialog"
      max-width="400"
      @input="v => v || repeatPicture()"
    >
      <v-card>
        <v-card-title class="headline primary" primary-title>
          <span class="white--text">{{$t('dialog.errorMsg.title')}}</span>
        </v-card-title>

        <v-card-text class="text-xs-center">
          <v-icon color="error" size="35">warning</v-icon><br/>
          {{errorMsg}}
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="repeatPicture"
            color="primary">
            {{$t('dialog.errorMsg.agree')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="$store.state.surveyDialog"
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
            @click="continueLaterSurvey()"
            :disabled="loading"
            flat
          >
            {{$t('dialog.quitSurvey.disagree')}}
          </v-btn>

          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :disabled="loading || computing"
            :loading="loading || computing"
            @click="stopSurvey()"
          >
            {{$t('dialog.quitSurvey.agree')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import GeoPoint3 from '../components/GeoPoint3'
import CameraPreview from '../components/CameraPreview'
import TreeReview from '../components/TreeReview'

import LocalstorageService from '../service/localstorageService'
import PouchDbService from '../service/pouchDbService'
import AuthService from '../service/authService'
// import FileService from '../service/fileService'

import { validationMixin } from 'vuelidate'
import { required, minLength, between } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  components: {
    GeoPoint3,
    CameraPreview,
    TreeReview
  },
  computed: {
    dataUrl () {
      return 'data:image/png;base64,' + btoa(
        new Uint8Array(this.imagePreviewUrl)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
    },
    diameterErrors () {
      const errors = []

      if (!this.$v.formContent.diameter.$dirty) return errors
      !this.$v.formContent.diameter.required && errors.push(this.$t('form.error-msg.required'))
      !this.$v.formContent.diameter.between && errors.push(this.$t('form.error-msg.diameterBetween'))
      return errors
    }
  },
  props: [
    'db',
    'parentId',
    'id'
  ],
  data: () => ({
    database: null,
    surveyEnd: false,
    storeWatcher: null,
    valid: false,
    successDialog: false,
    errorDialog: false,
    loading: false,
    calcDiameter: false,
    computing: false,
    imagePreviewUrl: null,
    imageAiPreviewUrl: null,
    imagePreviewUrlOrg: null,
    hideMeasuredDialog: false,
    searchingGPS: false,
    cameraStatus: true,
    enableAi: false,
    isLocal: false,
    errorMsg: '',
    formContent: {
      imageBlob: null,
      diameter: null,
      species_id: null,
      feature: {
        geometry: {
          coordinates: []
        },
        properties: {
          accuracy: 0
        }
      }
    }
  }),
  validations () {
    let defaultVal = { formContent: {
      diameter: {
        required,
        between: between(0.5, 1000)
      },
      imageBlob: {
        required
      },
      feature: {
        type: { required },
        geometry: {
          type: { required },
          coordinates: {
            required,
            minLength: minLength(2),
            $each: {
              required
            }
          }
        }
      }
    } }
    if (this.type === 'Point') {
      defaultVal.feature.geometry.coordinates = {
        required,
        between: between(2, 2)
      }
    }
    return defaultVal
  },
  mounted: function () {
    this.database = new PouchDbService(this.db)
    this.plotsDb = new PouchDbService('plots')
    this.updateHideMeasuredDialog()
    if (typeof CameraPreview !== 'undefined') this.isLocal = true
  },
  activated: function () {
    this.updateHideMeasuredDialog()
    this.calcDiameter = false
    this.loading = false
    this.computing = false

    if (this.id) {
      this.clear()

      this.autofill(this.id)
    }
    if (this.parentId) {
      this.formContent.parentId = this.parentId
    }
    this.getTreeSpecies()

    this.enableAi = LocalstorageService.get('enableAi') === 'true'
  },
  deactivated: function () {
    this.clear()
  },
  methods: {
    getTreeSpecies () {
      this.plotsDb.get(this.$route.params.id).then((result) => {
        this.formContent.species_id = result.species_id
      })
    },
    updateHideMeasuredDialog () {
      this.hideMeasuredDialog = LocalstorageService.get('hideMeasuredDialog') === 'true' || false
    },
    saveHideMeasuredDialog () {
      LocalstorageService.set('hideMeasuredDialog', this.hideMeasuredDialog)
    },
    checkChildAndDelete (surveyId) {
      const that = this
      return new Promise((resolve, reject) => {
        let findObj = {
          selector: {
            'created_at': { $gt: null },
            'parentId': { $eq: surveyId },
            'farmer_id': { $eq: that.farmer_id }
          },
          sort: [{ created_at: 'desc' }]
        }
        that.database.createIndex(that.database, that.database.byParentIndex).then(function (result) {
          return that.database.find(findObj)
        }).then((trees) => {
          if (trees.docs.length === 0) {
            this.$Helper.removeSurvey(surveyId).then(() => {
              resolve(true)
            }).catch((error) => {
              resolve(false)
            })
          } else {
            resolve(false)
          }
        })
      })
    },
    continueLaterSurvey () {
      this.toggelSurveyDialog(false)
      this.$router.push({ path: '/dashboard' })
    },
    stopSurvey () {
      this.checkChildAndDelete(this.$route.params.surveyId).then((deleted) => {
        if (deleted) {
          this.$router.push({ path: '/dashboard' })
        } else {
          this.$Helper.endSurvey(this.$route.params.surveyId, () => {
            this.$router.push({ path: '/dashboard' })
          })
        }
      })
    },
    toggelSurveyDialog (set) {
      this.$store.commit('toggelSurveyDialog', set)
    },
    takePicture () {
      this.$refs.CanvasRef.hide()
      this.computing = true
      this.getImage()
    },
    repeatPicture () {
      // this.$refs.geoPoint.getCurrentPosition();
      this.$refs.CanvasRef.show()
      this.errorDialog = false
      this.successDialog = false
      this.computing = false
    },
    autofill (id) {
      const that = this
      this.database.get(id).then(function (response) {
        that.formContent = response
      })
    },

    startAndSubmit () {
      this.formContent.start = Date.now()
      this.submit()
    },
    getImage () {
      const that = this

      this.$refs.CanvasRef.getPicture(function (dataUrl, realimage) { // blob
        that.imagePreviewUrl = dataUrl
        // that.imagePreviewUrlOrg = realimage
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            that.formContent.imageBlob = blob
            that.imgManipulation()
          })
        /* that.formContent.imageBlob = blob;

        const urlCreator = window.URL || window.webkitURL;
        that.imagePreviewUrl = urlCreator.createObjectURL(blob);

        that.imgManipulation(that.hideMeasuredDialog); */
      })
    },
    // PLACE TENSORFLOWJS HERE
    imgManipulation () {
      const that = this
      this.calcDiameter = true

      this.$ai.execute(this.$refs.imagePreview, window.cv, this.$maskToDia, this.enableAi).then((data) => {
        this.calcDiameter = false
        if (data.error) {
          if (data.error.msg) that.errorMsg = data.error.msg
          else that.errorMsg = 'AI Error: Undefined error'
          that.errorDialog = true
        } else if (!data.data) {
          that.errorMsg = 'AI Error: Diameter not found'
          that.errorDialog = true
        } else {
          this.formContent.diameter = Math.round(data.data.diameter * 100) / 100
          this.imageAiPreviewUrl = data.dataUrl
          this.computing = false

          if (that.hideMeasuredDialog && !that.$v.formContent.diameter.$invalid) {
            that.saveImage()
          } else {
            that.successDialog = true
          }
        }
      })
    },
    saveImage () {
      const that = this
      this.loading = true

      this.saveHideMeasuredDialog()

      if (!window.requestFileSystem) {
        that.submit('', true)
        return
      }

      this.$file.saveFile(this.formContent.imageBlob).then((result, filename) => {
        that.submit(result.nativeURL)
      })
    },
    submit (filePath, inDB) {
      const that = this
      let response

      this.$v.$touch()
      if (!this.$v.$invalid) {
        that.loading = true

        if (!this.formContent._id) {
          this.formContent.created_at = Date.now()
        } else {
          this.formContent.updated_at = Date.now()
        }
        this.formContent.userId = AuthService.getUserId()

        if (filePath) { this.formContent.url = filePath }

        let sendData = {
          farmer_id: AuthService.getProfile().id,
          created_at: new Date().toISOString(),
          species_id: this.formContent.species_id,
          dbh_cm: this.formContent.diameter,
          timestamp: new Date().toISOString(),
          parentId: this.formContent.parentId,
          geodata: {
            'type': 'FeatureCollection',
            'features': [this.formContent.feature]
          },
          accuracy: Math.round(this.formContent.feature.properties.accuracy)
        }

        if (inDB) {
          sendData.local_image = 'testbild.jpg'
          sendData.accuracy = 1
        } else {
          sendData.local_image = filePath
        }

        this.database.post(sendData).then(function (response) {
          let isId = that.id ? null : response.id

          that.timeoutClear()
          // that.$refs.geoPoint.getCurrentPosition();
          that.$refs.CanvasRef.show()
          that.$refs.ReviewRef.update()
          // that.$router.push({ path: that.$Helper.routeChild(that.$route) });
        }).then(function () {
          that.loading = false
          that.successDialog = false
        })
      }
    },
    /*
    0: 14.2370233
    1: 47.8891489
    */
    timeoutClear () {
      window.setTimeout(_ => {
        this.clear()
      }, 1000)
    },
    clear () {
      this.$refs.form.reset()
      this.formContent.feature.geometry.coordinates.splice(0, 2)
      this.formContent.feature.properties.accuracy = 0
      this.formContent.imageBlob = null
      this.formContent.diameter = null
      // this.formContent = {};
    }
  }
}

</script>
<style>
  .of-hidden-form{
    opacity: 0;
  }
  .of-has-bottom-nav{
    margin-bottom: 48px;
  }
  .of-canvas-camera{
    width: 100%;
    height: 100%;
    /*background-color: #fff;*/
    display: block;
    position: absolute;
    left: 0;
    top: -48px;
    z-index: 3;
  }
  .of-camera-control{
    position: fixed;
    width: 100%;
    bottom: 0;
    z-index: 4;

  }
  .of-img-preview{
    width: 100%;
  }
  .of-frame-wrapper{
    /*position: fixed;
    top:0;
    left:0;*/
  }
  .of-frame-wrapper > *{
    position: fixed;
    width: 100%;
    height: calc((100vh - 100vw) / 2 );
    background: rgba(0,0,0,.7);
  }
  .of-frame-wrapper > *.of-frame-top{
    top:0;
  }
  .of-frame-wrapper > *.of-frame-bottom{
    bottom:0;
  }
</style>
