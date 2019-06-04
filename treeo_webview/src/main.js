import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import store from './store'
import router from './router'
import i18n from './i18n'

import HelperService from './service/helperService'

import FileService from './service/fileService'

import AiService from './service/aiService'

import MasksToDiameterService from 'maskstodiameterservice'

import configLive from './data/config_live'
import configStage from './data/config_stage'

import 'material-design-icons-iconfont/dist/material-design-icons.css'
Vue.prototype.$Helper = HelperService

Vue.use(require('vue-moment'))
Vue.prototype.$file = new FileService()
Vue.prototype.$ai = new AiService()
Vue.prototype.$maskToDia = new MasksToDiameterService()
window.config = configLive

Vue.config.productionTip = false
Vue.config.debug = true

Vue.mixin({
  methods: {
    switchToServer (type) {
      if (type === 'live') {
        window.config = configLive
      } else if (type === 'stage') {
        window.config = configStage
      }
    }
  }
})
new Vue({
  router,
  i18n,
  store,
  render: h => h(App),
  mounted: function () {
    this.switchToServer('live')
  }
}).$mount('#app')

function setNetWorkState () {
  store.commit('setNetworkStatus', navigator.connection.type)
}
document.addEventListener('deviceready', function () {
  store.commit('setDeviceReady', true)

  if (navigator.splashscreen) navigator.splashscreen.hide()

  document.addEventListener('offline', setNetWorkState, false)
  document.addEventListener('online', setNetWorkState, false)
  setNetWorkState()
})
