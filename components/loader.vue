<template>
  <div class="loader-wrapper">
    <div class="loader">
        <Logo />
        <p>Loading model... please wait</p>
    </div>
  </div>
</template>

<script>
import Logo from "~/static/favicon/logo.svg"

export default {
  data: () => {
    return {
    }
  },
  components:{
    Logo
  }
}
</script>

<style lang="scss" scoped>
@import '/assets/scss/components/loader';
</style>
