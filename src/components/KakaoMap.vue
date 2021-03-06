// eslint-disable-next-line no-unused-vars
<script>
import Vue from 'vue'
import loader from '../script-loader'
import eventer from '../service/event'
import markerService from '../service/marker'

const ref = vue => {
  const { ref } = vue.$vnode.data
  if (!ref) {
    throw new Error('ref should be specified like <vue-kakao-map ref=".." />')
  }
  return ref
}
const initApi = vue => {
  vue.api = new window.kakao.maps.Map(vue.$refs.el, {
    center: new window.kakao.maps.LatLng(vue.lat, vue.lng),
    level: 3
  })
}

const meta = vue => {
  vue.$$store = Vue.observable({
    markers: []
  })
  vue.$$store.addMarker = option => {
    markerService.addMarker(vue, option)
  }
  vue.$$store.removeMarker = markerService.removeMarker
}
const listen = vue => {
  eventer.install(vue)
}

const watches = vue => {
  const { watch } = vue.$props
  if (!watch) {
    return
  }
  const type = typeof watch
  let watchSet
  if (type === 'string') {
    const refName = ref(vue)
    watchSet = watch
      .split(',')
      .map(w => w.trim())
      .filter(w => w.length > 0)
      .map(wname => ({
        name: wname,
        value: refName
      }))
  } else if (type === 'object') {
    watchSet = Object.keys(watch).map(wname => ({
      name: wname,
      value: watch[wname]
    }))
  }
  import('../service').then(service => {
    watchSet.forEach(elem => {
      service.default.watch(vue, elem)
    })
  })
}
export default {
  name: 'VueKakaoMap',
  props: {
    tag: {
      type: String,
      default: 'div'
    },
    apiKey: {
      type: String,
      default: null
    },
    ready: {
      type: Function,
      default: () => {}
    },
    lat: {
      type: [String, Number],
      default: 33.450701
    },
    lng: {
      type: [String, Number],
      default: 126.570667
    },
    watch: {
      type: [Object, String],
      default: null
    }
  },
  data() {
    return {
      api: null,
      c: null
    }
  },
  render(h) {
    const { tag } = this.$props
    const style = this.$vnode.data.style || {}
    style.height = this.asHeight(style.height, '300px')
    this.$vnode.data.style = style
    return h(
      tag,
      {
        ref: 'el'
      },
      this.api ? [] : this.$slots.default
    )
  },
  beforeUpdate() {
    this.c = this.api.getCenter()
  },
  updated() {
    this.api.relayout()
    if (this.c) {
      this.api.setCenter(this.c)
      this.c = null
    }
  },
  mounted() {
    loader(() => {
      initApi(this)
      watches(this)
      listen(this)
      meta(this)
      this.ready(this)
    }, this.apiKey)
  },
  methods: {
    getApi() {
      return this.api
    },
    getStore() {
      return this.$$store
    },
    asHeight(v) {
      return typeof v === 'number' ? `${v}px` : v
    }
  }
}
</script>
