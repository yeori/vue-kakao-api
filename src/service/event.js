const MAP_EVENT_NAMES = 'click,dbclick,rightclick,mousemove,dragstart,drag,dragend,idle,tilesloaded,maptypeid_changed'.split(
  ','
)
const MARKER_EVENT_NAMES = 'click,rightclick,mouseover,mouseout,dragstart,dragend,remove'.split(
  ','
)
const markerEventListeners = []

function filterMapEvent(obj) {
  return Object.keys(obj)
    .filter(k => MAP_EVENT_NAMES.includes(k))
    .map(evtName => ({
      type: evtName,
      fn: obj[evtName]
    }))
}
function filterMarkerEvent(obj) {
  return Object.keys(obj)
    .filter(k => k.startsWith('marker:'))
    .map(k => k.substring('marker:'.length))
    .filter(k => MARKER_EVENT_NAMES.includes(k))
    .map(evtName => ({
      type: evtName,
      fn: obj[`marker:${evtName}`]
    }))
}
const _eventProxy = {
  click: (e, type, vue) => {
    e.lat = e.latLng.getLat()
    e.lng = e.latLng.getLng()
    e.x = e.point.x
    e.y = e.point.y
    e.type = type
    e.vue = vue
    return e
  },
  dummy: (e, type, vue) => {
    const _e = e || {}
    _e.type = type
    _e.vue = vue
    return _e
  }
}
_eventProxy.dbclick = _eventProxy.rightclick = _eventProxy.mousemove =
  _eventProxy.click
const install = vueInstance => {
  const mapApi = vueInstance.getApi()
  const { $listeners } = vueInstance
  const events = filterMapEvent($listeners)
  events.forEach(elem => {
    const _proxyFn = _eventProxy[elem.type] || _eventProxy.dummy
    window.kakao.maps.event.addListener(mapApi, elem.type, e =>
      elem.fn(_proxyFn(e, elem.type, vueInstance), vueInstance)
    )
  })
  const markerEvents = filterMarkerEvent($listeners)
  markerEvents.forEach(e => {
    e.vue = vueInstance
  })
  markerEventListeners.push(...markerEvents)

  return events
}

const installMarkerListener = (vue, marker) => {
  const listeners = findMarkerListener(vue)
  listeners.forEach(l => {
    window.kakao.maps.event.addListener(marker, l.type, () => {
      const _e = _eventProxy.dummy(null, l.type, vue)
      _e.marker = marker
      _e.lat = marker.getPosition().getLat()
      _e.lng = marker.getPosition().getLng()
      l.fn(_e)
    })
  })
}

const findMarkerListener = vue => {
  const listeners = markerEventListeners.filter(e => e.vue === vue)
  return listeners
}

export default {
  install,
  findMarkerListener,
  installMarkerListener
}
