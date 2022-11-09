export const state = () => {
  return {
    active: null,
    model: [],
    defaultColor: null
  }
}

export const getters = {
  PANORAMAS: (state) => {
    return {
      model: state.model ? state.model : null,
      active: state.active ? state.active : null,
      defaultColor: state.defaultColor ? state.defaultColor : null,
    }
  },
}

export const mutations = {
  active(state, data) {
    state.active = data
  },

  deactivate(state) {
    state.active = null
  },

  changeModel(state, data) {
    state.model = data
  },

  changeColor(state, data) {
    state.defaultColor = data
  },

  addModel(state, data) {
    state.model ? state.model.push(data) : (state.model = data)
  },
}
