import {Color, ACESFilmicToneMapping} from 'three'

export const state = () => ({
  renderer: null,
})

export const mutations = {
  changeRenderer(state, data) {
    state.renderer = data
  },
  setAdditionalParams(state) {
    state.renderer.setClearColor(0x23a6d5)
    state.renderer.background = new Color(0xffffff)
    state.renderer.toneMappingExposure = 1.5
    state.renderer.toneMapping = ACESFilmicToneMapping
    state.renderer.shadowMap.enabled = false
  },
  setAnimationLoop(state, { scene, camera }) {
    state.renderer.setAnimationLoop(() => {
      state.renderer.render(scene, camera)
    })
  },
}
