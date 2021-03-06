import marker from './service/marker'

const scriptId = `kakaomap-sdk-${Math.random()
  .toString(16)
  .substring(2)}`
let queue = []
let loaded = false

const loadScript = key => {
  const el = document.querySelector('#' + scriptId)
  if (el) {
    return
  }
  if (!key) {
    throw new Error(`invalid api key: [${key}]`)
  }
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.setAttribute('id', scriptId)
  const head = document.querySelector('head')
  head.appendChild(script)
  script.onload = () => {
    window.kakao.maps.load(() => {
      loaded = true
      marker.installHelperMethods()
      queue.forEach(callback => {
        callback()
      })
      queue = null
    })
  }
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`
}

const loader = (callback, apiKey) => {
  if (!loaded) {
    queue.push(callback)
    loadScript(apiKey)
  } else {
    callback()
  }
}
export default loader
