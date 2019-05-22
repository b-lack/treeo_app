import * as tf from '@tensorflow/tfjs'
import { fetch as fetchPolyfill } from 'whatwg-fetch'

const MODEL_INTERN_URL = 'treeoTfjsModel/model.json'

class AiService {
  constructor () {
    this.dimensions = { width: 224, height: 224 }
    this.resultcanvas = document.createElement('canvas')
    this.resultcanvas.width = this.dimensions.width
    this.resultcanvas.height = this.dimensions.height

    this.resultctx = this.resultcanvas.getContext('2d')
    this.loadModel()
  }
  async loadModel () {
    window.fetch = fetchPolyfill

    return tf.loadGraphModel(MODEL_INTERN_URL).then((model) => {
      this.model = model
    })
  }
  async execute (imageElement, cv, toDia, enableAi) {
    if (!this.model) await this.loadModel()
    let toDataUrl

    let tensor = tf.browser.fromPixels(imageElement).resizeNearestNeighbor([224, 224]).toFloat()
    tensor = tensor.expandDims()
    let predictions = await this.model.execute(tensor).data()

    if (enableAi) {
      try {
        let buffer = this.createPictureFromPrediction(predictions)
        toDataUrl = this.toDataUrl(buffer)
      } catch (e) {
        return { error: { msg: 'AI error: create Picture' } }
      }
    }

    try {
      let result = toDia.predict(predictions, cv)
      return { data: { error: false, diameter: result }, dataUrl: toDataUrl }
    } catch (e) {
      return { error: { msg: 'AI error: Evaluation' }, dataUrl: toDataUrl }
    }
  }
  createPictureFromPrediction (predictions) {
    let buffer = new Uint8ClampedArray(this.dimensions.width * this.dimensions.height * 4)
    let classifications = []

    for (var y = 0; y < this.dimensions.height; y++) {
      for (var x = 0; x < this.dimensions.width; x++) {
        var classification = predictions[y * this.dimensions.width + x]
        if (!classifications.includes(classification)) {
          classifications.push(classification)
        }
        var pos = (y * this.dimensions.width + x) * 4 // position in buffer based on x and y
        if (classification === 0) {
          buffer[pos] = 0 // some R value [0, 255]
          buffer[pos + 1] = 0 // some G value
          buffer[pos + 2] = 0 // some B value
          buffer[pos + 3] = 255 // set alpha channel
        } else if (classification === 1) {
          buffer[pos] = 127 // some R value [0, 255]
          buffer[pos + 1] = 127 // some G value
          buffer[pos + 2] = 127 // some B value
          buffer[pos + 3] = 255 // set alpha channel
        } else if (classification === 2) {
          buffer[pos] = 255 // some R value [0, 255]
          buffer[pos + 1] = 255 // some G value
          buffer[pos + 2] = 255 // some B value
          buffer[pos + 3] = 255 // set alpha channel
        }
      }
    }
    return buffer
  }
  toDataUrl (buffer) {
    var idata = this.resultctx.createImageData(this.dimensions.width, this.dimensions.height)
    idata.data.set(buffer)
    this.resultctx.putImageData(idata, 0, 0)
    return this.resultcanvas.toDataURL()
  }
}

export default AiService
