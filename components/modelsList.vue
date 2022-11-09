<template>
  <div class="models-wrapper">
    <div class="models-bg"></div>
    <div class="models">
      <h3 class="models-title">Models:</h3>
      <ul class="list">
        <li v-for="model in models" :key="model.name" class="li" @click="useModel(model)">
          {{ model.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import dataModels from "@/data/models.json"
export default {
  data: () => {
    const basePrefix = process.env.baseUrl;
    return {
      models: dataModels?.models?.map(item => {
        const src = `${basePrefix}${item.src}`;
        return {
          ...item,
          src,
        };
      }),
    }
  },
  methods: {
    useModel(model){
      this.$store.commit('current/changeCurrent', {key: 'model', item: model})
    },
  }
}
</script>

<style lang="scss" scoped>
@import "/assets/scss/components/models";
@import "/assets/scss/components/list";
</style>
