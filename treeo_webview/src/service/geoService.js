
const GeoService = {
  options: {
    maximumAge: 3000,
    timeout: 6000,
    enableHighAccuracy: true
  },
  watching: false,
  watchId: null,
  getCurrentPosition () {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => { resolve(position) },
        (error) => { reject(error) }
      )
    })
  },
  watchPosition (onSuccess, onError) {
    this.watchId = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      this.options
    )
    return this.watchId
  },
  clearWatch (watchId) {
    navigator.geolocation.clearWatch(this.watchId)
    navigator.geolocation.clearWatch(watchId)
  }
}

export default GeoService
