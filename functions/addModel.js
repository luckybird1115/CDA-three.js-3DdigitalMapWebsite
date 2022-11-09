import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  // AmbientLight,
  BackSide,
  DoubleSide,
  // DirectionalLight,
  // HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  sRGBEncoding,
  TextureLoader,
  Vector3,
  Quaternion,
  Euler,
  Color,
  BoxGeometry,
  PlaneGeometry,
  Texture,
  Sprite,
  PointLight,
  FrontSide
} from 'three'

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

import { Text } from 'troika-three-text'
import sensorModel from "@/data/sensorModel.json"


const addPanorama = (store) => {
  const panoTexture = new TextureLoader().load(store.state.current.panorama);
  const panoGeo = new SphereGeometry(900, 25, 25)
  const panoMaterial = new MeshBasicMaterial({
    map: panoTexture,
    side: BackSide,
    // color: "black"
  })

  const pano = new Mesh(panoGeo, panoMaterial)
  pano.material.toneMapped = false

  pano.scale.set(1, 1, -1)
  pano.rotation.set(-0.06, 0.1, 0.05)
  window.pano = pano
  pano.name = 'panorama' + store.state.current.panorama?.id
  pano.renderOrder = 1
  store.commit('three/envMap/changeEnvMap', pano);
  store.commit('three/scene/addToWorld', pano)
}

function addModel(store) {
  const world = store.state.three.scene.world
  const model = store.state.current.model

  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath(
    'https://cdn.jsdelivr.net/npm/three@0.145.0/examples/js/libs/draco/'
  )
  const loader = new GLTFLoader()
  loader.setDRACOLoader(dracoLoader)

  if (model && model.src) {
    loader.load(
      model.src,
      function (gltf) {
        const loadedModel = gltf.scene
        const prevMaterial = loadedModel.children[0].material
        loadedModel.children[0].material = new MeshBasicMaterial()
        loadedModel.children[0].renderOrder = 1
        MeshBasicMaterial.prototype.copy.call(
          loadedModel.children[0].material,
          prevMaterial
        )
        loadedModel.children[0].material.map.encoding = sRGBEncoding
        loadedModel.name = model.id
        if (world && loadedModel) {
          if (
            loadedModel.children.length > 0 &&
            loadedModel.children[0].material
          ) {
            loadedModel.children[0].material.transparent = 1
            loadedModel.children[0].material.side = DoubleSide
            store.commit('three/scene/addModel', loadedModel.children[0])
          }
          store.commit('three/scene/addToWorld', loadedModel)

          if (!model.active) {
            loadedModel.matrixAutoUpdate = false
            loadedModel.updateMatrix()
          }
        }
      },
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {

        console.log( 'An error happened' );

      }
    )
  }
}

const addPanoSpheres = (store) => {
  const panoSphereGeo = new SphereGeometry(-0.2, 32, 32)
  const defaultColor = new Color(0xf77bef);
  store.commit('three/panoSpheres/changeColor', defaultColor);
  store.state.current.panoSpheres?.map((el) => {

    // A stub to show only manually configured spheres
    if (!el?.rotation) {
      return
    }
    //

    const panoSphereMaterial = new MeshBasicMaterial({
      color: store.state.three.panoSpheres.defaultColor,
      transparent: 1,
      depthTest: false,
    })
    const panoSphere = new Mesh(
      panoSphereGeo,
      panoSphereMaterial
    )
    let offsetY = -32.85
    let offsetX = -322.77
    let offsetZ = 295.05
    panoSphere.position.set(
      el?.coords?.x + offsetX,
      el?.coords?.y + offsetY,
      el?.coords?.z + offsetZ
    )
    panoSphere.rotation.set(
      el?.rotation?.x || Math.PI,
      el?.rotation?.y || 0,
      el?.rotation?.z || 0,
    )
    panoSphere.quaternion.multiply(
      new Quaternion(
        el?.quaternion?.x,
        el?.quaternion?.y,
        el?.quaternion?.z,
        el?.quaternion?.w,
      )
    )
    panoSphere.renderOrder = 10
    panoSphere.name = el?.name
    panoSphere.src = el?.src
    store.commit('three/panoSpheres/addModel', panoSphere)
    store.commit('three/scene/addToWorld', panoSphere)
  })
}

const addLight = (store) => {
  // const hemispheric = new HemisphereLight(0xffffff, 0x7d7d7d, 1.5)
  // hemispheric.position.set(0, 24, 0)
  // store.commit('three/scene/addToScene', hemispheric)
  // const light1 = new AmbientLight(0xffffff, 1.5)
  // light1.name = 'ambient_light'
  // store.commit('three/camera/add', light1)
  // const light2 = new DirectionalLight(0xffffff, 2.5)
  // light2.position.set(0.5, 0, 0.866)
  // light2.name = 'main_light'
  // store.commit('three/camera/add', light2)
}

const addGaugeValue = (store, date) => {
  let nearest = require('nearest-date')
  let dateArray = []
  store.state.current.gaugeValue?.map((dateItem) => {
    dateArray.push(new Date(dateItem.time))
  })
  let index = nearest(dateArray, date)
  let value = store.state.current.gaugeValue[index].value

  let hrs = date.getHours()
  let min = date.getMinutes()
  let sec = date.getSeconds()

  if (hrs < 10) hrs = "0" + hrs
  if (min < 10) min = "0" + min
  if (sec < 10) sec = "0" + sec

  let currentdate = hrs + ":" + min + ":" + sec

  store.state.current.time.text = currentdate
  store.state.current.time.fontSize = 0.03
  store.state.current.time.position.set(-9.28, 0.4, 4.33)
  store.state.current.time.color = 0xFF0000

  store.commit('current/changeDate', store.state.current.time)

  store.state.current.value.text = value
  store.state.current.value.fontSize = 0.06
  store.state.current.value.position.set(-9.3, 0.48, 4.33)
  store.state.current.value.color = 0xFF0000

  store.commit('current/changeValue', store.state.current.value)

}

const addGaugeShape =(store)=>{

  const world = store.state.three.scene.world
  const basePrefix = process.env.baseUrl
  const model = sensorModel?.sensor?.map(item => {
    const src = `${basePrefix}${item.src}`;
    return {
      ...item,
      src,
    }
  })
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath(
    'https://cdn.jsdelivr.net/npm/three@0.145.0/examples/js/libs/draco/'
  )
  const loader = new GLTFLoader()
  loader.setDRACOLoader(dracoLoader)

  loader.load(
    model[0].src,
    function (gltf) {
      const loadedModel = gltf.scene
      loadedModel.scale.set(0.03, 0.03, 0.01)
      loadedModel.position.set(-9.2, 0.3, 4.3)
      let sensor = loadedModel.children[0].children[0].children[0].children[0]
      const prevMaterial = sensor.material
      sensor.material = new MeshBasicMaterial()
      sensor.renderOrder = 1
      MeshBasicMaterial.prototype.copy.call(
        sensor.material,
        prevMaterial
      )
      let display = loadedModel.children[1]
      const prevmat = display.material
      display.material = new MeshBasicMaterial()
      display.renderOrder = 1
      MeshBasicMaterial.prototype.copy.call(
        display.material,
        prevmat
      )

      sensor.material.map.encoding = sRGBEncoding
      let sensorDevice =[]
      sensorDevice.push(sensor)
      sensorDevice.push(display)
      sensorDevice.push(store.state.current.time)
      sensorDevice.push(store.state.current.value)

      if(loadedModel !== null){
        if (
          loadedModel.children.length > 0 &&
          sensor.material
        ) {
          sensor.material.transparent = 1
          sensor.material.side = DoubleSide
          display.material.transparent = 1
          display.material.side = FrontSide
        }

        store.commit('three/scene/addSensor', sensorDevice)
        store.commit('three/scene/addToWorld', loadedModel)
      }
    },
  )

}

export { addPanorama, addPanoSpheres, addModel, addLight, addGaugeValue, addGaugeShape }
