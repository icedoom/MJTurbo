<script setup lang="ts">
import MJEditor from './components/MJEditor.vue';
import MenuBar from './components/MenuBar.vue';
import LeftPanel from './views/LeftPanel.vue';


</script>

<template>
  <div class="frame">
    <LeftPanel/>
    <div class="right-panel">
      <MenuBar />
      <div class="editor-con">
        <MJEditor class="meditor" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.frame {
  flex-grow: 1;
  height: 100vh;
  display: flex;
  position: relative;

  .right-panel {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.editor-con {
  width: 100%;
  display: flex;
  flex-grow: 1;
  overflow: auto;

  .meditor {
    width: 100%;
    flex-grow: 1;
    display: grid;
  }
}
</style>
