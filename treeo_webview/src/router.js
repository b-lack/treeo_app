import Vue from 'vue'
import Router from 'vue-router'
import store from './store'

import Login from './views/Login.vue'
import ForgotPassword from './views/ForgotPassword.vue'
import RegisterFarmer from './views/RegisterFarmer.vue'

import Profile from './views/Profile.vue'
import Settings from './views/Settings.vue'

import Dashboard from './views/Dashboard.vue'

import Plots from './views/Plots.vue'
import Plot from './views/Plot.vue'
import PlotEdit from './views/PlotEdit.vue'
import PlotAdd from './views/PlotAdd.vue'

import Trees from './views/Trees.vue'
import Tree from './views/Tree.vue'

import TreeAdd from './views/TreeAdd.vue'

import Files from './views/Files.vue'

import AuthService from './service/authService'

Vue.use(Router)

let router = new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'root',
      component: Login,
      meta: {
        forwardAuth: 'dashboard'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        forwardAuth: 'dashboard'
      }
    },
    {
      path: '/forgotPassword',
      name: 'forgotPassword',
      component: ForgotPassword,
      meta: {
        forwardAuth: 'dashboard',
        toolbar: {
          headline: 'forgotPassword',
          closeBtn: 'login'
        }
      }
    },
    {
      path: '/registerFarmer',
      name: 'registerFarmer',
      component: RegisterFarmer,
      meta: {
        toolbar: {
          headline: 'registerFarmer',
          closeBtn: 'dashboard'
        }
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: {
        requiresAuth: true,
        backBtn: true,
        toolbar: {
          headline: 'profile',
          backBtn: 'dashboard',
          settingsBtn: 'settings'
        }
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: {
        requiresAuth: true,
        backBtn: true,
        toolbar: {
          headline: 'settings',
          closeBtn: 'profile'
        }
      }
    },
    {
      path: '/settings/files',
      name: 'files',
      component: Files,
      meta: {
        requiresAuth: true,
        backBtn: true,
        toolbar: {
          headline: 'files',
          closeBtn: 'settings'
        }
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'dashboard',
          backBtn: false,
          synchBtn: true
        }
      }
    },
    {
      path: '/plots',
      name: 'plots',
      component: Plots,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'plots',
          backBtn: 'dashboard',
          hasMap: false
        }
      }
    },
    {
      path: '/plot/add',
      name: 'plotAdd',
      component: PlotAdd,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'addPlot',
          closeBtn: 'plots',
          hasMap: false
        }
      }
    },
    {
      path: '/plot/:id',
      name: 'plot',
      component: Plot,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'plot',
          backBtn: -1,
          hasMap: false
        }
      }
    },
    {
      path: '/plot/edit/:id?',
      name: 'plotEdit',
      component: PlotEdit,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'Edit Plot',
          closeBtn: 'plots',
          hasMap: false
        }
      }
    },
    /* {
      path: '/plot/:id/surveys',
      name: 'surveys',
      component: Surveys,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'surveys',
          backBtn: 'plot',
          hasMap: false
        }
      }
    },
   {
      path: '/plot/:id/survey/add',
      name: 'surveyAdd',
      component: SurveyAdd,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'Add Survey',
          closeBtn: 'surveys',
          hasMap: false
        }
      }
    },
    {
      path: '/plot/:id/survey/:surveyId',
      name: 'survey',
      component: Survey,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'survey',
          backBtn: 'surveys',
          hasMap: false
        }
      }
    },
    {
      path: '/plot/:id/survey/edit/:surveyId?',
      name: 'surveyEdit',
      component: SurveyEdit,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'Edit Survey',
          closeBtn: 'surveys',
          hasMap: false
        }
      }
    }, */
    {
      path: '/plot/:id/survey/:surveyId/tree',
      name: 'trees',
      component: Trees,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'trees',
          backBtn: 'survey',
          hasMap: false
        }
      }
    },
    {
      path: '/plot/:id/survey/:surveyId/tree/add',
      name: 'treeAdd',
      component: TreeAdd,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'addTree',
          closeTreeBtn: 'trees',
          hasMap: false
        }
      }
    },
    {
      path: '/plot/:id/survey/:surveyId/tree/:treeId',
      name: 'tree',
      component: Tree,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'tree',
          // backBtn: 'trees',
          hasMap: false,
          closeBtn: true
        }
      }
    },
    /* {
      path: '/plot/:id/survey/:surveyId/tree/edit/:treeId?',
      name: 'treeEdit',
      component: TreeEdit,
      meta: {
        requiresAuth: true,
        toolbar: {
          headline: 'Edit Tree',
          closeBtn: 'trees',
          hasMap: false
        }
      }
    } */
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    AuthService.isLogin().then(response => {
      next()
    }).catch(() => {
      next({
        path: '/login',
        params: { nextUrl: to.fullPath }
      })
    })
  } else if (to.matched.some(record => record.meta.forwardAuth)) {
    AuthService.isLogin().then(response => {
      next({
        name: to.meta.forwardAuth
      })
    }).catch(() => {
      next()
    })
  } else {
    next()
  }
})
router.afterEach((to, from) => {
  if (to.meta.toolbar) { store.commit('setToolBar', to.meta.toolbar) } else { store.commit('setToolBar', null) }
})
export default router
