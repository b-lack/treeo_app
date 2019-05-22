class FileService {
  constructor (successFn, errorFn) {
    let fileSystem
    errorFn = errorFn || function () {}
    successFn = successFn || function () {}

    if (!window.requestFileSystem) {
      errorFn('not defined')
      return
    }
    const that = this

    fileSystem = window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fs) => {
      that.dirEntry = fs.root
      if (successFn) { successFn(fileSystem) }
    }, errorFn)
  }
  setFileSystemRequest () {
    const that = this
    return new Promise((resolve, reject) => {
      if (!window.requestFileSystem) { resolve(null) }

      window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fs) => {
        that.dirEntry = fs.root
        resolve(fs)
      }, (error) => {
        reject(error)
      })
    })
  }
  resolve (url, successFn) {
    window.resolveLocalFileSystemURL(url, successFn)
  }

  uuidv4 () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = Math.random() * 16 | 0; var v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
  getAllFiles () {
    let that = this
    return new Promise((resolve, reject) => {
      if (!that.dirEntry) reject(new Error('getAllFiles no root'))

      let reader = that.dirEntry.createReader()

      reader.readEntries((entries) => {
        resolve(entries)
      }, (error) => {
        reject(new Error(error))
      })
    })
  }
  readFile (file) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader()
      reader.onloadend = (evt) => {
        resolve(evt.target.result)
      }
      reader.readAsDataURL(file)
    })
  }
  getFile (url) {
    let that = this
    return this.setFileSystemRequest().then(() => {
      return new Promise((resolve, reject) => {
        if (!that.dirEntry) { reject(new Error('getFile no root')) }
        that.dirEntry.getFile(url, { create: false, exclusive: false }, result => {
          resolve(result)
        }, error => {
          reject(error)
        })
      })
    })
  }
  toBase (fileEntry) {
    return new Promise((resolve, reject) => {
      fileEntry.file((file) => {
        var reader = new FileReader()
        reader.onloadend = (e) => {
          var content = this.result
          resolve(content)
        }
        reader.readAsDataURL(file)
      })
    })
  }
  deleteFileByUrl (url) {
    let that = this
    return new Promise((resolve, reject) => {
      if (!that.dirEntry) {
        reject(new Error('no root'))
        return
      }
      that.resolve(url, directoryEntry => {
        directoryEntry.remove(resolve, reject)
      })
    })
  }
  deleteFile (file) {
    const p = new Promise((resolve, reject) => {
      file.remove(
        (result) => {
          resolve(result)
        }, (error) => {
          reject(error)
        }
      )
    })
    return p
  }
  deleteAllFiles () {
    let that = this
    return this.getAllFiles().then((files) => {
      let promises = []
      let p

      files.forEach((file) => {
        p = that.deleteFile(file)
        promises.push(p)
      })
      return Promise.all(promises)
    })
  }
  saveFile (blob) {
    const fileName = this.uuidv4() + '.jpg'

    return new Promise((resolve, reject) => {
      if (!window.requestFileSystem) {
        reject(new Error('window.requestFileSystem not found'))
        return
      }
      this.createFile(fileName, blob, (result) => {
        resolve(result, fileName)
      })
    })
  }
  createFile (fileName, data, successFn) {
    const that = this

    this.dirEntry.getFile(fileName, { create: true, exclusive: false }, (fileEntry) => {
      that.writeFile(fileEntry, data, fileName, successFn)
    })
  }
  writeFile (fileEntry, dataObj, fileName, successFn) {
    fileEntry.createWriter(

      function (fileWriter) {
        fileWriter.onwriteend = () => {
          successFn(fileEntry)
        }

        fileWriter.write(dataObj)
      }

    )
  }
}

export default FileService
