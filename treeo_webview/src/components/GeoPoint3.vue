<template>
  <v-dialog
    v-model="localicationAllowed"
    max-width="400"
    persistent
  >
    <v-card>
      <v-card-title class="headline primary" primary-title>
        <span class="white--text">{{$t('dialog.gps.error')}}</span>
      </v-card-title>

      <v-card-text>
        <v-alert
          :value="true"
          type="error"
          v-if="error.message"
        >
          {{error.message}}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="primary"
          @click="localicationAllowed=false; $router.push({ path: '/dashboard' });"
        >
          Back
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="localicationAllowed=false; startWatching();"
        >
          Retry
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import GeoService from '../service/geoService'

export default {
  props: ['value', 'entryId', 'type', 'dialog'],
  data () {
    return {
      intvalue: {},
      position: null,
      error: {},
      status: 0,
      points: [],
      watching: false,
      loading: false,
      localicationAllowed: false,
      watchId: null,
      mounted: false,
      storeWatcher: null
    }
  },
  mounted () {
    this.init()
    this.checkDevice()
  },
  activated () {
    if (!this.entryId) {
      this.init()
      if (!this.mounted) { this.checkDevice() }
    }
    if (typeof CameraPreview === 'undefined') {
      // this.isLocal = true;
      this.intvalue.geometry.coordinates = [14.24293709, 47.8854367]
      this.save()
    }
  },
  deactivated () {
    this.stopWatching()
    this.reset()
  },
  methods: {
    checkDevice () {
      const that = this
      if (this.$store.state.deviceReady) {
        this.startWatching()
      } else {
        this.storeWatcher = this.$store.watch(state => state.deviceReady, (newValue, oldValue) => {
          that.startWatching()
          that.storeWatcher()
        })
      }
    },
    init (data) {
      if (!data) {
        this.intvalue = {
          'type': 'Feature',
          'geometry': {
            'type': this.type,
            'coordinates': [
              []
            ]
          },
          'properties': {
          }
        }
      } else { this.intvalue = data }
    },
    reset () {
      this.position = null
      this.status = 0

      if (this.type === 'Polygon') { this.intvalue.geometry.coordinates.splice(0, this.intvalue.geometry.coordinates.length) } else if (this.type === 'Point') { this.intvalue.geometry.coordinates.length = 0 }
    },
    savePoint (position) {
      if (this.type === 'Polygon') {
        if (this.intvalue.geometry.coordinates[0].length) {
          this.intvalue.geometry.coordinates[0].splice(-1, 0, [this.position.coords.longitude, this.position.coords.latitude])
        } else {
          this.intvalue.geometry.coordinates[0].push([this.position.coords.longitude, this.position.coords.latitude])
          this.intvalue.geometry.coordinates[0].push([this.position.coords.longitude, this.position.coords.latitude])
        }
      } else if (this.type === 'Point') {
        this.intvalue.properties.accuracy = position.coords.accuracy
        this.intvalue.geometry.coordinates = [this.position.coords.longitude, this.position.coords.latitude]
      }
      this.position = null
      this.status = 0
      this.save()
    },
    deletePoint (index) {
      if (this.intvalue.geometry.coordinates[0].length <= 2) {
        this.reset()
        return
      }

      this.intvalue.geometry.coordinates[0].splice(index, 1)

      this.save()
    },
    save () {
      let geoJson = Object.assign({}, this.intvalue)
      this.$emit('input', geoJson)
    },
    saveClose () {
      this.save()
    },
    getCurrentPosition () {
      const that = this
      navigator.geolocation.getCurrentPosition(
        (position) => { that.setCoordinates(position) },
        (error) => { that.setError(error) },
        { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }
      )
    },
    startWatching () {
      const that = this
      this.watching = true
      GeoService.clearWatch(this.watchId)
      this.watchId = GeoService.watchPosition((position) => {
        that.setCoordinates(position)
      }, (error) => {
        that.setError(error)
      })
    },
    setError (error) {
      if (this.dialog) { this.localicationAllowed = true }
      this.error = error
      this.stopWatching()
    },
    setCoordinates (position) {
      if (!this.position || !this.position.accuracy) {
        this.position = position
      }
      if (this.type === 'Point') {
        this.savePoint(position)
      }
    },
    checkAccuracy (accuracy) {
      if (accuracy <= 50) { this.status = 1 }
      if (accuracy <= 200000) { this.status = 4 }
    },
    stopWatching () {
      this.watching = false
      GeoService.clearWatch(this.watchId)
    }
  }
}
</script>

<style>
.of-geopoint_navi{
  position:absolute;
  z-index: 2;
  right: 0;
  margin-top: -100px;
}
</style>
