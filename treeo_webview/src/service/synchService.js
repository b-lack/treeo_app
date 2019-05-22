import PouchDbService from '../service/pouchDbService'
import AuthService from '../service/authService'
import ApiService from './apiService'
import store from '../store'

import LocalStorageService from '../service/localstorageService'
import FileService from '../service/fileService'

const fileService = new FileService()

var SynchService = {
  synch () {
    if (store.state.synching) return false

    store.commit('setSynching', true)

    const dbList = [{
      name: 'plots',
      db: new PouchDbService('plots')
    }, {
      name: 'surveys',
      db: new PouchDbService('surveys')
    }, {
      name: 'trees',
      db: new PouchDbService('trees')
    }]

    return SynchService.uploadData(dbList).then((result) => {
      return SynchService.downloadData(dbList)
    }).then(() => {
      if (store.state.netWorkStatus === 'wifi' || (store.state.netWorkStatus !== '2g' && LocalStorageService.get('synchMobile') === 'true')) {
        SynchService.uploadImages()
      }
    }).then(() => {
      store.commit('setUpdate')
      store.commit('setSynching', false)
      LocalStorageService.set('dataUpdated', false)
      LocalStorageService.set('latestSynch', Date.now())
    })
  },
  sortParentBySurveyId (rowsArray) {
    let byId = {}
    rowsArray.forEach((element) => {
      if (!byId[element.data.survey_id]) {
        byId[element.data.survey_id] = {
          data: {
            survey_id: element.data.survey_id,
            tree_data: []
          },
          intern: {}
        }
      }
      byId[element.data.survey_id].data.tree_data.push(element.data)
      byId[element.data.survey_id].intern[element.data.timestamp] = element.intern
    })

    let byIdArray = []
    for (var key in byId) {
      byIdArray.push(byId[key])
    }
    return byIdArray
  },
  flatTreeResult (deepArray) {
    const flatArray = []
    deepArray.forEach(element => flatArray.push(...element))
    return flatArray
  },
  sortParentById (rowsArray) {
    let byId = {}
    rowsArray.forEach((element) => {
      byId[element._id] = element
    })
    return byId
  },
  uploadData (dbList) {
    store.commit('setSynching', true)
    let parents, uploadedSurveys
    return SynchService.allDb([dbList[0].name], 'create', {}).then((result) => {
      return dbList[0].db.getAllExtern()
    }).then((plots) => {
      parents = SynchService.sortParentById(plots.docs)
      return SynchService.allDb([dbList[1].name], 'create', parents)
    }).then((surveys) => {
      uploadedSurveys = surveys
      return dbList[1].db.getAllExtern()
    }).then((surveys) => {
      parents = SynchService.sortParentById(surveys.docs)
      return SynchService.allDb([dbList[2].name], 'create', parents)
    }).then(() => {
      this.getExternPlotIds(uploadedSurveys, dbList[0].db).then(extPlotIds => {
        this.refreshPolygon(extPlotIds)
      })
      store.commit('setSynching', false)
    })
  },
  getExternPlotIds (uploadedSurveys, db) {
    let intPlotIds = []; let extPlotIds = []
    uploadedSurveys.forEach(element => {
      element.forEach(child => {
        intPlotIds.push(child.intern.parentId)
      })
    })
    return db.allDocsById(intPlotIds).then(res => {
      res.rows.forEach(element => {
        extPlotIds.push(element.doc.id)
      })
      return extPlotIds
    })
  },
  refreshPolygon (extIds) {
    extIds.forEach(id => {
      ApiService.send('generatepolygon', {}, { id: id })
    })
  },
  downloadData (dbList) {
    store.commit('setSynching', true)
    let parents

    return SynchService.allDb([dbList[0].name], 'download', {}).then((result) => {
      return dbList[0].db.getAllExtern()
    }).then((plots) => {
      parents = SynchService.sortParentById(plots.docs)
      return SynchService.allDb([dbList[1].name], 'download', parents)
    }).then(() => {
      return dbList[1].db.getAllExtern()
    }).then((serveys) => {
      parents = SynchService.sortParentById(serveys.docs)
      return SynchService.allDb([dbList[2].name], 'download', parents)
    }).then(() => {
      store.commit('setSynching', false)
    })
  },
  sendOne (element, endpoint) {
    return new Promise((resolve, reject) => {
      ApiService.send(endpoint, element.params, element.data).then((result) => {
        if (result.data.data && result.data.data.id) {
          let pushData = {}
          pushData = result.data.data

          pushData.parentId = element.intern.parentId
          pushData.farmer_id = element.intern.farmer_id
          pushData._id = element.intern._id
          pushData._rev = element.intern._rev

          resolve(pushData)
        }
        reject(Error('No data found'))
      }).catch((error) => {
        reject(error)
      })
    })
  },
  sendAll (endpoint, uploadData) {
    let promises = []

    uploadData.forEach((element, i) => {
      const p = this.sendOne(element, endpoint)
      promises.push(p)
    })
    return Promise.all(promises)
  },
  sendOneTree (element, endpoint) {
    let uploadDataLength
    return new Promise((resolve, reject) => {
      ApiService.send(endpoint, {}, element.data).then((result) => {
        uploadDataLength = element.data.tree_data.length

        if (result.data.data.length !== uploadDataLength) {
          alert('synch Error: result length is not equal to upload length: ' + result.data.data.length + ':' + uploadDataLength)
        }
        let rows = []
        result.data.data.forEach((e) => {
          if (element.intern[e.timestamp]) {
            let pushData = {}
            pushData = e
            pushData.parentId = element.intern[e.timestamp].parentId
            pushData.farmer_id = element.intern[e.timestamp].farmer_id
            pushData.local_image = element.intern[e.timestamp].local_image
            pushData._id = element.intern[e.timestamp]._id
            pushData._rev = element.intern[e.timestamp]._rev
            rows.push(pushData)
          } else {
            alert('synch Error: local tree not found')
          }
        })

        resolve(rows)
      }).catch((error) => {
        reject(error)
      })
    })
  },
  sendAllTrees (endpoint, uploadData) {
    let promises = []; let p

    uploadData.forEach((element, i) => {
      p = this.sendOneTree(element, endpoint)
      promises.push(p)
    })
    return Promise.all(promises)
  },
  mapResultToRequest (result, uploadData) {
    return new Promise((resolve, reject) => {
      if (result.data.data) {
        result.data.data.forEach(element => {
          var matches = []
          var needle = element.timestamp

          uploadData.forEach(function (e) {
            matches = matches.concat(e.Categories.filter(function (c) {
              return c.data.timestamp === needle
            }))
          })
        })
      } else {
        reject(Error('data not found'))
      }
    })
  },
  allDb (dbList, type, parents) {
    const that = this
    let promises = []

    dbList.forEach((element) => {
      const p = new Promise((resolve, reject) => {
        that[type + 'Db'](element, parents, resolve).then((feedback) => {
          resolve(feedback)
        }).catch((error) => {
          reject(error)
        })
      })
      promises.push(p)
    })
    return Promise.all(promises)
  },
  createDb (databaseName, parents, resolve) {
    const that = this
    let uploadData; let uploadDataSave; let database = new PouchDbService(databaseName)

    return database.getAllIntern().then((result) => {
      uploadData = that.mapData[databaseName + 'Create'](result.docs, parents)

      uploadDataSave = uploadData
      if (uploadData.length === 0) {
        resolve(uploadDataSave)
        return
      }

      if (databaseName === 'trees') {
        let sortedUploadData = that.sortParentBySurveyId(uploadData)
        return that.sendAllTrees('multiTreesCreate', sortedUploadData)
      } else {
        return that.sendAll(databaseName + 'Create', uploadData)
      }
    }).then((rows) => {
      if (databaseName === 'trees') {
        // return;
      }

      if (!rows || rows.length === 0) {
        if (uploadDataSave.length > 0) {
          alert('synch error: cannot find all (' + uploadDataSave + ') local data')
        }
        resolve(uploadDataSave)
        return
      }
      if (databaseName === 'trees') {
        rows = that.flatTreeResult(rows)

        this.doubleCheckRows(rows)
      }

      return database.postAll(rows)
    }).then((postAll) => {
      resolve(uploadDataSave)
    })
  },
  doubleCheckRows (rows) {
    let filteredRows = []

    rows.forEach((element) => {
      if (!element.id) {
        alert('missing id')
      } else if (!element._id) {
        alert('missing _id')
      } else if (!element._rev) {
        alert('missing _rev')
      } else {
        filteredRows.push(element)
      }
    })
    return filteredRows
  },
  deleteDb (databaseName, parents, resolve) {
    const that = this
    let database = new PouchDbService(databaseName)
    return database.getAllExtern().then((result) => {
      const uploadData = that.mapData['delete'](result.docs, parents)
      return that.sendAll(databaseName + 'Delete', uploadData)
    }).then((rows) => {
      return this.deleteId(databaseName, rows)
    }).then((result) => {
      resolve(result)
    })
  },
  deleteId (databaseName, rows) {
    let promises = []

    let database = new PouchDbService(databaseName)
    rows.forEach((element) => {
      delete element.id
      const p = new Promise((resolve, reject) => {
        database.post(element).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
      promises.push(p)
    })
    return Promise.all(promises)
  },
  downloadDb (databaseName, parents, resolve) {
    return ApiService.send(databaseName + 'Get').then((result) => {
      return this.saveDownload(databaseName, result.data.data, parents)
    })
  },
  saveDownload (databaseName, externRows, parents) {
    let internRows = []; let promises = []
    let database = new PouchDbService(databaseName)
    return database.getAll().then((result) => {
      internRows.push(...result.docs)

      promises = this.synchRows(databaseName, internRows, externRows, parents)
      return Promise.all(promises)
    }).then(() => {
      return database.getAll()
    }).then((result) => {
      internRows.length = 0
      internRows.push(...result.docs)
      return this.deleteRows(databaseName, internRows, externRows)
    })
  },
  deleteRows (databaseName, internRows, externRows) {
    const that = this

    return fileService.setFileSystemRequest().then((fs) => {
      return that.deleteRow(databaseName, internRows, externRows, fileService)
    })
  },
  deleteOneRow (element, database, resolve, reject) {
    return database.remove(element).then(resolve).catch(reject)
  },
  deletePromise (element, fileService, databaseName) {
    const that = this
    let database = new PouchDbService(databaseName)
    return new Promise((resolve, reject) => {
      if (element.local_image) {
        // let nativePath = element.local_image.split('/');
        // let fileName = nativePath[nativePath.length-1];
        if (!fileService) {
          that.deleteOneRow(element, database, resolve, reject).then(() => {
            resolve()
          }).catch(() => {
            reject(Error('error deletePromise'))
          })
        } else {
          fileService.deleteFileByUrl(element.local_image).then(() => {
            return that.deleteOneRow(element, database, resolve, reject)
          }).then(() => {
            resolve('')
          }).catch(() => {
            reject(Error('error deletePromise'))
          })
        }
      } else {
        that.deleteOneRow(element, database, resolve, reject).then(resolve).catch(reject)
      }
    })
  },
  deleteRow (databaseName, internRows, externRows, fileService) {
    let promises = []; let p

    internRows.forEach((element) => {
      const filtered = externRows.filter(e => e.id === element.id)
      if (!filtered.length && element.id) {
        p = this.deletePromise(element, fileService, databaseName)
        promises.push(p)
      }
    })

    return Promise.all(promises)
  },
  deleteFile () {

  },
  synchRows (databaseName, internRows, externRows, parents) {
    let promises = []; let p; let setRow
    let database = new PouchDbService(databaseName)
    externRows.forEach((element) => {
      const filtered = internRows.filter(e => e.id === element.id)
      if (filtered.length) { // Update
        setRow = element
        setRow._id = filtered[0]._id
        setRow._rev = filtered[0]._rev
        setRow.farmer_id = AuthService.getProfile().id
        if (filtered[0].local_image) setRow.local_image = filtered[0].local_image
      } else { // Add
        setRow = element
        setRow.farmer_id = AuthService.getProfile().id
      }

      if (databaseName !== 'plots') { setRow = this.fixParent(databaseName, setRow, parents) }

      if (!setRow) return

      p = database.post(setRow)

      /* p = new Promise((resolve, reject) => {
        database.post(setRow).then((result) => {
          resolve()
        }).catch((error) => {
          reject(Error('synchRows error'))
        })
      }) */

      promises.push(p)
    })

    return promises
  },
  fixParent (databaseName, setRow, parents) {
    let key

    if (databaseName === 'surveys') key = 'plot_id'
    if (databaseName === 'trees') key = 'survey_id'

    for (let i in parents) {
      if (parents[i].id === setRow[key]) {
        setRow.parentId = parents[i]._id
        return setRow
      }
    }
    return false
  },
  uploadImages () {
    store.commit('setSynching', true)

    let imageList = []
    const that = this
    let database = new PouchDbService('trees')

    return new Promise((resolve, reject) => {
      database.getAllExtern().then((result) => {
        result.docs.forEach((element) => {
          if (element.local_image) {
            imageList.push(element)
          }
        })
        that.uploadImage(imageList, database, resolve, reject)
      }).catch((error) => {
        reject(new Error('getAllExtern'))
      }).then(() => {
        store.commit('setSynching', false)
      })
    })
  },
  generatepolygon (plotsList) {
    let promises = []; let p

    plotsList.forEach((element) => {
      p = ApiService.send('generatepolygon', {}, { id: element.id })
      promises.push(p)
    })

    return Promise.all(promises)
  },
  fixBinary (bin) {
    var length = bin.length
    var buf = new ArrayBuffer(length)
    var arr = new Uint8Array(buf)
    for (var i = 0; i < length; i++) {
      arr[i] = bin.charCodeAt(i)
    }
    return buf
  },
  createBlob (data, type) {
    let binary = this.fixBinary(atob(data))
    return new Blob([binary], { type: type })
  },
  async uploadImage (imageList, database, resolve, reject) {
    await fileService.setFileSystemRequest()

    const that = this
    let upload = imageList.splice(0, 1)
    if (upload.length !== 1) {
      resolve('success')
      return
    }

    let element = upload[0]

    let nativeImagePth = element.local_image
    let imagePath = element.local_image.split('/')

    fileService.getFile(imagePath[imagePath.length - 1]).then((file) => {
      return file.file((file) => {
        fileService.readFile(file).then((result) => {
          let splittet = result.split(',')

          let blob = that.createBlob(splittet[1], file.type)
          ApiService.send('uploadTreeImage', {}, { id: element.id, image: blob }).then((result) => {
            element.image = result.data.data.file
            delete element.local_image
            return database.post(element)
          }).then(() => {
            return fileService.deleteFileByUrl(nativeImagePth)
          }).then(() => {
            that.uploadImage(imageList, database, resolve, reject)
          }).catch((error) => {
            reject(error)
          })
        })
      })
    })
  },
  mapData: {
    delete (result) {
      let uploadData = []
      result.forEach((element) => {
        uploadData.push({
          intern: element,
          params: {
            id: element.id
          },
          data: {}
        })
      })
      return uploadData
    },

    plotsCreate (result, parents) {
      let uploadData = []
      result.forEach((element) => {
        let data = {
          farmer_id: element.farmer_id
        }
        if (element.planting_date) data.planting_date = element.planting_date
        if (element.species_id) data.species_id = element.species_id

        uploadData.push({
          intern: element,
          params: {},
          data: data
        })
      })
      return uploadData
    },
    surveysCreate (result, parents) {
      let uploadData = []
      result.forEach((element) => {
        if (!element.date_end) return
        if (!parents[element.parentId]) {
          return
        }

        uploadData.push({
          intern: element,
          params: {},
          data: {
            date_start: element.date_end.split('T')[0],
            date_end: element.date_end.split('T')[0],
            plot_id: parents[element.parentId].id
          }
        })
      })

      return uploadData
    },
    treesCreate (result, parents) {
      let uploadData = []; let toUpload

      result.forEach((element) => {
        if (!parents[element.parentId]) return

        toUpload = {
          intern: element,
          params: {},
          data: {
            survey_id: parents[element.parentId].id,
            species_id: element.species_id,
            geodata: JSON.stringify(element.geodata),
            timestamp: element.timestamp.split('.')[0] + '+00:00',
            dbh_cm: element.dbh_cm.toString()
          }
        }
        if (element.accuracy) { toUpload.data.accuracy = Math.round(parseInt(element.accuracy)) }

        uploadData.push(toUpload)
      })

      return uploadData
    }
  }
}

export default SynchService
