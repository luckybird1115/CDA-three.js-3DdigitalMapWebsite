export const state = () => ({
  camera: null,
  FP:null,
  OV:null,
})

export const getters = {
  CAMERA_POSITION: (state) => {
    return state.camera ? state.camera.position : null
  },
}

export const mutations = {
  changeCamera(state, data) {
    state.camera = data
  },

  setPosition(state, data) {
    state.camera.position.copy(data)
  },

  setRotation(state, { x, y, z }) {
    state.camera.rotation.x = x
    state.camera.rotation.y = y
    state.camera.rotation.z = z
  },

  add(state, data) {
    state.camera.add(data)
  },
}
