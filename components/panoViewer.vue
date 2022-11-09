<template>
  <div class="pano-viewer-wrapper">
    <div class="pano-viewer">
      <div class="pano-viewer-border-wrapper">
        <div class="pano-viewer-border">
          <div class="pano-viewer-section">
            <div class="pano-viewer-item-wrapper">
              <div
                v-bind:class="[
                  shapesVisible
                    ? 'pano-viewer-item-icon-selected'
                    : 'pano-viewer-item-icon',
                ]"
                @click="showAllShapes"
              >
                <SmartShapesIcon />
              </div>
            </div>
            <div class="pano-viewer-item-wrapper">
              <div
                v-bind:class="[
                  shapesStatus
                    ? 'pano-viewer-item-icon-selected'
                    : 'pano-viewer-item-icon',
                ]"
                @click="showStatus"
              >
                <StatusIcon />
              </div>
            </div>
            <div class="pano-viewer-item-wrapper">
              <div
                v-bind:class="[
                  shapesOver
                    ? 'pano-viewer-item-icon-selected'
                    : 'pano-viewer-item-icon',
                ]"
                @click="showShapesOver"
              >
                <TransparentIcon />
              </div>
            </div>
          </div>
        </div>

        <div class="pano-viewer-border">
          <div class="pano-viewer-section">
            <div class="pano-viewer-item-wrapper">
              <div class="pano-viewer-item-slider-group">
                <div
                  v-bind:class="[
                    controllerState
                      ? 'pano-viewer-item-slider-icon-selected'
                      : 'pano-viewer-item-slider-icon',
                  ]"
                  @click="changeControllerState"
                >
                  <PanoIcon v-if="controllerState" />
                  <OrbitIcon v-if="!controllerState" />
                </div>
                <div class="pano-viewer-split-line"></div>
                <div class="pano-viewer-slider-wrapper">
                  <vue-slider
                    v-model="opValue"
                    :disabled="disabled"
                    :min="0.0"
                    :max="1.0"
                    :interval="0.05"
                  ></vue-slider>
                </div>
              </div>
              <!-- <div v-if="disabled">
                <span class="message">Loading model... pls wait</span>
              </div> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Vector3 } from 'three'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import { roundOf } from '~/utils'
import PanoIcon from '~/assets/svg/pano.svg'
import OrbitIcon from '~/assets/svg/orbit.svg'
import SmartShapesIcon from '~/assets/svg/smart-shapes.svg'
import StatusIcon from '~/assets/svg/status.svg'
import TransparentIcon from '~/assets/svg/transparent.svg'

export default {
  components: {
    VueSlider,
    PanoIcon,
    OrbitIcon,
    SmartShapesIcon,
    StatusIcon,
    TransparentIcon,
  },
  data: () => {
    return {
      opValue: 1.0,
      shapesVisible: false,
      shapesStatus: false,
      shapesOver: false,
      tooltipPlacement: 'bottom',
    }
  },
  computed: {
    cameraPosition() {
      const tp = this.$store.getters['three/camera/CAMERA_POSITION']
      return {
        x: roundOf(tp.x, 5),
        y: roundOf(tp.y, 5),
        z: roundOf(tp.z, 5),
      }
    },
    menu() {
      return this.$store.state.current.menu
    },
    panoSpheres() {
      return this.$store.getters['three/panoSpheres/PANORAMAS']
    },
    shapes() {
      return this.$store.getters['three/smartShapes/SHAPES']
    },
    controllerState() {
      return this.$store.getters['three/controls/CONTROLLER'] === 'orbit'
        ? false
        : true
    },
    disabled() {
      return !this.panoSpheres
    },
    handleFormatPano() {
      if (!this.panoSpheres) return '...'
      return (v) => (v ? `${(v * 100).toLocaleString()} %` : ' Hidden ')
    },
  },
  watch: {
    opValue: function (value) {
      if (this.panoSpheres.active !== null) {
        this.panoSpheres.active.visible = value !== 0
        this.panoSpheres.active.material.opacity = value
      }
    },
  },
  methods: {
    changeControllerState() {
      const type = this.controllerState ? 'orbit' : 'firstPerson'
      this.$store.commit('three/controls/changeController', type)
      if (type === 'orbit') {
        for (const i of this.panoSpheres.model) {
          i.renderOrder = 10
          i.material.dispose()
          i.material.map = null
          i.material.color = this.panoSpheres.defaultColor
          i.material.opacity = 1
          i.material.needsUpdate = true
        }
        this.$store.commit('three/panoSpheres/deactivate')
        this.$store.commit(
          'three/camera/setPosition',
          new Vector3(
            this.cameraPosition.x + 3,
            this.cameraPosition.y,
            this.cameraPosition.z
          )
        )
      }
    },
    showAllShapes() {
      switch (this.shapesVisible) {
        case false:
          for (const shape of this.shapes.shapes) {
            shape.visible = true
          }
          break
        case true:
          for (const shape of this.shapes.shapes) {
            shape.visible = false
          }
          break
      }
      this.shapesVisible = !this.shapesVisible
    },
    showStatus() {
      switch (this.shapesStatus) {
        case false:
          for (const shape of this.shapes.shapes) {
            for (const group of shape.children) {
              group.children[0].material.dispose()
              group.children[0].material.color = shape.statusColor
              group.children[0].material.needsUpdate = true
            }
          }
          break
        case true:
          for (const shape of this.shapes.shapes) {
            for (const group of shape.children) {
              group.children[0].material.dispose()
              group.children[0].material.color = shape.color
              group.children[0].material.needsUpdate = true
            }
          }
          break
      }
      this.shapesStatus = !this.shapesStatus
    },
    showShapesOver() {
      switch (this.shapesOver) {
        case false:
          for (const shape of this.shapes.shapes) {
            for (const group of shape.children) {
              group.children[0].material.depthTest = false
              group.children[0].children[0].material.depthTest = false
            }
          }
          this.shapesOver = !this.shapesOver
          break
        case true:
          for (const shape of this.shapes.shapes) {
            for (const group of shape.children) {
              group.children[0].material.depthTest = true
              group.children[0].children[0].material.depthTest = true
            }
          }
          this.shapesOver = !this.shapesOver
          break
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '/assets/scss/components/panoViewer';
@import '/assets/scss/components/animation';
</style>
