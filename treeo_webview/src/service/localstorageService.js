const LocalstorageService = {

  myStorage: window.localStorage,

  set: function (key, value) {
    return this.myStorage.setItem(key, value)
  },
  get: function (key) {
    return this.myStorage.getItem(key)
  },
  remove: function (key) {
    this.myStorage.removeItem(key)
  },
  storageAvailable: function () {
    var x = '__storage_test__'

    if (!this.set(x, x)) return false
    this.remove(x)

    return true
  }
}

export default LocalstorageService
