import router from '../router'
import PouchDbService from '../service/pouchDbService'
import AuthService from '../service/authService'
import store from '../store'
import LocalstorageService from '../service/localstorageService'

const HelperService = {
  dateToMonth: function (date) {
    const dateArr = date.toISOString().split('T')
    return dateArr[0]
  },
  createSurveyStart: function (parentId) {
    if (!parentId) return

    let formContent = {
      parentId: parentId,
      date_start: new Date().toISOString(),
      created_at: new Date().toISOString(),
      farmer_id: AuthService.getProfile().id
    }

    const database = new PouchDbService('surveys')
    return database.post(formContent)
  },
  removeSurvey: function (id) {
    const surveyDb = new PouchDbService('surveys')
    return surveyDb.get(id).then((row) => {
      LocalstorageService.set('dataUpdated', true)
      store.commit('setOngoingPlots', [])
      store.commit('setOngoingSurveys', [])
      return surveyDb.remove(row)
    })
  },
  endSurvey: function (id, successFn) {
    const surveyDb = new PouchDbService('surveys')
    surveyDb.get(id).then((row) => {
      row.date_end = new Date().toISOString()
      surveyDb.post(row).then(function () {
        LocalstorageService.set('dataUpdated', true)
        store.commit('setOngoingPlots', [])
        store.commit('setOngoingSurveys', [])
        successFn()
      })
    })
  },
  to: function (path) {
    router.push({ path: path })
    // :to="{path: routeTo}"
  },
  routeChild: function (route, id, prefix, post) {
    let path = ['/plot/']

    if (route.params.id && route.params.id !== id && !prefix) {
      path.push(route.params.id + '/')
      path.push('survey/')
    }

    if (route.params.surveyId && route.params.surveyId !== id && !prefix) {
      path.push(route.params.surveyId + '/')
      path.push('tree/')
    }
    if (route.params.treeId && route.params.treeId !== id && !prefix) {
      path.push(route.params.treeId + '/')
      path.push('/')
    }

    if (prefix) {
      path.splice(-2, 2)
      path.push(prefix + '/')
    }
    if (post) {
      path.push(post)
    }

    if (id) { path.push(id) }

    router.push({ path: path.join('') })
  }
}

export default HelperService
