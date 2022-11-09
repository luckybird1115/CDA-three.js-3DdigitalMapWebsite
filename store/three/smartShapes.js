export const state = () => ({
  shapes: [],
  activeShapes:[],
  shapesCards:[],
})

export const getters = {
  SHAPES: (state) => {
    return {
      shapes: state.shapes ? state.shapes : null,
      activeShapes: state.activeShapes ? state.activeShapes : null,
      shapesCards: state.shapesCards ? state.shapesCards : null,
    }
  },
}

export const mutations = {
  addShape(state, data) {
    state.shapes.push(data)
  },
  setShapes(state, data) {
    state.shapes = data
  },
  setActiveShapes(state, data) {
    state.activeShapes = data
  },
  addShapesCards(state, data){
    state.shapesCards.push(data)
  },
  setShapesCards(state, data){
    state.shapesCards = data
  }
}
