import { TOUCH, Vector3 } from "three";

const lookPoint  = new Vector3(0,-2,0)

export const state = () => ({
  controls: null,
  controllerType: null,
})

export const getters = {
  CONTROLLER: (state) => {
    return state.controllerType ? state.controllerType : null
  },
}

export const mutations = {
  changeController(state, data) {
    state.controllerType = data
  },
  changeControls(state, data) {
    state.controls = data
  },
  setAdditionalParams(state, data) {
    switch (data.type) {
      case 'firstPerson':
        state.controls.lookSpeed = 0.1
        state.controls.enableKeys = true
        break
      case 'orbit':
        state.controls.target = lookPoint
        state.controls.screenSpacePanning=false
        state.controls.panSpeed = 0.5
        state.controls.maxDistance = 222400
        state.controls.minDistance = 1
        state.controls.enableRotate = true
        state.controls.maxPolarAngle = 1.5
        // state.controls.enableDamping = true
        // state.controls.dampingFactor = 0.1
        // state.controls.rotateSpeed = 0.5
        state.controls.touches = {
	        ONE: TOUCH.ROTATE,
          TWO: TOUCH.DOLLY_PAN,
        }
    }
  },
  disposeControls(state) {
    state.controls.dispose()
  },
}
