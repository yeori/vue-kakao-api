const event = () => window.kakao.maps.event
const defined = (obj, msg) => {
  if (!obj) {
    throw new Error(msg)
  }
  if (typeof obj === 'function' && !obj()) {
    throw new Error(msg)
  }
}
/**
 *
 * @param {WindowSessionStorage} target
 */
function Store(storage) {
  return {
    putJson(name, obj) {
      const v = JSON.stringify(obj)
      storage.setItem(name, v)
    },
    getJson(name) {
      const v = storage.getItem(name)
      return v ? JSON.parse(v) : null
    }
  }
}
// const refName = vueComponent => {
//   const { ref } = vueComponent.$vnode.data
//   defined(ref, 'specify "ref" property in the <vue-kakao-map/>')
//   return ref
// }

const store = new Store(sessionStorage)

const listeners = {
  dragend: [],
  zoom_changed: []
}
const services = {
  center(map, option) {
    const api = map.getApi()
    const k = option.value
    const c = store.getJson(`map.${k}.center`)
    if (c) {
      map.getApi().setLevel(c.lvl)
      map.getApi().setCenter(new window.kakao.maps.LatLng(c.lat, c.lng))
    }
    const listener = () => {
      const c = api.getCenter()
      store.putJson(`map.${k}.center`, {
        lat: c.getLat(),
        lng: c.getLng(),
        lvl: api.getLevel()
      })
    }
    event().addListener(api, 'dragend', listener)
    listeners.dragend.push(listener)
    event().addListener(api, 'zoom_changed', listener)
    listeners.zoom_changed.push(listener)
  },
  noDef(map, option) {
    throw new Error(`undefined service [${option.name}]`)
  }
}
export default {
  watch(map, option) {
    defined(map, `invalid <vue-kakao-map />. when wathing [${option.name}]`)
    defined(
      () => map._isVue,
      `type of vue component required. but ${map.constructor.name}`
    )
    const maps = Array.isArray(map) ? map : [map]
    maps.forEach(map => {
      const fn = services[option.name] || services.noDef
      fn(map, option)
    })
  }
}
