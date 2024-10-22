<template>
  <Navbar></navbar>
  <MainHome></MainHome>
</template>

<script>
import MainHome from './components/MainHome.vue'
import Navbar from './components/NavBar.vue'

export default {
  name: 'App',
  components: {
    MainHome,
    Navbar
  }
}
</script>

<style>

</style>
