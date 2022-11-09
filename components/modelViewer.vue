<template>
  <div ref="globe" class="viewer">
    <div id="tankGauge" class="top-0 start-0 position-absolute w-100 h-100">
    </div>
  </div>
</template>

<script>
// import Stats from 'stats.js'
import {
  Object3D,
  PerspectiveCamera,
  PropertyBinding,
  Scene,
  TextureLoader,
  Vector2,
  Vector3,
  Matrix4,
  WebGLRenderer,
  Frustum,
  Raycaster,
  Shape,
  Sphere,
  Group,
} from 'three'

import { lerp, RAD2DEG } from 'three/src/math/MathUtils'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { addModel, addPanorama, addPanoSpheres, addGaugeShape, addGaugeValue } from '~/functions/addModel'
// import {addShape, addShapeBox} from '~/functions/addShape'
import { addShapes } from '~/functions/addShapes'
import { roundOf } from '~/utils'

export default {
  data: () => {
    return {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      // stats: new Stats(),
      draging: false,
      panEnable: false,
      mounted: null,
      prevTime: performance.now(),
      velocity: new Vector3(),
      direction: new Vector3(),
      zoom: {
        min: 10,
        max: 45,
        step: 1.0,
      },
      scrollValue: 10,
      injectRender: [],
      clientStartPosition: new Vector3(-17.44205, -1.00702, 8.80215),
      clientFPPosition: new Vector3(),
      frustum: new Frustum(),
      raycaster: new Raycaster(),
      mouse: new Vector2(),
      currenttime: null
    }
  },
  computed: {
    world() {
      return this.$store.state.three.scene.world
    },
    shapesObject() {
      return this.$store.state.three.scene.shapes
    },
    renderer() {
      return this.$store.state.three.renderer.renderer
    },
    panorama() {
      return this.$store.state.current.panorama
    },
    panoSpheres() {
      return this.$store.state.three.panoSpheres
    },
    model() {
      return this.$store.state.current.model
    },
    shapes() {
      return this.$store.state.three.smartShapes.shapes
    },
    shapesCards() {
      return this.$store.state.three.smartShapes.shapesCards
    },
    camera() {
      return this.$store.state.three.camera.camera
    },
    scene() {
      return this.$store.state.three.scene.scene
    },
    controls() {
      return this.$store.state.three.controls.controls
    },
    controllerType() {
      return this.$store.state.three.controls.controllerType
    },
    cameraPosition() {
      return this.$store.getters['three/camera/CAMERA_POSITION']
    },
    size() {
      return this.$store.state.current.size
    },
  },

  watch: {
    panorama: function (val, prevVal) {
      if (val?.id !== prevVal.id) {
        this.setEnvMap()
        addPanorama(this.$store)

        this.$store.commit(
          'three/scene/removeModel',
          this.world.getObjectByName('panorama' + prevVal.id)
        )
      }
    },
    controllerType: function () {
      this.controls && this.$store.commit('three/controls/disposeControls')

      let instance = null
      switch (this.controllerType) {
        case 'firstPerson':
          instance = new PointerLockControls(
            this.camera,
            this.renderer.domElement
          )
          this.panEnable = true
          break
        case 'orbit':
          instance = new OrbitControls(this.camera, this.renderer.domElement)
          this.panEnable = false
          this.clientFPPosition.copy(new Vector3(0, -1, 4.3))
          for (const shape of this.shapes) {
            for (const group of shape.children) {
              group.children[0].material.depthTest = true
              group.children[0].children[0].material.depthTest = true
            }
          }
          break
      }
      this.$store.commit('three/controls/changeControls', instance)
      this.$store.commit('three/controls/setAdditionalParams', {
        type: this.controllerType,
      })
    },
  },

  mounted() {
    // this.stats.showPanel(0)
    // document.body.appendChild(this.stats.dom)

    this.currenttime = new Date()
    this.setScene()
    this.setWorld()

    this.windowSizeChange()
    this.setRenderer()
    PropertyBinding.sanitizeNodeName = (n) => n
    this.setCamera()
    this.setControls()
    this.$refs.globe.appendChild(this.renderer.domElement)
    this.setEnvMap()
    this.start()
    this.attachEvents()

    addPanorama(this.$store)
    addModel(this.$store)
    addPanoSpheres(this.$store)
    addShapes(this.$store)

    addGaugeShape(this.$store)
    this.$store.commit('three/scene/addToWorld', this.$store.state.current.time)
    this.$store.commit('three/scene/addToWorld', this.$store.state.current.value)

    let newdate = new Date()
    setInterval(() => {
        addGaugeValue(this.$store, new Date() )
    }, 1000);

    if (this.mounted) {
      if (this.renderer) {
        this.renderer.setAnimationLoop(null)
        requestAnimationFrame(null)
        this.$store.commit('three/renderer/changeRenderer', null)
      }
      if (this.$store.state.three.camera.camera) {
        this.$store.commit('three/camera/changeCamera', null)
      }
      if (this.mounted.lastChild) {
        this.mounted.current.removeChild(this.mounted.current.lastChild)
      }
      if (this.$store.state.three.controls.controls) {
        this.$store.commit('three/controls/disposeControls')
      }
    }
    this.mounted = this.$refs.globe
  },

  methods: {
    start() {
      this.animate()
    },

    setScene() {
      this.$store.commit('three/scene/changeCurrent', {
        key: 'scene',
        item: new Scene(),
      })
    },

    setRenderer() {
      this.$store.commit(
        'three/renderer/changeRenderer',
        new WebGLRenderer({ alpha: true, antialias: true })
      )
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(
        this.$refs.globe.clientWidth,
        this.$refs.globe.clientHeight
      )
      this.$store.commit('three/renderer/setAdditionalParams')
    },

    disance(p1, p2) {
      return Math.sqrt(
        (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2
      )
    },

    animate() {
      // this.stats.begin()

      if (this.injectRender.length > 0) {
        for (let i = 0; i < this.injectRender.length; i++) {
          this.injectRender[i].call()
        }
      }

      if (this.shapesCards.length !== 0) {
        let cards = []
        this.shapesCards.map((el) => {
          cards.push(this.setPoint(el.shape))
        })
        this.$store.commit('three/smartShapes/setShapesCards', cards)
      }

      if (this.$store.state.three.controls.controllerType === 'orbit') {
        this.controls?.update()
      } else {
        const time = performance.now()
        if (this.panEnable === true) {
          const delta = (time - this.prevTime) / 1000

          this.velocity.x -= this.velocity.x * 10.0 * delta
          this.velocity.z -= this.velocity.z * 10.0 * delta

          this.direction.z =
            Number(this.moveForward) - Number(this.moveBackward)
          this.direction.x = Number(this.moveRight) - Number(this.moveLeft)
          this.direction.normalize() // this ensures consistent movements in all directions

          if (this.moveForward || this.moveBackward)
            this.velocity.z -= this.direction.z * 50.0 * delta
          if (this.moveLeft || this.moveRight)
            this.velocity.x -= this.direction.x * 50.0 * delta

          this.controls.moveRight(-this.velocity.x * delta)
          this.controls.moveForward(-this.velocity.z * delta)
        }
        this.prevTime = time
      }
      this.renderer.render(this.scene, this.camera)
      // this.stats.end()
      requestAnimationFrame(this.animate)
    },

    moveCam(e) {
      this.clientFPPosition.copy(e)
      this.injectRender = []
      this.injectRender.push(() => {
        if (this.controllerType !== 'firstPerson' || !this.controls) return
        if (
          roundOf(this.camera.position.x) ===
            roundOf(this.clientFPPosition.x) &&
          roundOf(this.camera.position.y) ===
            roundOf(this.clientFPPosition.y) &&
          roundOf(this.camera.position.z) === roundOf(this.clientFPPosition.z)
        ) {
          this.clientFPPosition.copy(this.camera.position)
        } else {
          this.camera.position.lerp(this.clientFPPosition, 0.5)
        }
      })
      // this.camera.position = this.clientFPPosition
    },

    panoSpheresUpdate() {
      for (const i of this.panoSpheres.model.filter(
        (el) => el !== this.panoSpheres.active
      )) {
        i.renderOrder = 10
        i.material.dispose()
        i.material.color = this.panoSpheres.defaultColor
        i.material.map = null
        i.material.opacity = 1
        i.material.needsUpdate = true
      }
    },

    checkSpheres() {
      if (this.panoSpheres.active !== null) {
        this.$store.commit('three/panoSpheres/deactivate')
        this.panoSpheresUpdate()
      }
    },

    setPanoSpheres(e) {
      const raycast = new Raycaster()
      const mouse = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      }
      raycast.setFromCamera(mouse, this.camera)
      const freeSpheres = this.panoSpheres.model.filter(
        (el) => el !== this.panoSpheres.active
      )
      const opacity = this.panoSpheres.active
        ? this.panoSpheres.active.material.opacity
        : 1
      const objects = raycast.intersectObjects(freeSpheres)
      if (objects.length !== 0) {
        const pano = objects[0]?.object
        this.$store.commit('three/controls/changeController', 'firstPerson')
        this.moveCam(pano?.position)
        this.$store.commit('three/panoSpheres/active', pano)
        pano.material.dispose()
        pano.renderOrder = 4
        pano.material.color = null
        const texture = new TextureLoader().load(
          `${process.env.baseUrl}${pano.src}`
        )
        pano.material.opacity = opacity;
        pano.material.map = texture
        pano.material.needsUpdate = true
        this.panoSpheresUpdate()
      }
    },

    setCamera() {
      this.$store.commit(
        'three/camera/changeCamera',
        new PerspectiveCamera(
          60,
          this.$refs.globe.clientWidth / this.$refs.globe.clientHeight,
          0.01,
          1000
        )
      )
      this.$store.commit('three/camera/setPosition', this.clientStartPosition)
      this.moveCam(this.camera.position)
    },

    initZoom() {
      this.injectRender.push(() => {
        if (!this.camera) return
        const vExtentSlope =
          (0.5 * this.camera.getFilmHeight()) / this.scrollValue
        const n = RAD2DEG * 2 * Math.atan(vExtentSlope)
        this.camera.fov = lerp(this.camera.fov, n, 0.1)
        this.camera.updateProjectionMatrix()
      })
    },

    setControls() {
      this.$store.commit('three/controls/changeController', 'orbit')
      // this.controls.target = new Vector3(0,-100,0)
      this.initZoom()
    },

    setWorld() {
      this.$store.commit('three/scene/changeCurrent', {
        key: 'world',
        item: new Object3D(),
      })
      this.world.name = 'world'
      this.$store.commit('three/scene/addToScene', this.world)
    },

    setEnvMap() {},

    setPoint(shape) {
      let point = new Vector3()
      point.copy(shape.point)
      point = point.project(this.camera)
      const card = {
        name: shape.name,
        shape: shape,
        point: {
          x: (point.x * 0.5 + 0.5) * window.innerWidth,
          y: (point.y * -0.5 + 0.5) * window.innerHeight,
          z: point.z,
        },
      }
      return card
    },

    setShapes(e) {
      const mouse = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      }
      this.raycaster.params.Line.threshold = 0.001
      this.raycaster.setFromCamera(mouse, this.camera)
      const objects = this.raycaster.intersectObjects(this.shapes)
      if (objects.length !== 0 && objects[0].object.isMesh) {
        const shape = objects[0].object.parent.parent
        switch (e.button) {
          case 0:
            shape.visible = shape?.visible ? false : true
            break
          case 2:
            if (
              this.shapesCards.filter((el) => el.name === shape.name).length ===
              0
            ) {
              shape.point = objects[0].point
              this.$store.commit(
                'three/smartShapes/addShapesCards',
                this.setPoint(shape)
              )
            }
            break
        }
      }
    },

    // Events
    attachEvents() {
      window.addEventListener('resize', this.onWindowResize)
      'mousewheel mousedown mouseup mousemove'.split(' ').forEach((e) => {
        this.$refs.globe.addEventListener(e, this.handleFirstPersonMouse, false)
      })
      window.addEventListener('keydown', this.handleFirstPersonKeyDown)
      window.addEventListener('keyup', this.handleFirstPersonKeyUp)
      window.addEventListener('contextmenu', (e) => {
        e.preventDefault()
      })
    },

    onWindowResize() {
      this.windowSizeChange()
      if (
        this.camera?.aspect &&
        this.renderer &&
        this.$refs.globe &&
        this.$refs.globe?.clientWidth &&
        this.$refs.globe?.clientHeight
      ) {
        this.camera.aspect =
          this.$refs.globe.clientWidth / this.$refs.globe.clientHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(
          this.$refs.globe.clientWidth,
          this.$refs.globe.clientHeight
        )
      }
    },

    windowSizeChange() {
      this.$store.commit('current/changeCurrentItem', {
        key: 'size',
        index: 'width',
        item: window.innerWidth,
      })
      this.$store.commit('current/changeCurrentItem', {
        key: 'size',
        index: 'height',
        item: window.innerHeight,
      })
    },

    handleFirstPersonMouse(e) {
      if (this.controllerType !== 'firstPerson') {
        switch (e.type) {
          case 'mousedown':
            this.setShapes(e)
            this.draging = true
            switch (e.button) {
              case 0:
                this.setPanoSpheres(e)
                break
              case 2:
                break
            }
            break
          case 'mousemove':
            // if (this.shapesCards.length !== 0 && this.draging) {
            //   this.$store.commit('three/smartShapes/setShapesCards', [])
            // }
            break
          case 'mouseup':
            this.draging = false
            break
          case 'mousewheel':
            break
        }
      } else {
        switch (e.type) {
          case 'mousedown':
            this.setShapes(e)
            switch (e.button) {
              case 0:
                this.controls.lock()
                this.draging = true
                this.setPanoSpheres(e)
                break
              case 2:
                break
            }
            break
          case 'mousemove':
            // if (this.shapesCards.length !== 0 && this.draging) {
            //   this.$store.commit('three/smartShapes/setShapesCards', [])
            // }
            break
          case 'mouseup':
            this.draging = false
            switch (e.button) {
              case 0:
                this.controls.unlock()
                break
              case 2:
                break
            }
            break
          case 'mousewheel':
            this.handleZoom(e)
            break
        }
      }
    },

    handleZoom(e) {
      if (e.wheelDeltaY > 0 && this.scrollValue < this.zoom.max) {
        this.scrollValue += this.zoom.step
      } else if (e.wheelDeltaY < 0 && this.scrollValue > this.zoom.min) {
        this.scrollValue -= this.zoom.step
      }
      this.scrollValue = roundOf(this.scrollValue, 2)
    },

    handleFirstPersonKeyDown(event) {
      // if (this.shapesCards.length !== 0) {
      //   this.$store.commit('three/smartShapes/setShapesCards', [])
      // }
      this.injectRender = []
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true
          this.checkSpheres()
          break

        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = true
          this.checkSpheres()
          break

        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = true
          this.checkSpheres()
          break

        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = true
          this.checkSpheres()
          break
      }
    },

    handleFirstPersonKeyUp(event) {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false
          break

        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = false
          break

        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = false
          break

        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = false
          break
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '/assets/scss/components/viewer';
</style>
