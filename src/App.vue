<script setup lang="ts">
import MJEditorVue from './components/MJEditor.vue';
</script>

<template>
  <div class="menu-bar"></div>
  <div class="editor-con">
    <MJEditorVue class="meditor" />
  </div>
</template>

<style scoped lang="scss">
.menu-bar {
  height: 60px;
  width: 100%;
  background-color: blue;
}

.editor-con {
  width: 100%;
  display: flex;
  flex-grow: 1;

  .meditor {
    width: 100%;
    flex-grow: 1;
    display: grid;
  }
}
</style>
