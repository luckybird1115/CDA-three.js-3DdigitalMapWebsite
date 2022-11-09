<template>
  <div class="options-wrapper">
    <div  class="options default-bg">
      <div class="options-section">
        <div class="options-section-icon">
          <ModelIcon />
        </div>
        <vue-slider
        v-model="value"
        :disabled="disabled"
        :min="0.0"
        :max="1.0"
        :interval="0.05"
        ></vue-slider>
      </div>
    </div>
    <div  class="options default-bg">
      <div class="options-section">
        <div class="options-section-icon">
          <SpheresIcon />
        </div>
        <vue-slider
          v-model="opValue"
          :disabled="disabled"
          :min="0.0"
          :max="1.0"
          :interval="0.05"
        ></vue-slider>
      </div>
    </div>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import { roundOf } from '~/utils'
import ModelIcon from '~/assets/svg/model.svg'
import SpheresIcon from '~/assets/svg/spheres.svg'

export default {
  components: {
    VueSlider, ModelIcon, SpheresIcon
  },
  data: () => {
    return {
      opValue: 1.0,
      value: 1.0,
      tooltipPlacement: 'bottom',
    }
  },
  computed: {
    // cameraPosition() {
    //   const tp = this.$store.getters['three/camera/CAMERA_POSITION']
    //   return {
    //     x: roundOf(tp.x, 5),
    //     y: roundOf(tp.y, 5),
    //     z: roundOf(tp.z, 5),
    //   }
    // },
    menu() {
      return this.$store.state.current.menu
    },
    model() {
      return this.$store.getters['three/scene/MODEL']
    },
    sensor(){
      return this.$store.getters["three/scene/SENSOR"]
    },
    panoSpheres() {
      return this.$store.getters['three/panoSpheres/PANORAMAS']
    },
    controllerState() {
      return this.$store.getters['three/controls/CONTROLLER'] === 'orbit'
        ? false
        : true
    },
    disabled() {
      return !this.model
    },
    // handleFormat() {
    //   if (!this.model) return '...'
    //   return (v) => (v ? `${(v * 100).toLocaleString()} %` : ' Hidden ')
    // },
    // handleFormatPano() {
    //   if (!this.panoSpheres) return '...'
    //   return (v) => (v ? `${(v * 100).toLocaleString()} %` : ' Hidden ')
    // },
  },
  watch: {
    value: function (value) {
      this.model.visible = value !== 0
      this.model.material.opacity = value
      this.sensor.map((el)=>{
        el.material.opacity = value
      })
    },
    opValue: function (value) {
      for(const i of this.panoSpheres.model){
        if(i !== this.panoSpheres.active){
              i.visible = value !== 0
              i.material.opacity = value
        }
      }
    },
  },
  methods: {
    changeControllerState() {
      const type = this.controllerState ? 'orbit' : 'firstPerson'
      this.$store.commit('three/controls/changeController', type)
      if (type === 'orbit')
        for (const i of this.panoSpheres.model) {
          i.renderOrder = 10
          i.material.dispose()
          i.material.map = null
          i.material.color = this.panoSpheres.defaultColor
          i.material.opacity = 1
          i.material.needsUpdate = true
        }
      this.$store.commit('three/panoSpheres/deactivate')
    },
  },
}
</script>

<style lang="scss" scoped>
@import '/assets/scss/components/options';
@import '/assets/scss/components/animation';
</style>
