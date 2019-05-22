import PouchDB from 'pouchdb'
import PouchdbFind from 'pouchdb-find'
import AuthService from '../service/authService'
PouchDB.plugin(PouchdbFind)

class PouchDbService {
  constructor (db) {
    this.db = new PouchDB(db, { auto_compaction: true })
    this.userId = AuthService.getUserId()
    this.farmer_id = AuthService.getProfile().id
    this.indexObj = {
      index: {
        fields: [
          'created_at',
          'date_end',
          'farmer_id'
        ],
        name: 'byCreation'
      }
    }
    this.byParentIndex = {
      index: {
        fields: [
          'created_at',
          'parentId',
          'farmer_id'
        ],
        name: 'byParent'
      }
    }
    this.byIdIndex = {
      index: {
        fields: [
          'created_at',
          'id',
          'farmer_id'
        ],
        name: 'byId'
      }
    }
    this.findObj = {
      selector: {
        'created_at': { $gt: null },
        'date_end': { $exists: false },
        'farmer_id': { $eq: this.farmer_id }
      }
    }
    this.endetSurveys = {
      selector: {
        'created_at': { $gt: null },
        'date_end': { $exists: true },
        'farmer_id': { $eq: this.farmer_id }
      },
      sort: [{ created_at: 'desc' }]
    }
    this.byParent = {
      selector: {
        'created_at': { $gt: null },
        'parentId': { $eq: null },
        'farmer_id': { $eq: this.farmer_id }
      },
      sort: [{ created_at: 'desc' }]
    }
    this.onlyIntern = {
      selector: {
        'id': { $exists: false },
        'farmer_id': { $eq: this.farmer_id }
      }
    }
    this.onlyExtern = {
      selector: {
        'id': { $exists: true },
        'farmer_id': { $eq: this.farmer_id }
      }
    }
    this.all = {
      selector: {
        'farmer_id': { $eq: this.farmer_id }
      }
    }
  }
  createIndex (db, index) {
    if (index) {
      return this.db.createIndex(index)
    }
  }
  find (index) {
    return this.db.find(index)
  }
  get (id) {
    return this.db.get(id)
  }
  post (data) {
    if (data._id) {
      return this.db.put(data)
    } else {
      return this.db.post(data)
    }
  }
  postAll (data) {
    return this.db.bulkDocs(data)
  }
  remove (data) {
    return this.db.remove(data)
  }
  destroy () {
    return this.db.destroy()
  }
  clear () {
    const that = this
    return this.getAll().then((result) => {
      return Promise.all(result.docs.map(function (row) {
        return that.remove(row)
      }))
    })
  }
  putAttachment (id, fileName, file, type) {
    return this.db.putAttachment(id, fileName, file, type)
  }
  getAttachment (id, fileName) {
    return this.db.getAttachment(id, fileName)
  }
  allDocs () {
    return this.db.allDocs({ include_docs: true })
  }
  allDocsById (ids) {
    return this.db.allDocs({ keys: ids, include_docs: true })
  }
  getAll () {
    return this.db.find(this.all)
  }
  getEndetSurveys () {
    return this.db.find(this.endetSurveys)
  }
  getAllIntern () {
    return this.db.find(this.onlyIntern)
  }
  getAllExtern () {
    return this.db.find(this.onlyExtern)
  }
}

export default PouchDbService
