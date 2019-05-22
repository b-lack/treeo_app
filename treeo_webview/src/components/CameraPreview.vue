<template>
  <div>
    <div >
      <canvas ref="canvas"></canvas>
    </div>
  </div>
</template>
<script>
import resizeBase64 from 'resize-base64'
export default {
  data: () => ({
    camerastatus: true,
    started: false,
    startedCount: 0,
    options: {},
  }),
  activated: function () {
    this.start()
  },
  mounted: function () {
    const that = this

    if (typeof window.CameraPreview !== 'undefined') {
      this.options = {
        x: 0,
        y: 0,
        width: window.screen.width,
        height: window.screen.height,
        camera: window.CameraPreview.CAMERA_DIRECTION.BACK,
        toBack: true,
        tapPhoto: false,
        tapFocus: false,
        previewDrag: false
      }
    }
  },
  destroyed: function () {
    this.stop()
  },
  deactivated: function () {
    this.stop()
  },
  methods: {
    show: function () {
      this.camerastatus = true

      if (typeof window.CameraPreview !== 'undefined') {
        window.CameraPreview.show()
      }
    },
    hide: function () {
      this.camerastatus = false

      if (typeof window.CameraPreview !== 'undefined') {
        window.CameraPreview.hide()
      }
    },
    snapshotResize (imageObj, width, height) {
      var canvas = document.createElement('canvas')
      var ctx = canvas.getContext('2d')
      var xStart = 0
      var yStart = 0
      var aspectRadio
      var newWidth
      var newHeight

      canvas.width = width
      canvas.height = height

      aspectRadio = imageObj.height / imageObj.width

      if (imageObj.height < imageObj.width) {
        aspectRadio = imageObj.width / imageObj.height
        newHeight = height
        newWidth = aspectRadio * height
        xStart = -(newWidth - width) / 2
      } else {
        newWidth = width
        newHeight = aspectRadio * width
        yStart = -(newHeight - height) / 2
      }

      ctx.drawImage(imageObj, xStart, yStart, newWidth, newHeight)

      return canvas.toDataURL('image/jpeg', 0.75)
    },
    resizeCrop (src, width, height) {
      var crop = width === 0 || height === 0

      if (src.width <= width && height === 0) {
        width = src.width
        height = src.height
      }

      if (src.width > width && height === 0) {
        height = src.height * (width / src.width)
      }

      var xscale = width / src.width
      var yscale = height / src.height
      var scale = crop ? Math.min(xscale, yscale) : Math.max(xscale, yscale)

      var canvas = document.createElement('canvas')
      canvas.width = width || Math.round(src.width * scale)
      canvas.height = height || Math.round(src.height * scale)
      canvas.getContext('2d').scale(scale, scale)

      canvas.getContext('2d').drawImage(src, ((src.width * scale) - canvas.width) * -0.5, ((src.height * scale) - canvas.height) * -0.5)
      return canvas.toDataURL()
    },
    resizeImage (base64Str, maxWidth, maxHeight, successFn) {
      var img = new Image()

      img.onload = function () {
        var canvas = document.createElement('canvas')
        var MAX_WIDTH = maxWidth
        var MAX_HEIGHT = maxHeight
        var width = img.width
        var height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }
        canvas.width = maxWidth
        canvas.height = maxHeight
        var ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, maxWidth, maxHeight)
        successFn(canvas.toDataURL())
      }
      img.src = base64Str
    },
    getPicture: function (successFn) {
      const that = this

      if (typeof window.CameraPreview !== 'undefined') {
        window.CameraPreview.takePicture({ width: 224, height: 224, quality: 95 }, function (base64PictureData) {
          let image = new Image()
          image.onload = function (e) {
            successFn(that.snapshotResize(image, 224, 224), 'data:image/jpeg;base64,' + base64PictureData)
          }
          image.src = 'data:image/jpeg;base64,' + base64PictureData
        })
      }
    },
    stop: function () {
      this.hideBackground(false)

      if (typeof window.CameraPreview !== 'undefined') {
        window.CameraPreview.stopCamera()
      }

      this.started = false
    },
    hideBackground (hide) {
      let element = document.getElementById('app')
      if (hide) {
        element.classList.add('of-camera-preview')
      } else {
        element.classList.remove('of-camera-preview')
      }
    },
    start: function () {
      if (this.started) return

      this.hideBackground(true)

      if (typeof window.CameraPreview !== 'undefined') {
        window.CameraPreview.startCamera(this.options)
      }

      this.started = true
    }
  }
}
</script>

<style>
  .of-cam-canvas{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
  .of-display-cam{
    visibility: hidden;
  }
  .of-center-progress{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .application.of-camera-preview{
    background-color: transparent !important;
  }
</style>
