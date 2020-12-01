import loader from './script-loader'
import VueKakaoMap from './components/KakaoMap.vue'
import geoService from './service/gecoder'
import mapService from './service'
import markerService from './service/marker'

const KakoMapApi = {
  install(Vue, options) {
    if (options && options.apiKey) {
      loader(() => {}, options.apiKey)
    }
    // Vue.component('vue-kakao-map', VueKakaoMap)
  }
}
export { VueKakaoMap, geoService, mapService, markerService }

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(KakoMapApi)
}

export default KakoMapApi
