<script lang="ts">
import { defineComponent } from "vue";
import IconMJTurbo from "./icons/IconMJTurbo.vue";
import IconCodeFormat from "./icons/IconCodeFormat.vue";
import IconZipCode from "./icons/IconZipCode.vue";
import { editorBridge } from "@/stores/editorBridge";
import {mapActions } from 'pinia'

export default defineComponent({
  components: { IconMJTurbo, IconCodeFormat , IconZipCode},
  name: 'MenuBar',


  methods: {
    ...mapActions(editorBridge, ['codeFormat', 'zipCode']),
  },
})
</script>

<template>
    <div class="menu-bar">
        <div class="mj-menu-group">
            <button class="mj-menu-btn" @click="codeFormat" title="code styled format">
                <IconCodeFormat />
            </button>
            <button class="mj-menu-btn" @click="zipCode" title="code zip">
                <IconZipCode />
            </button>
        </div>
    </div>
</template>


<style scoped lang="scss">
    
.menu-bar {
  height: 50px;
  min-height: 50px;
  width: 100%;
  background-color: #0084FF;
  //background-color: gray;
  display: flex;
  align-items: center;


  .mj-menu-group {
    margin-left: 12px;
    display: flex;
    align-items: center;
    height: 24px;
    border-radius: 4px;
    background-color: rgba(255,255,255, 0.1);
  }

  .mj-menu-btn {
    height: 100%;
    width: 40px;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0);
    color: rgba(255, 255, 255, 0.85);
    border: 0;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1); 
      color: rgba(255, 255, 255, 0.9);
      cursor: pointer;
      transition: all 0.2s ease-in;
    }
    
    &:active {
      background-color: rgba(255, 255, 255, 1);;
      transition: all 0.3s ease-in;
    }
  }
}

</style>