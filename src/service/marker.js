import eventer from './event'

const MARKER_PROPS = 'image,title,draggable,clickable,zIndex,opacity,altitude,rage'.split(
  ','
)
function MarkerList() {
  let markers = {}
  return {
    add(mapName, marker) {
      mapName = mapName || 'default'
      const list = markers[mapName] || []
      list.push(marker)
      markers[mapName] = list
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
const markerHolder = MarkerList()

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

const _meta = option => {
  const m = {}
  if (option.name) {
    m.name = option.name
  }
  if (option.cate) {
    m.cate = option.cate
  }
  return m
}
const _markerRemoved = marker => {
  markerHolder.removeMarker(marker)
}
const addMarker = (vueInstance, option) => {
  const map = vueInstance.getApi()
  const pos = _pos(option.coord, option.lat, option.lng)
  const _option = _copy(option, {}, MARKER_PROPS)
  _option.map = map
  _option.position = pos
  const marker = new window.kakao.maps.Marker(_option)
  marker.$meta = _meta(option)
  marker.$onRemoved = [_markerRemoved]
  marker.name = option.name
  markerHolder.add(vueInstance.$vnode.data.ref, marker)

  eventer.installMarkerListener(vueInstance, marker)
}

export default {
  addMarker
}
