<script lang="ts">
import { defineComponent } from 'vue';
import SearchInput from '@/components/SearchInput.vue'
import IconSearch from '@/components/icons/IconSearch.vue'

export default defineComponent({
  name: "LeftPanel",
  components: {SearchInput, IconSearch},
  data() {
    return {
      isMenuActive: true,
      isPinActive: false

    }
  },
  methods: {
    toggleMenuActive() {
      if (!this.isMenuActive) {
        this.isMenuActive = true
        this.isPinActive = false
      }
    },
    togglePinActive() {
      if (!this.isPinActive) {
        this.isPinActive = true
        this.isMenuActive = false
      }
    }
  }

})
</script>
<template>
  <div class="left-panel">
    <div class="header">
      <div class="logo">
        <img src="@/assets/logo.png" alt="">
      </div>
      <div class="panel-select">
        <button :class="{ active: isMenuActive }" @click="toggleMenuActive">Menu</button>
        <button :class="{ active: isPinActive }" @click="togglePinActive">Pin</button>
      </div>
    </div>
    <div class="content">
      <div class="menu-panel">
        <SearchInput class="node-search" placeholder="Search Node">
          <template #prefix>
            <IconSearch/>
          </template>
        </SearchInput>
        <div class="tree-panel">
        </div>
      </div>
      <div class="pin-panel"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.panel-select {
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  padding-right: 12px;

  button {
    height: 24px;
    width: 50px;
    border-radius: 4px;
    border: var(--mj-select-group-border-normal);
    border-left: 0;
    background-color: white;
    color: rgba(0, 0, 0, 0.3);
    cursor: pointer;

    &:hover {
      color: var(--mj-active-color);
    }

    &.active {
      transform: all 0.2s;
      border: var(--mj-select-group-border-active);
      color: var(--mj-active-color);
    }

    &:first-child {
      border-radius: 4px 0 0 4px;
      border-left: var(--mj-select-group-border-normal);

      &.active {
        border: var(--mj-select-group-border-active);
      }

    }

    &:last-child {
      border-radius: 0 4px 4px 0;

    }
  }
}


.left-panel {
  width: 200px;
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    height: 50px;
    align-items: center;
    padding-left: 12px;

    .logo {
      img {
        height: 32px;
      }
    }
  }
  .content {
    flex-grow: 1;
    
    .menu-panel {
      display: flex;
      flex-direction: column;
    
      .node-search {
        margin-left: 12px;
        margin-right: 12px;
      }
    }
  }
}
</style>