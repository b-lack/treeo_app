import Vue from 'vue'
import Vuex from 'vuex'
import SynchService from './service/synchService'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    showMap: false,
    surveyDialog: false,
    hasMap: false,
    mapHeight: 'auto',
    toolbar: null,
    mapHeightStyle: {
      height: 48 + 'px'
    },
    ongoingSurveys: [],
    ongoingPlots: [],
    deviceReady: false,
    synching: false,
    netWorkStatus: 'wifi',
    update: 0,
    updateToolbar: 0
  },
  mutations: {
    setUpdate (state) {
      state.update += 1
    },
    setUpdateToolbar (state) {
      state.updateToolbar += 1
    },
    setNetworkStatus (state, netWorkStatus) {
      if (netWorkStatus === 'wifi' && state.netWorkStatus !== 'wifi') {
        SynchService.synch()
      }
      state.netWorkStatus = netWorkStatus
    },
    setSynching (state, synching) {
      state.synching = synching
    },
    setDeviceReady (state, deviceReady) {
      state.deviceReady = deviceReady
    },
    toggleMap (state) {
      state.showMap = !state.showMap
    },
    toggelSurveyDialog (state, newState) {
      state.surveyDialog = newState
    },
    maxMap (state) {
      state.showMap = true
    },
    minMap (state) {
      state.showMap = false
    },
    setMapHeight (state, newHeight) {
      if (Number.isInteger(newHeight)) { state.mapHeight = newHeight + 'px' } else {
        state.mapHeight = 'auto'
      }
    },
    setMapHeightStyle (state, newHeight) {
      state.mapHeightStyle = { ...state.mapHeightStyle, height: (newHeight + 'px') }
    },
    setToolBar (state, newState) {
      state.toolbar = newState
    },
    setHasMap (state, value) {
      state.hasMap = value
    },
    setOngoingPlots (state, newState) {
      state.ongoingPlots = newState
    },
    setOngoingSurveys (state, newState) {
      state.ongoingSurveys = newState
    }
  },
  getters: {
    height: state => state.setMapHeightStyle.height
  },
  actions: {

  }
})
