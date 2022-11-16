<script setup lang="ts">
import MJEditorVue from './components/MJEditor.vue';
import MenuBar from './components/MenuBar.vue';
</script>

<template>
  <MenuBar/>
  <div class="editor-con">
    <MJEditorVue class="meditor" />
  </div>
</template>

<style scoped lang="scss">

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
