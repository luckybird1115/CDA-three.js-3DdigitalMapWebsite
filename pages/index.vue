<template>
  <div class="page">
    <div class="logo">
      <Logo />
    </div>
    <ModelsList v-if="!model" key="models" />
    <div v-else key="viewer">
      <Loader v-if="disabled"/>
      <!--      <PanoramasList />-->
      <OptionsList v-if="MenuToggle" />
      <ShapesList v-if="MenuToggle" />
      <ShapeCardInfo />
      <ModelViewer key="viewer" />
      <PanoViewer v-if="MenuToggle" />

      <div class="menu">
        <button
          v-if="MenuToggle"
          class="menu-button default-bg"
          @click="changeMenu('shapes')"
        >
          <SearchIcon />
        </button>
        <button class="menu-button default-bg" @click="menuToggle">
          <DotsIcon />
        </button>

        <!--       <button-->
        <!--         class="menu-button animation-bg"-->
        <!--         @click="changeMenu('panoramas')"-->
        <!--       >-->
        <!--         Panoramas-->
        <!--       </button>-->

        <!-- <button class="menu-button animation-bg" @click="changeMenu('options')">
          <SettingsIcon/>
        </button> -->
      </div>
    </div>
  </div>
</template>

<script>
import ModelsList from '../components/modelsList'
import ModelViewer from '../components/modelViewer'
import PanoViewer from '../components/panoViewer'
import ShapesList from '../components/shapesList'
import OptionsList from '~/components/optionsList'
import PanoramasList from '~/components/panoramasList'
import ShapeCardInfo from '~/components/shapeCardInfo'
import Loader from '~/components/loader'
import SettingsIcon from '~/assets/svg/setting.svg'
import Logo from '~/static/favicon/logo.svg'
import SearchIcon from '~/assets/svg/search.svg'
import DotsIcon from '~/assets/svg/dots.svg'

export default {
  data: () => {
    return {
      MenuToggle: true,
    }
  },
  components: {
    ModelsList,
    ModelViewer,
    PanoViewer,
    PanoramasList,
    ShapesList,
    OptionsList,
    ShapeCardInfo,
    Loader,
    SettingsIcon,
    Logo,
    SearchIcon,
    DotsIcon,
  },
  computed: {
    model() {
      return this.$store.state.current.model
    },
    loadedModel() {
      return this.$store.getters['three/scene/MODEL']
    },
    disabled() {
      return !this.loadedModel
    },
  },
  methods: {
    changeMenu(data) {
      if (this.$store.state.current.menu !== data) {
        this.$store.commit('current/changeCurrent', { key: 'menu', item: data })
      } else {
        this.$store.commit('current/changeCurrent', { key: 'menu', item: null })
      }
    },
    menuToggle() {
      this.MenuToggle = !this.MenuToggle
    },
  },
}
</script>

<style lang="scss" scoped>
@import '/assets/scss/components/menu';
@import '/assets/scss/components/animation';
</style>
