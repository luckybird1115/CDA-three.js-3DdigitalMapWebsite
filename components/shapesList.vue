<template>
  <div class="shapes-wrapper">
    <div v-if="menu === 'shapes'" class="shapes default-bg">
      <!-- <h3 class="shapes-title">Search:</h3> -->
      <div class="search">
        <input
          class="search__input"
          name="search"
          v-model="searchText"
          placeholder="Search"
          type="text"
          @keyup.enter="handleInput"
        />
      </div>
      <div class="shapes-tags-wrapper">
        <span v-for="tag in tags" class="shapes-tag" @click="searchText = tag">
          {{ tag }}
        </span>
      </div>
      <div class="search-item">
        <input
          class="search-checkbox"
          type="checkbox"
          name="controllerType"
          :checked="showListed"
          @change="showFromList"
        />
        <label
          class="search-checkbox-item"
          for="controllerType"
          @click="showFromList"
          >Show all</label
        >
      </div>
      <ul class="listv2" v-if="searchText.length === 0">
        <li v-for="system in systems">
          <Disclosure :name="system.name" :shapes="system.shapes">
            <li v-for="istype in makeUniq(sortTypes(system.name, types))">
              <Disclosure
                :name="capitalizeFirstLetter(istype)"
                :shapes="
                  system.shapes.filter(
                    (el) =>
                      el.metadata.system === system.name &&
                      el.metadata.type === istype
                  )
                "
              >
                <li v-for="shape in sortShapes(system.name, istype)">
                  <Disclosure
                    :name="shape.name"
                    :shape="shape"
                    @showmeta="showMeta"
                  />
                </li>
              </Disclosure>
            </li>
          </Disclosure>
        </li>
      </ul>
      <ul class="listv2" v-else>
        <li v-for="shape in list">
          <Disclosure :name="shape.name" :shape="shape" @showmeta="showMeta" />
        </li>
      </ul>
      <div v-if="meta" class="listv2 detail-name">
        <div class="shape_meta">
          <div v-for="(item, index) in meta" class="shape_meta_item">
            <span class="meta_subtitle">{{ `${index}:` }}</span>
            <p class="meta_text">{{ item }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Arrow from '~/assets/svg/arrow_down.svg'
import Disclosure from './Disclosure.vue'
import { Vector3 } from 'three'

export default {
  data: () => {
    return {
      searchText: '',
      meta: null,
      showListed: false,
      isOpen: false,
    }
  },
  components: { Arrow, Disclosure },
  computed: {
    menu() {
      return this.$store.state.current.menu
    },
    camera() {
      return this.$store.state.three.camera.camera
    },
    controls() {
      return this.$store.state.three.controls.controls
    },
    controllerType() {
      return this.$store.state.three.controls.controllerType
    },
    list() {
      if (this.searchText.length > 0) {
        return this.shapes.shapes.filter((el) =>
          this.checkMeta(el, this.searchText.trim())
        )
      } else {
        return this.shapes.shapes
      }
    },
    visible() {
      return this.list.filter((el) => el.visible === true)
    },
    shapes() {
      return this.$store.getters['three/smartShapes/SHAPES']
    },
    tags() {
      return this.searchAndSort('class')
    },
    systems() {
      let systems = []
      for (const system of this.searchAndSort('system')) {
        const group = {
          name: system,
          shapes: this.list.filter((el) => el.metadata.system === system),
        }
        systems.push(group)
      }
      return systems
    },
    types() {
      return this.searchAndSort('type')
    },
  },
  watch: {
    searchText(text) {},
  },
  mounted() {},
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
    },
    makeUniq(arr) {
      const uniqSet = new Set(arr)
      return [...uniqSet]
    },
    searchAndSort(item) {
      let arr = []
      this.list.map((el) => {
        if (el.metadata[item] !== null) {
          arr.push(el.metadata[item])
        }
      })
      return this.makeUniq(arr)
    },
    sortTypes(parent, child) {
      let arr = []
      this.list.map((el) => {
        const data = Object.values(el.metadata)
        for (const item of child) {
          if (data.includes(parent) && data.includes(item)) {
            arr.push(item)
          }
        }
      })
      return arr
    },
    sortShapes(system, type) {
      let arr = []
      this.list.map((el) => {
        const data = Object.values(el.metadata)
        if (
          data.includes(system) &&
          data.includes(type) &&
          data.includes(el.name)
        ) {
          arr.push(el)
        }
      })
      return arr
    },
    checkMeta(el, text) {
      return Object.values(el.metadata)
        .toString()
        .toLowerCase()
        .includes(text.toLowerCase())
    },
    showFromList() {
      switch (this.showListed) {
        case false:
          for (const shape of this.shapes.shapes) {
            shape.visible = false
          }
          for (const shape of this.list) {
            shape.visible = true
          }
          break
        case true:
          for (const shape of this.list) {
            shape.visible = false
          }
          break
      }
      this.showListed = !this.showListed
    },
    showMeta(element) {
      switch (this.meta) {
        case element:
          this.meta = null
          break
        default:
          this.meta = element
      }
    },
    handleInput() {
      if (this.searchText.length > 0 && this.list.length === 1) {
        switch (this.controllerType) {
          case 'orbit':
            this.camera.position.set(
              this.list[0].children[0].position.x + 2,
              this.list[0].children[0].position.y - 1,
              this.list[0].children[0].position.z + 2
            )
            this.controls.target = new Vector3(
              this.list[0].children[0].position.x,
              -1,
              // this.list[0].children[0].position.y,
              this.list[0].children[0].position.z
            )
            break
          case 'firstPerson':
            // console.log(this.controls.getDirection(this.list[0].children[0].position))
            this.camera.position.set(
              this.list[0].children[0].position.x + 2,
              1,
              this.list[0].children[0].position.z + 2
            )
            this.controls.lock();
            this.camera.lookAt(
              this.list[0].children[0].position.x,
              -this.list[0].children[0].position.y,
              this.list[0].children[0].position.z
            )
            this.controls.unlock()
            break
        }
        this.list[0].visible = true
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '/assets/scss/components/shapes';
@import '/assets/scss/components/listv2';
@import '/assets/scss/components/animation';
@import '/assets/scss/components/checkbox';
</style>
