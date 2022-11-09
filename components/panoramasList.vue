<template>
  <div class="textures-wrapper">
    <div v-if="menu === 'panoramas'" class="textures animation-bg">
      <h3 class="textures-title">Panoramas:</h3>
      <ul class="list">
        <li v-for="pano in panoramas" :key="pano.name" class="li" @click="switchPano(pano)">
          {{ pano.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import data from '@/data/panoramas.json'

export default {
  data: () => {
    const basePrefix = process.env.baseUrl;
    return {
      panoramas: data?.panoramas?.map(item => ({
        ...item,
        src: `${basePrefix}${item.src}`,
      })),
    }
  },
  computed: {
    menu(){
      return this.$store.state.current.menu;
    }
  },
  methods: {
    switchPano(panorama){
      this.$store.commit('current/changePanorama', panorama);
      this.$store.commit('three/panoSpheres/active', panorama);
    },
  }
}
</script>

<style lang="scss" scoped>
  @import "/assets/scss/components/panoramas";
  @import "/assets/scss/components/list";
  @import "/assets/scss/components/animation";
</style>
