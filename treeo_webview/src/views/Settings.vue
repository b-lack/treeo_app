<template>
  <div>
    <v-list two-line subheader>

      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>{{$t('languageSelection.language')}}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-menu bottom left>
            <v-btn
               slot="activator"
              flat
            >
              {{languages[$i18n.locale]}}
            </v-btn>
            <v-list>
              <v-list-tile
                v-for="(item, i) in languages"
                :key="i"
                @click="selectLang(i)"
              >
                <v-list-tile-title>{{ item }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>

    <v-divider></v-divider>

    <v-list two-line subheader>
      <v-subheader>{{$t('page.settings.subheader.dialog')}}</v-subheader>

      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>{{$t('page.settings.label.hideMeasuredDialog')}}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-switch color="primary" v-model="hideMeasuredDialog" @change="saveHideMeasuredDialog"></v-switch>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
    <v-divider></v-divider>

    <v-list two-line subheader>
      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>{{$t('page.settings.label.synchMobile')}}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-switch color="primary" v-model="synchMobile" @change="saveSynchMobile"></v-switch>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
    <v-divider></v-divider>

    <v-list two-line subheader>
      <v-list-tile @click="isAdmin">
        <v-list-tile-content>
          <v-list-tile-title class="text-xs-center">{{$t('page.settings.subheader.version')}}</v-list-tile-title>
          <v-list-tile-sub-title class="text-xs-center">{{app_version}}</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <v-dialog
      v-model="pinDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="headline primary" primary-title>
          <span class="white--text">{{$t('dialog.adminDialog.title')}}</span>
        </v-card-title>
        <v-card-text class="text-xs-center">
          <v-text-field
            v-model="pin"
            :rules="[checkPin]"
            maxlength="4"
            label="Pin"
            required
          ></v-text-field>
        </v-card-text>
      </v-card>
    </v-dialog>

    <div v-if="isAdminOk">
      <v-divider></v-divider>
      <v-list two-line subheader>
        <v-subheader>Files</v-subheader>
        <v-list-tile>
          <v-btn :to="{ name: 'files'}" outline block color="primary" dark>Files</v-btn>
        </v-list-tile>
        <v-list-tile>
          <v-btn @click="uploadFiles" outline block color="primary" dark>upload all Files</v-btn>
        </v-list-tile>
      </v-list>
      <v-divider></v-divider>
      <v-list two-line subheader>
        <v-subheader>Synchronisation</v-subheader>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Last Synchronisation</v-list-tile-title>
            <v-list-tile-sub-title>{{ lastSynch | moment("MMMM Do YYYY, h:mm:ss a") }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple @click="synchAll()" :disabled="$store.state.netWorkStatus=='none' || $store.state.synching" :loading="$store.state.synching">
              <v-icon color="grey lighten-1">synch</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>API-Actions</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-layout row wrap>

              <v-flex xs4 class="px-4">
                <v-btn icon ripple :disabled="$store.state.synching" :loading="deleting" @click="deleteDb(dbList)">
                  <v-icon color="grey lighten-1">delete</v-icon>
                </v-btn>
              </v-flex>

              <v-flex xs4 class="px-4">
                <v-btn icon ripple :disabled="$store.state.synching" :loading="uploading" @click="uploadDb(dbList)">
                  <v-icon color="grey lighten-1">cloud_upload</v-icon>
                </v-btn>
              </v-flex>

              <v-flex xs4 class="px-4">
                <v-btn icon ripple :disabled="$store.state.synching"  :loading="downloading"  @click="downloadDb(dbList)">
                  <v-icon color="grey lighten-1">cloud_download</v-icon>
                </v-btn>
              </v-flex>

            </v-layout>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Plots</v-list-tile-title>
            <v-list-tile-sub-title>Synchronised {{synchronized.plots[0].length}} / only Local {{synchronized.plots[1].length}}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Surveys</v-list-tile-title>
            <v-list-tile-sub-title>Synchronised {{synchronized.surveys[0].length}} / only Local {{synchronized.surveys[1].length}}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Trees</v-list-tile-title>
            <v-list-tile-sub-title>Synchronised {{synchronized.trees[0].length}} / only Local {{synchronized.trees[1].length}}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>

      <v-divider></v-divider>
      <v-list two-line subheader>
        <v-subheader>Databases</v-subheader>

        <v-list-tile @click="unsetDatabase('plots')">
          <v-list-tile-content>
            <v-list-tile-title>Delete Database (plots)</v-list-tile-title>
            <v-list-tile-sub-title>{{ databaseInfoplots }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple @click="deleteDatabase('plots')">
              <v-icon color="grey lighten-1">delete</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile @click="unsetDatabase('surveys')">
          <v-list-tile-content>
            <v-list-tile-title>Delete Database (surveys)</v-list-tile-title>
            <v-list-tile-sub-title>{{ databaseInfosurveys }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple @click="deleteDatabase('surveys')">
              <v-icon color="grey lighten-1">delete</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile @click="unsetDatabase('trees')">
          <v-list-tile-content>
            <v-list-tile-title>Delete Database (trees)</v-list-tile-title>
            <v-list-tile-sub-title>{{ databaseInfotrees }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple @click="deleteDatabase('trees')">
              <v-icon color="grey lighten-1">delete</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>

      <v-divider></v-divider>

      <v-list
        subheader
        two-line
      >
        <v-subheader>Admin</v-subheader>

        <v-list-tile @click="setExpireDate">
          <v-list-tile-content>
            <v-list-tile-title>Set Expires_in = 0 (to get refresh tocken)</v-list-tile-title>
            <v-list-tile-sub-title>Expires: {{ (expires_in + user__last_login) | moment("MMMM Do YYYY, h:mm:ss a") }}</v-list-tile-sub-title>
            <v-list-tile-sub-title>Refresh: {{ (refresh_in + user__last_login) | moment("MMMM Do YYYY, h:mm:ss a") }}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile @click="unsetTocken">
          <v-list-tile-content>
            <v-list-tile-title>unset access_token</v-list-tile-title>
            <v-list-tile-sub-title>{{ access_token }}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile @click="unsetRefreshTocken">
          <v-list-tile-content>
            <v-list-tile-title>unset refresh_token</v-list-tile-title>
            <v-list-tile-sub-title>{{ refresh_token }}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

      </v-list>
      <v-divider></v-divider>
      <v-list two-line subheader>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Network Status</v-list-tile-title>
            <v-list-tile-sub-title>{{ $store.state.netWorkStatus }}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-divider></v-divider>
      <v-list two-line subheader>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Enable AI Output</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch color="primary" v-model="enableAi" @change="saveEnableAi"></v-switch>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      <v-divider></v-divider>
      <v-list two-line subheader>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Switch Server to Stage</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch color="primary" v-model="stageServer" @change="switchToStage"></v-switch>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </div>
    <v-divider></v-divider>
    <!--<v-list two-line subheader >
      <v-list-tile @click="resetAll">
        <v-btn block flat light outline color="error" dark>{{$t('page.settings.button.reset')}}</v-btn>
      </v-list-tile>
    </v-list>-->
  </div>
</template>

<script>
import LocalstorageService from '../service/localstorageService'
import AuthService from '../service/authService'
import SynchService from '../service/synchService'
import PouchDbService from '../service/pouchDbService'
import PouchDB from 'pouchdb'

export default {
  data: () => ({
    dbList: ['plots', 'surveys', 'trees'],
    databases: {},
    uploading: false,
    downloading: false,
    deleting: false,
    expires_in: null,
    refresh_in: null,
    user__last_login: null,
    databaseInfoplots: null,
    databaseInfosurveys: null,
    databaseInfotrees: null,
    hideMeasuredDialog: false,
    enableAi: false,
    synchMobile: false,
    stageServer: false,
    showLangSelection: false,
    lastSynch: null,
    pin: '',
    languages: {
      en: 'English',
      id: 'bahasa indonesia'
    },
    pinDialog: false,
    access_token: null,
    refresh_token: null,
    app_version: '-',
    isAdminOk: false,
    synchronized: {
      plots: [[], []],
      surveys: [[], []],
      trees: [[], []]
    }
  }),
  mounted () {
    const that = this
    this.getExpireDate()
    this.getTocken()

    this.languages.en = this.$t('languageSelection.english')
    this.languages.id = this.$t('languageSelection.bahasa')

    if (typeof window.cordova !== 'undefined') {
      window.cordova.getAppVersion.getVersionNumber().then((version) => {
        that.app_version = version
      })
    }
  },
  activated () {
    this.hideMeasuredDialog = LocalstorageService.get('hideMeasuredDialog') === 'true' || false
    this.$i18n.locale = LocalstorageService.get('defaultLanguage') || 'id'
    this.enableAi = LocalstorageService.get('enableAi') === 'true'
    this.synchMobile = LocalstorageService.get('synchMobile') === 'true'
    this.stageServer = window.config.name === 'stage'

    this.databases = {
      plots: new PouchDbService('plots'),
      surveys: new PouchDbService('surveys'),
      trees: new PouchDbService('trees')
    }

    this.getAllDatabaseInfo(this.dbList)
    this.getAllSynchInfo(this.dbList)
    this.getLastSynch()
    this.getExpireDate()
  },
  methods: {
    isAdmin () {
      if (!this.isAdminOk) { this.pinDialog = true } else { this.isAdminOk = false }
    },
    checkPin (v) {
      if (this.pin.length !== 4) return true
      if (this.pin === window.config.pinToEnter) {
        this.pin = ''
        this.isAdminOk = true
        this.pinDialog = false
        return true
      } else {
        return 'wrong pin'
      }
    },
    getLastSynch () {
      this.lastSynch = parseInt(LocalstorageService.get('latestSynch'))
    },
    saveLanguage (value) {
      LocalstorageService.set('defaultLanguage', value)
    },
    selectLang (lang) {
      this.saveLanguage(lang)
      this.$i18n.locale = lang
      this.languages.en = this.$t('languageSelection.english')
      this.languages.id = this.$t('languageSelection.bahasa')
    },
    saveHideMeasuredDialog (value) {
      LocalstorageService.set('hideMeasuredDialog', value)
    },
    saveEnableAi (value) {
      LocalstorageService.set('enableAi', value)
    },
    saveSynchMobile (value) {
      LocalstorageService.set('synchMobile', value)
    },
    getExpireDate () {
      this.expires_in = parseInt(LocalstorageService.get('auth__expires_in')) // in seconds

      this.user__last_login = Math.round(LocalstorageService.get('user__last_login') / 1000) // in seconds
      // let activeTill = (expiresIn * 60 * 1000) + lastLogin;
      // let refreshTill = lastLogin + 86400 * 60 *1000;
      this.refresh_in = 43200 * 60
    },
    setExpireDate () {
      LocalstorageService.set('auth__expires_in', 0)
      LocalstorageService.set('user__last_login', new Date().getTime())
      this.getExpireDate()
      // this.expires_in = LocalstorageService.set('auth__expires_in');
    },
    getTocken () {
      this.access_token = LocalstorageService.get('auth__access_token')
      this.refresh_token = LocalstorageService.get('auth__refresh_token')
    },
    unsetTocken () {
      LocalstorageService.remove('auth__access_token')
      this.getTocken()
    },
    unsetRefreshTocken () {
      LocalstorageService.remove('auth__refresh_token')
      this.getTocken()
    },
    synchAll () {
      SynchService.synch().then(() => {
        this.getAllDatabaseInfo(this.dbList)
        this.getAllSynchInfo(this.dbList)
        this.getLastSynch()
      })
    },
    sortParentById (rowsArray) {
      let byId = {}

      rowsArray.forEach((element) => {
        byId[element._id] = element
      })

      return byId
    },
    resetAll () {

    },
    switchToStage (toStage) {
      if (toStage === window.config.name) return

      if (toStage) { this.switchToServer('stage') } else {
        this.switchToServer('live')
      }
      this.$store.commit('setUpdateToolbar')

      AuthService.logout()
    },
    uploadDb (dbList) {
      const that = this
      let parents = {}
      this.uploading = true

      SynchService.allDb([dbList[0]], 'create', {}).then((result) => {
        return this.getSynchInfo(dbList[0])
      }).then((result) => {
        parents.plots = this.sortParentById(this.synchronized.plots[0])
        return SynchService.allDb([dbList[1]], 'create', parents.plots)
      }).then(() => {
        return this.getSynchInfo(dbList[1])
      }).then(() => {
        parents.surveys = this.sortParentById(this.synchronized.surveys[0])
        return SynchService.allDb([dbList[2]], 'create', parents.surveys)
      }).then((result) => {
        that.uploading = false
        return this.getSynchInfo(dbList[2])
      }).catch(() => {
        that.uploading = false
      })
    },
    uploadFiles () {
      SynchService.uploadImages()
    },
    downloadDb (dbList) {
      const that = this
      let parents = {}
      this.downloading = true

      SynchService.allDb([dbList[0]], 'download', {}).then((result) => {
        return this.getSynchInfo(dbList[0])
      }).then((result) => {
        parents.plots = this.sortParentById(this.synchronized.plots[0])
        return SynchService.allDb([dbList[1]], 'download', parents.plots)
      }).then(() => {
        return this.getSynchInfo(dbList[1])
      }).then(() => {
        parents.surveys = this.sortParentById(this.synchronized.surveys[0])
        return SynchService.allDb([dbList[2]], 'download', parents.surveys)
      }).then(() => {
        this.getAllSynchInfo(this.dbList)
        this.getAllDatabaseInfo(this.dbList)
        that.downloading = false
      })
    },
    deleteDb (dbList) {
      const that = this
      this.deleting = true

      SynchService.allDb(['plots'], 'delete', {}).then((result) => {
        this.getAllSynchInfo(this.dbList)
        that.deleting = false
      }).catch((error) => {
        that.deleting = false
      })
    },
    getAllSynchInfo (databaseName) {
      for (let i = 0; i < databaseName.length; i++) {
        this.getSynchInfo(databaseName[i])
      }
    },
    getSynchInfo (databaseName) {
      const that = this
      return this.databases[databaseName].getAllIntern().then((resultIntern) => {
        that.synchronized[databaseName][1].length = 0
        that.synchronized[databaseName][1].push(...resultIntern.docs)
        return that.databases[databaseName].getAllExtern()
      }).then((resultExtern) => {
        that.synchronized[databaseName][0].length = 0
        that.synchronized[databaseName][0].push(...resultExtern.docs)
      })
    },
    getAllDatabaseInfo (databaseName) {
      for (let i = 0; i < databaseName.length; i++) {
        this.getDatabaseInfo(databaseName[i])
      }
    },
    getDatabaseInfo (databaseName) {
      const that = this
      var db = new PouchDB(databaseName)
      db.info().then(function (info) {
        that['databaseInfo' + databaseName] = JSON.stringify(info)
      })
    },
    unsetDatabase (databaseName) {
      const that = this
      this.databases[databaseName].clear().then(() => {
        that.getDatabaseInfo(databaseName)
        this.getSynchInfo(databaseName)
      })
    },
    deleteDatabase (databaseName) {
      const that = this
      this.databases[databaseName].destroy().then(() => {
        that.getDatabaseInfo(databaseName)
        this.getSynchInfo(databaseName)
      })
    }
  }
}
</script>
