<template>
  <div class="disclosure">
    <div class="disclosure_header">
      <input
        v-if="shape"
        type="checkbox"
        name="happy"
        class="search-checkbox"
        :checked="shape.visible"
        @click="shape.visible=!shape.visible"
      />
      <input
        v-if="shapes"
        type="checkbox"
        name="happy"
        class="search-checkbox"
        :checked="visible"
        @click="changeVisible"
      />
      <label for="happy"></label>
      <div class="li" @click="handleOpen()">
        <span class="search-item-name">
          {{ this.name }}
        </span>
        <div class="arrow__down" :class="{ arrow_down_active: isOpen }">
          <Arrow />
        </div>
      </div>
    </div>
    <div class="disclosure_body" :class="{ open: isOpen }">
      <slot>
      </slot>
    </div>
  </div>
</template>

<script>
import Arrow from '~/assets/svg/arrow_down.svg'

export default {
  props: ['name','shape','shapes'],
  data: () => {
    return {
      isOpen: false,
      groupVisible: false,
    }
  },
  components: { Arrow },
  watch:{
  },
  computed:{
    visible(){
      return this.shapes.filter(el=>el.visible === false).length > 0? false: true;
    },
  },
  mounted(){
    
  },
  methods: {
    handleOpen() {
      this.isOpen = !this.isOpen
      if(this.shape){
        // console.log(this.shape.metadata);
        this.$emit('showmeta',this.shape.metadata)
      }
    },
    changeVisible(){
      for(const item of this.shapes){
        item.visible=!item.visible
      }
    }
  },
}
</script>

<style lang="scss" scoped>
@import '/assets/scss/components/shapes';
@import '/assets/scss/components/listv2';
@import '/assets/scss/components/shapeCardInfo';
@import '/assets/scss/components/animation';
@import '/assets/scss/components/checkbox';
</style>
