import loader from '../script-loader'
let geoApi = null
const asDecimal = n => {
  if (typeof n === 'number') {
    return n
  } else if (typeof n === 'string') {
    const v = parseFloat(n)
    if (isNaN(v)) {
      throw new Error('invalid coord value ' + n)
    }
    return v
  } else {
    throw new Error('invalid coord value ' + n)
  }
}

const asFunction = n => {
  if (typeof n === 'function') {
    return n
  } else {
    throw new Error('not a function ' + n)
  }
}
const parseLatLng = n => {
  if (n.constructor === window.kakao.maps.LatLng) {
    return {
      lat: n.getLat(),
      lng: n.getLng()
    }
  } else if (typeof n === 'object') {
    return {
      lat: n.lat,
      lng: n.lng
    }
  } else {
    throw new Error('invalid coord argument ' + n)
  }
}
const types = (params, types) => {
  if (params.length !== types.length) {
    return false
  }
  const trues = params
    .map((p, i) => typeof p === types[i])
    .filter(_true => _true)
  return trues.length === types.length
}
const _normalize = _params => {
  const params = [..._params]
  const args = {}
  if (types(params, ['number', 'number', 'function'])) {
    args.lat = asDecimal(params[0])
    args.lng = asDecimal(params[1])
    args.callback = asFunction(params[2])
  } else if (types(params, ['number', 'number'])) {
    // const coord = parseLatLng(params[0])
    args.lat = params[0]
    args.lng = params[1]
    args.callback = null
  } else if (types(params, ['object', 'function'])) {
    const coord = parseLatLng(params[0])
    args.lat = coord.lat
    args.lng = coord.lng
    args.callback = params[1]
  } else if (types(params, ['object'])) {
    const coord = parseLatLng(params[0])
    args.lat = coord.lat
    args.lng = coord.lng
  }
  return args
}
const _response = (res, status) => {
  const _res = {
    success: status === 'OK',
    status
  }
  if (_res.success) {
    _res.address = {}
    _res.address.region = res[0].address.address_name
    _res.address.road = res[0].road_address.address_name
    _res.detail = res[0]
  } else {
    _res.cause = status
  }
  return _res
}
const geoCoder = {
  ready(callback, apiKey) {
    if (geoApi) {
      callback(geoApi)
      return
    }
    loader(() => {
      geoApi = new window.kakao.maps.services.Geocoder()
      callback(geoApi)
    }, apiKey)
  },
  /**
   * 주어진 위도 경도의 주소를 조회합니다.
   * 세가지 방식으로 호출할 수 있습니다.
   *
   * 1) 위도, 경도, callback:
   *
   *    context.coord2Address(lat, lng, (res)=> { ... })
   *
   *
   * 2) 위치, callback:
   *
   *    context.coord2Address({lat, lng}, (res) => { ... })
   *
   *
   * 3) LatLng, callback:
   *
   *    const coord = new kakao.maps.LatLng(...)
   *    context.coord2Address(coord, (res) => { ... })
   *
   * @return {success}
   */
  coord2Address() {
    const args = _normalize(arguments)
    return new Promise((resolve, reject) => {
      geoApi.coord2Address(args.lng, args.lat, (res, status) => {
        const _res = _response(res, status)
        if (args.callback) {
          args.callback(_res)
        } else if (status === 'ERROR') {
          reject(_res)
        } else {
          resolve(_res)
        }
      })
    })
  },
  getApi: () => geoApi
}
export default geoCoder
