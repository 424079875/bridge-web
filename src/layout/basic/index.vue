<template>
  <div class="main-page">
    <RouterView v-slot="{ Component }">
      <keep-alive :include="['HomePage']">
        <component :is="Component" :key="$route.path" />
      </keep-alive>
    </RouterView>
  </div>
</template>

<script lang="ts" setup name="BasicLayoutPage">

</script>

<style scoped lang="scss">
  .main-page {
    background: #F5F8FF;
    box-sizing: border-box;
    height: 100vh;
    overflow-y: scroll;
    overflow-x: hidden;
  }
</style>
