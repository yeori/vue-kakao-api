# vue-kakao-api

vue.js 애플리케이션에서 사용 가능한 카카오 API 컴포넌트 모음입니다

아래와 같은 기능을 지원합니다.

- Kakao Map API - 지도, geocoder
- Kakao 지도 gecoder

## 1. Installation

아래의 명령어로 설치합니다

```bash
npm install --save vue-kakao-api
```

## 2. 지도 사용하기

카카오 개발자 센터에서 app을 등록한 후 **JavaScript 키**를 준비합니다

> 이후 문서에서 이 키를 `KAKAO_MAP_JS_KEY`로 언급합니다

### 2.1. 기본 사용법

```javascript
<template>
  <div id="app">
    <h3>카카오 지도를 사용해보자</h3>
    <vue-kakao-map
      apiKey="KAKAO_MAP_JS_KEY"
      :style="{ height: '300px' }"
    />
  </div>
</template>
<script>
import { VueKakaoMap } from 'vue-kakao-api'

export default {
  ...,
  components: {
    VueKakaoMap
  }
}
</script>
```

- 발급받은 키를 `KAKAO_MAP_JS_KEY`에 위치시킵니다

키를 변수로 지정하는 경우 아래와 같이 참조합니다.

```javascript
<template>
  <div id="app">
    <h3>지도 로딩(중심좌표 추적 코드)</h3>
    <vue-kakao-map
      :apiKey="apiKey"
      :style="{ height: '300px' }"
    />
  </div>
</template>
<script>
import { VueKakaoMap } from 'vue-kakao-api'

export default {
  ...,
  components: {
    VueKakaoMap
  },
  data() {
    return {
      ...
      apiKey: 'KAKAO_MAP_JS_KEY'
    }
  }
}
</script>
```

### 2.2. watch: 중심 좌표 추적

지도 컴포넌트를 사용하다 다른 페이지로 이동한 후에 다시 지도 컴포넌트로 되돌아 오면 기존 지도에서의 중심 좌표 정보는 유지되지 않습니다.

아래와 같이 `watch="center"` 옵션 추가로 중심 좌표를 지속적으로 유지합니다.

```html
<template>
  <div id="app">
    <h3>지도 로딩(중심좌표 추적 코드)</h3>
    <vue-kakao-map
      :apiKey="apiKey"
      :style="{ height: '300px' }"
      ref="caffe"
      watch="center"
    />
  </div>
</template>
```

- **ref="caffe"** - 지도마다 중심 좌표를 식별하기 위해 지정함
- **watch="center"** - 현재 지도의 중심좌표를 기록합니다.

ref 값을 사용해서 각 지도 인스턴스의 중심 좌표를 관리합니다.

지도 인스턴스를 식별하기 위해 ref를 사용하지 않는다면 아래와 같이 object literal 형식으로 설정합니다.

```html
<template>
  <div id="app">
    <h3>지도 로딩(중심좌표 추적 코드)</h3>
    <vue-kakao-map
      :apiKey="apiKey"
      :style="{ height: '300px' }"
      :watch="{center: 'caffe'}"
    />
  </div>
</template>
```

- `center` 에 대한 값으로 지도를 식별하는 이름을 적절히 지정합니다.

> 위와같이 객체 리터럴로 설정하는 값 `caffe`가 vue instance의 ref 으로 설정되지 않습니다.

## 3. 좌표를 주소로 변환
