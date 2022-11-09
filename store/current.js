import dataPanoramas from '@/data/panoramas.json'
import dataGauge from '@/data/tankGauge.json'
import panoEnv from '@/static/panoramas/sky-daylight.jpg'
import { Text } from 'troika-three-text'

export const state = () => {
  const panorams = JSON.parse(JSON.stringify(dataPanoramas));
  const panoSpheres = panorams.panoramas;
  const panorama = panoEnv;
  const gauge = JSON.parse(JSON.stringify(dataGauge));
  const gaugeValue = gauge.tankGauge;

  return {
    panorama,
    panoSpheres,
    gaugeValue,
    model: null,
    shapesBase:[],
    shapeCards: [],
    currentShape: null,
    menu: null,
    size: {
      width: 0,
      height: 0,
    },

    time: new Text(), 
    value : new Text(),
  }
}

export const mutations = {
  changeModel(state, model) {
    state.model = model
  },

  changePanorama(state, panorama) {
    state.panorama = panorama
  },

  changeCurrentItem(state, {key, index, item}) {
    state[key] = {
      ...state[key],
      [index]: item,
    }
  },

  setShapesBase(state,data){
    state.shapesBase = data
  },


  changeCurrent(state, {key, item}){
    state[key] = item;
  },

  changeDate(state, data){
    state.time = data
  },

  changeValue(state, data){
    state.value = data
  }
}
