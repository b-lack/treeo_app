<template>
  <div class="text-xs-center" >
    <div class="of-user-picture">
      <v-avatar color="primary" size="100" :key="$store.state.updateToolbar+1">
        <span v-if="!profile.photo && profile.name" class="white--text headline">{{profile.name[0]}}</span>
        <v-img v-else-if="profile.photo" :src="basePath + profile.photo" alt=""/>
      </v-avatar>
      <v-btn class="of-user-picture-camera" :loading="uploading" :disabled="$store.state.netWorkStatus!='wifi'" fab small color="white" v-on:click="takePicture()">
        <v-icon v-if="$store.state.netWorkStatus=='wifi'">photo_camera</v-icon>
        <v-icon v-else>signal_wifi_off</v-icon>
      </v-btn>
    </div>

    <p class="headline mt-5 mb-0" v-if="profile.name">{{profile.name}}</p>
    <p class="grey--text">(id: {{profile.id}})</p>
    <p class="title">{{username}}</p>
  </div>
</template>

<script>
import router from '../router'
import AuthService from '../service/authService'
import ApiService from '../service/apiService'

export default {
  data () {
    return {
      username: null,
      lastLogin: null,
      uploading: false,
      basePath: window.config.base + window.config.squareMedia,
      profile: {
        name: null
      },
      cameraOptions: {}
    }
  },
  mounted () {
    if (typeof window.Camera !== 'undefined') {
      this.cameraOptions = {
        quality: 90,
        destinationType: window.Camera.DestinationType.FILE_URI,
        sourceType: window.Camera.PictureSourceType.CAMERA,
        encodingType: window.Camera.EncodingType.JPEG,
        targetWidth: 500,
        targetHeight: 500,
        allowEdit: false,
        mediaType: window.Camera.MediaType.PICTURE,
        cameraDirection: window.Camera.Direction.BACK,
        correctOrientation: true
      }
    }
  },

  activated: function () {
    this.basePath = window.config.base + window.config.squareMedia

    if (this.$store.state.netWorkStatus === 'wifi') {
      AuthService.getLoggedInProfile()
    }

    this.profile = AuthService.getProfile()
    this.username = AuthService.getUserId()
  },
  methods: {
    refreshProfile: function () {
      const that = this
      AuthService.getLoggedInProfile().then(() => {
        that.profile = AuthService.getProfile()
      })
    },
    takePicture: function (event) {
      const that = this

      if (!navigator.camera) return

      navigator.camera.getPicture((picture) => {
        that.$file.resolve(picture, function (entry) {
          that.getPicture(entry)
        })
      }, () => {}, this.cameraOptions)
    },
    fixBinary (bin) {
      var length = bin.length
      var buf = new ArrayBuffer(length)
      var arr = new Uint8Array(buf)
      for (var i = 0; i < length; i++) {
        arr[i] = bin.charCodeAt(i)
      }
      return buf
    },
    createBlob (data, type) {
      let binary = this.fixBinary(atob(data))
      return new Blob([binary], { type: type })
    },
    getPicture: function (file) {
      const that = this
      // let fileService = this.fileService;

      this.uploading = true

      return file.file((file) => {
        that.$file.readFile(file).then((result) => {
          let splittet = result.split(',')

          let blob = that.createBlob(splittet[1], file.type)
          return ApiService.send('farmerPhoto', {}, { photo: blob })
        }).then(() => {
          that.refreshProfile()
        }).then(() => {
          that.uploading = false
        })
      }, (error) => {
        that.uploading = false
      })
    }
  }
}
</script>
<style>
.of-user-picture{
  position: relative;
  width: 100px;
  display: inline-block;
}
.of-user-picture-camera{
  position: absolute !important;
  bottom: -20px;
  right: -20px;
}
</style>
