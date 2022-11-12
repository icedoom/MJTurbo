<script setup lang="ts">
import MJEditorVue from './components/MJEditor.vue';
</script>

<template>
  <div class="menu-bar"></div>
  <div class="editor-con">
    <MJEditorVue class="main-editor" />
  </div>
</template>

<style scoped>
.menu-bar {
  height: 60px;
  width: 100%;
  background-color: blue;
}
</style>
