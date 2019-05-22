<template>
  <div>

  <v-toolbar app v-if="$store.state.toolbar" color="primary white--text" class="of-toolbar">
    <div>
      <v-btn class="white--text" flat icon v-if="$store.state.toolbar.backBtn" :to="{ name: 'dashboard'}">
        <v-icon>home</v-icon>
      </v-btn>
      <v-btn class="white--text" flat icon v-if="$store.state.toolbar.closeBtn" @click.native="$router.go(-1)">
        <v-icon>close</v-icon>
      </v-btn>
      <v-btn class="white--text" flat icon v-if="$store.state.toolbar.closeTreeBtn" @click.native="toggelSurveyDialog(true)">
        <v-icon>close</v-icon>
      </v-btn>
    </div>

    <v-btn class="white--text" color="white" flat icon  v-if="$store.state.toolbar.backBtn === false" :to="{ name: 'profile' }">

      <v-avatar v-if="profile.name" size="32px" class="primary--text" color="white">
        <span v-if="!profile.photo && profile.name" class="headline">{{profile.name[0]}}</span>
        <img v-if="profile.photo" :src="basePath + profile.photo" alt=""/>
      </v-avatar>
      <v-avatar v-if="!profile.name" size="32px" class="primary--text" color="white">
        <v-icon>person</v-icon>
      </v-avatar>
    </v-btn>

    <v-toolbar-title class="headline">
      {{$t('page.toolbarTitle.' + $store.state.toolbar.headline)}}
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <v-btn class="white--text" v-if="$store.state.toolbar.hasMap" flat icon @click="toggleMap">
      <v-icon v-if="!$store.state.showMap">map</v-icon>
      <v-icon  v-if="$store.state.showMap">list</v-icon>
    </v-btn>
    <v-btn class="white--text" v-if="$store.state.toolbar.settingsBtn" flat icon :to="{ name: 'settings'}">
      <v-icon>settings</v-icon>
    </v-btn>
    <v-btn class="white--text" v-if="$store.state.toolbar.synchBtn && $store.state.synching" :disabled="$store.state.netWorkStatus=='none' || $store.state.synching" :loading="$store.state.synching" flat icon @click.native="synch(true)">
      <v-icon>sync</v-icon>
    </v-btn>
  </v-toolbar>
  </div>
</template>

<script>
import router from '../router'
import AuthService from '../service/authService'
import SynchService from '../service/synchService'
import LocalStorageService from '../service/localstorageService'

export default {

  data: () => ({
    toolbar: null,
    profile: {},
    surveyEnd: false,
    loading: false,
    basePath: window.config.base + window.config.squareMedia
  }),

  created: function () {
    this.profile = AuthService.getProfile()
  },
  activated: function () {
    this.basePath = window.config.base + window.config.squareMedia

    this.profile = AuthService.getProfile()
  },

  methods: {

    synch () {
      SynchService.synch().then(() => {
        this.$store.commit('setUpdate')
      })
    },
    toggelSurveyDialog (set) {
      this.$store.commit('toggelSurveyDialog', set)
    },
    toggleMap () {
      this.$store.commit('toggleMap')
    },
    back () {
      router.go(-1)
    }

  }
}
</script>

<style>
.of-toolbar{
  z-index: 100;
}
</style>
