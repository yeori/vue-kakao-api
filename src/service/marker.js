import eventer from './event'
const MARKER_PROPS = 'image,title,draggable,clickable,zIndex,opacity,altitude,rage'.split(
  ','
)
// eslint-disable-next-line no-unused-vars
function MarkerList() {
  let markers = {}
  return {
    add(mapName, marker) {
      if (!markers[mapName]) {
        markers[mapName] = []
      }
      markers[mapName].push(marker)
    },
    markersAt(mapName) {
      return markers[mapName] || []
    },
    all() {
      return Object.keys(markers).flatMap(mapName => markers[mapName])
    },
    removeMarker(marker) {
      Object.keys(markers).forEach(mapName => {
        const list = markers[mapName]
        const i = list.findIndex(m => m === marker)
        if (i >= 0) {
          list.splice(i, 1)
        }
      })
    }
  }
}
// const markerHolder = MarkerList()

const _pos = (coord, lat, lng) => {
  if (coord && coord.constructor === window.kakao.maps.LatLng) {
    return coord
  } else if (coord && typeof coord === 'object') {
    return new window.kakao.maps.LatLng(coord.lat, coord.lng)
  } else if (lat && lng) {
    return new window.kakao.maps.LatLng(lat, lng)
  } else {
    throw new Error(`coord or (lat, lng) is required`)
  }
}
const _copy = (src, dst, props) => {
  props.forEach(prop => {
    dst[prop] = src[prop]
  })
  return dst
}

const _meta = (vueInstance, option) => {
  const m = {}
  if (option.name) {
    m.name = option.name
  }
  if (option.cate) {
    m.cate = option.cate
  }
  m.vue = vueInstance
  m._option = option
  return m
}
const _markerRemoved = marker => {
  removeMarker(marker)
}
const addMarker = (vueInstance, option) => {
  const map = vueInstance.getApi()
  const pos = _pos(option.coord, option.lat, option.lng)
  const _option = _copy(option, {}, MARKER_PROPS)
  _option.map = map
  _option.position = pos
  const marker = new window.kakao.maps.Marker(_option)
  marker.$meta = _meta(vueInstance, option)
  marker.$onRemoved = [_markerRemoved]
  marker.name = option.name

  eventer.installMarkerListener(vueInstance, marker)

  vueInstance.getStore().markers.push(marker)
}
const removeMarker = marker => {
  const { vue } = marker.$meta
  const s = vue.getStore()
  const i = s.markers.findIndex(m => m === marker)
  s.markers.splice(i, 1)
  marker.vue = null
  delete marker.name
  delete marker.$onRemoved
  Object.keys(marker.$meta).forEach(k => {
    delete marker.$meta[k]
  })
}

const markerMethods = {
  hide() {
    this.setMap(null)
  },
  remove() {
    this.hide()
    const listeners = [...this.$onRemoved]
    listeners.forEach($l => {
      $l(this)
    })
  },
  getLat() {
    return this.getPosition().getLat()
  },
  getLng() {
    return this.getPosition().getLng()
  }
}
const installHelperMethods = () => {
  const { prototype } = window.kakao.maps.Marker
  Object.keys(markerMethods).forEach(name => {
    prototype[name] = markerMethods[name]
  })
  const l = prototype.addListener
  prototype.addListener = function(type, callback) {
    if (type === 'remove') {
      this.$onRemoved.push(callback)
    } else {
      l.call(this, type, callback)
    }
  }
}

export default {
  addMarker,
  removeMarker,
  installHelperMethods
}
