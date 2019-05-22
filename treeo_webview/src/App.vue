<template>
  <v-app>
    <Toolbar :key="$store.state.updateToolbar"/>
    <v-content>
      <ServerTypeAlert :key="$store.state.updateToolbar"/>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </v-content>
  </v-app>
</template>

<script>
import Toolbar from './components/Toolbar'
import ServerTypeAlert from './components/ServerTypeAlert'
import LocalstorageService from './service/localstorageService'

export default {
  name: 'App',
  components: {
    Toolbar,
    ServerTypeAlert
  },
  mounted () {
    this.$i18n.locale = LocalstorageService.get('defaultLanguage') || 'en'
  }
}
</script>

<style>
* {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */
}
</style>
