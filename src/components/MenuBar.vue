<script lang="ts">
import { defineComponent } from "vue";
import IconMJTurbo from "./icons/IconMJTurbo.vue";
import IconCodeFormat from "./icons/IconCodeFormat.vue";
import { editorBridge } from "@/stores/editorBridge";
import {mapActions } from 'pinia'


export default defineComponent({
  components: { IconMJTurbo, IconCodeFormat },
  name: 'MenuBar',


  methods: {
    ...mapActions(editorBridge, ['codeFormat']),
  },
})
</script>

<template>
    <div class="menu-bar">
        <div class="mj-logo">
            <img src="@/assets/MJTurbo.png">
        </div>
        <div class="mj-menu-group">
            <button class="mj-menu-btn" @click="codeFormat">
                <IconCodeFormat />
            </button>
        </div>
    </div>
</template>


<style scoped lang="scss">
    
.menu-bar {
  height: 50px;
  width: 100%;
  background-color: #0084FF;
  display: flex;
  align-items: center;

  .mj-logo {
    margin: 0 8px 0 8px;
    img {
      height: 50px;
    }
  }

  .mj-menu-group {
    margin-left: 8px;
    display: flex;
    align-items: center;
    height: 100%;
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