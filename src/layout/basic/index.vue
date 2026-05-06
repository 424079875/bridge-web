<template>
  <div class="main-page">
    <RouterView v-slot="{ Component }">
      <keep-alive :include="['HomePage']">
        <component :is="Component" :key="$route.path" />
      </keep-alive>
    </RouterView>
  </div>
</template>

<script lang="ts" setup name="BasicLayoutPage"></script>

<style scoped lang="scss">
.main-page {
  background-color: #eeeafd;
  box-sizing: border-box;
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  width: 100vw;
  min-height: 100vh;
  background-image: url("@/assets/bridge_footer_bg.png");
  background-size: 100% auto;
  background-position-y: bottom;
  background-repeat: no-repeat;
  align-items: center;
}
</style>
