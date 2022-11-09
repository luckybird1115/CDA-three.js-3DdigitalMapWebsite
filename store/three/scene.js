export const state = () => ({
  scene: null,
  world: null,
  shapes: null,
  model: null,
  sensor : null,
})

export const getters = {
  MODEL: (state) => {
    return state.model ? state.model : null
  },
  SENSOR :(state)=>{
    return state.sensor ? state.sensor: null
  }
}

export const mutations = {
  addToScene(state, data){
    state.scene.add(data);
  },
  addModel(state, data){
    state.model= data;
  },
  addSensor(state, data){
    state.sensor = data;
  },
  addToWorld(state, data){
    state.world.add(data);
  },
  addToShapes(state, data){
    state.shapes.add(data);
  },
  removeModel(state, data){
    state.world.remove(data);
  },

  changeCurrent(state, {key, item}){
    state[key] = item;
  }
}
