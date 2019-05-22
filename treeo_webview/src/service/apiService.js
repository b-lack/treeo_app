import axios from 'axios'
import qs from 'qs'
import LocalstorageService from '../service/localstorageService'

var ApiService = {
  version: 'v1',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  },
  endpoints: {

    'login': { url: '/v1/clients/mobile/user/login', method: 'post' },
    'forgotPassword': { url: '/v1/password/forgot', method: 'post' },
    'registrateFarmer': { url: '/v1/farmer', method: 'post' },

    'getLoggedInProfile': { url: '/v1/farmer/profile', method: 'get' },
    'farmerPhoto': { url: '/v1/farmer/photo', method: 'post', type: 'formData' },

    'refreshToken': { url: '/v1/clients/mobile/user/refresh', method: 'post' },

    'lookUp': { url: '/v1/', method: 'get' },

    'plotsGet': { url: '/v1/plots/own?limit=0', method: 'get' },
    'plotsCreate': { url: '/v1/plot', method: 'post' },
    'plotsDelete': { url: '/v1/plot', method: 'delete' },

    'surveysGet': { url: '/v1/surveys/own?limit=0', method: 'get' },
    'surveysCreate': { url: '/v1/survey', method: 'post' },
    'surveysDelete': { url: '/v1/survey', method: 'delete' },

    'treesGet': { url: '/v1/trees/own?limit=0', method: 'get' },
    'treesCreate': { url: '/v1/tree', method: 'post', type: 'formData' },
    'multiTreesCreate': { url: '/v1/trees', method: 'post' },
    'treesDelete': { url: '/v1/tree', method: 'delete' },

    'uploadTreeImage': { url: '/v1/tree/image', method: 'post', type: 'formData' },
    'generatepolygon': { url: '/v1/plot/generatepolygon', method: 'post' }

  },
  send: function (endpoint, params, data, headers, notAuth, url, postUrl) {
    if (!this.endpoints[endpoint]) return false
    let request; let options = {}
    params = params || {}
    data = data || {}
    headers = headers || {}

    if (!notAuth) {
      let accToken = LocalstorageService.get('auth__access_token')
      if (accToken) {
        const AuthObj = { Authorization: LocalstorageService.get('auth__token_type') + ' ' + LocalstorageService.get('auth__access_token') }
        headers = { ...this.headers, ...AuthObj }
      }
    }

    headers = { ...this.headers, ...headers }
    options.headers = headers

    if (this.endpoints[endpoint].params) { params = { ...this.endpoints[endpoint].params, ...params } }
    options.params = params

    if (this.endpoints[endpoint].type === 'formData') {
      let formData = new FormData()
      for (let i in data) {
        formData.append(i, data[i])
      }

      data = formData

      headers['content-type'] = 'application/form-data'
    } else {
      data = qs.stringify(data)
      headers['content-type'] = 'application/x-www-form-urlencoded'
    }

    url = window.config.base + (this.endpoints[endpoint].url || url)

    if (postUrl) url += postUrl

    if (this.endpoints[endpoint].method === 'get') {
      request = axios.get(url, options)
    } else if (this.endpoints[endpoint].method === 'post') {
      request = axios.post(url, data, options)
    } else if (this.endpoints[endpoint].method === 'delete') {
      request = axios.delete(url, options)
    }

    return request
  }
}

export default ApiService
