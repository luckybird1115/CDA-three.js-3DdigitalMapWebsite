<template>
  <div
    class="shape-card-wapper"
    :style="{ '-webkit-perspective': `${size.width}px` }"
  >
    <div
      v-for="card in shapesCards"
      v-if="card.point.x && card.point.y && card.point.z < 1"
      class="listv2 shape-card-info"
      ref="shapecard"
      :style="{
        transform: `translate(${card.point.x}px,${card.point.y}px)`,
      }"
    >
      <div class="shape-card-info-items">
        Name: {{ card.shape.metadata.name }} <br />
        Type: {{ card.shape.metadata.type }} <br />
        System: {{ card.shape.metadata.system }} <br />
        Class: {{ card.shape.metadata.class }} <br />
        PID: {{ card.shape.metadata.pid }} <br />
        Desc: {{ card.shape.metadata.desc }} <br />
        Asset path: {{ card.shape.metadata.assetPath }} <br />
        Status: {{ card.shape.metadata.status }}
      </div>
      <div class="close-tag" @click="closeTab(card)">
        <CloseTag />
      </div>
    </div>
  </div>
</template>

<script>
import { DiscreteInterpolant } from 'three'
import CloseTag from '~/assets/svg/close.svg'

export default {
  data: () => {
    return {}
  },
  components: { CloseTag },
  computed: {
    shapesCards() {
      return this.$store.state.three.smartShapes.shapesCards
    },
    size() {
      return this.$store.state.current.size
    },
  },
  watch: {},
  mounted() {},
  methods: {
    closeTab(card) {
      this.$store.commit(
        'three/smartShapes/setShapesCards',
        this.shapesCards.filter((el) => el.name !== card.name)
      )
    },
  },
}
</script>

<style lang="scss" scoped>
// @import '/assets/scss/components/animation';
@import '/assets/scss/components/listv2';
@import '/assets/scss/components/shapeCardInfo';
</style>
