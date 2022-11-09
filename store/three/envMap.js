export const state = () => ({
  envMap: null,
})

export const mutations = {
  changeEnvMap(state, data) {
    state.envMap = data;
  },
}
