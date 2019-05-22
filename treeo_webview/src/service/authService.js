import LocalstorageService from './localstorageService'
import ApiService from './apiService'
import store from '../store'

import router from '../router'

var AuthService = {

  logedIn: false,

  isLogin () {
    let login = LocalstorageService.get('auth__refresh_token')
    AuthService.logedIn = login !== null
    return new Promise(AuthService.checkRefresh)
  },
  refresh (resolve, reject) {
    let refreshToken = LocalstorageService.get('auth__refresh_token')

    if (!refreshToken) {
      reject('no refresh_token')
      return
    }

    ApiService.send('refreshToken', {}, { refresh_token: refreshToken }, false).then(response => {
      AuthService.login(response)
      resolve('refreshing access token')
    }).catch(error => {
      reject('ApiService refresh error refresh_token', error)
    })
  },
  checkRefresh (resolve, reject) {
    let refreshToken = LocalstorageService.get('auth__refresh_token')

    if (!refreshToken) {
      reject('no refresh_token')
      return
    }
    let accessToken = LocalstorageService.get('auth__access_token')
    if (!accessToken) {
      new Promise(AuthService.refresh).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })

      return
    }

    let expiresIn = parseInt(LocalstorageService.get('auth__expires_in')) // seconds
    let lastLogin = parseInt(LocalstorageService.get('user__last_login')) // milliseconds

    if (!expiresIn) expiresIn = -1

    let activeTill = (expiresIn * 1000) + lastLogin
    let refreshTill = lastLogin + 43200 * 60 * 1000
    let date = new Date().getTime()

    if (refreshTill < date) {
      reject('outdated refresh token')
      return
    }

    if (activeTill >= date) {
      resolve('not yet to renew')
    } else if ((store.state.netWorkStatus === 'none') && refreshTill >= date) { // !store.deviceReady ||
      resolve('am offline')
    } else {
      new Promise(AuthService.refresh).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    }
  },
  login (response, userId) {
    LocalstorageService.remove('latestSynch')

    for (let key in response.data) {
      LocalstorageService.set('auth__' + key, response.data[key])
    }
    AuthService.logedIn = true
    LocalstorageService.set('user__last_login', new Date().getTime())
    if (userId) { LocalstorageService.set('user__userId', userId) }

    return AuthService.getLoggedInProfile()
  },

  logout () {
    LocalstorageService.set('user__last_logout', new Date().getTime())
    LocalstorageService.remove('auth__refresh_token')
    LocalstorageService.remove('auth__expires_in')
    LocalstorageService.remove('auth__access_token')

    LocalstorageService.remove('user__userId')
    LocalstorageService.remove('user__user_profile')

    LocalstorageService.remove('latestSynch')

    AuthService.logedIn = false

    router.push({ path: 'login' })
  },
  getUserId () {
    return LocalstorageService.get('user__userId')
  },
  getLastLogin () {
    return LocalstorageService.get('user__last_login')
  },
  getLoggedInProfile () {
    let request = ApiService.send('getLoggedInProfile')

    request.then(response => {
      LocalstorageService.set('user__user_profile', JSON.stringify(response.data.data))
      store.commit('setUpdateToolbar')
    })
    return request
  },
  getProfile () {
    let userProfile = LocalstorageService.get('user__user_profile')
    return userProfile ? JSON.parse(userProfile) : {}
  }
}
// AuthService.isLogin();

export default AuthService
