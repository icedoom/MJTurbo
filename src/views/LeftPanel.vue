<script lang="ts">
import { defineComponent } from 'vue';
import SearchInput from '@/components/SearchInput.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import { editorBridge } from '@/stores/editorBridge'
import NodeTree from '@/components/NodeTree.vue';
import SearchList from '@/components/SearchList.vue'
import type { CollectionJsonNode, JsonNode } from '@/utils/jsonTree';
import { isCollection } from '@/utils/jsonTree';
export default defineComponent({
  name: "LeftPanel",
  components: {SearchInput, IconSearch, NodeTree, SearchList},
  setup() {
    const bridge = editorBridge()
    return { bridge }
  },
  data() {
    return {
      isMenuActive: true,
      isPinActive: false,
      searchText: ""
    }
  },
  computed: {
    tree() {
      let node = this.bridge.nodeTree
      console.log(node)
      return node ? [node] : []
    },
    isSearching() {
      return this.searchText.length > 0
    },
    filteredTreeList() {
      let node = this.bridge.nodeTree
      return node ? this.filterTree(node) : []
    }
  },

  methods: {
    filterTree(node: JsonNode) {
      if (this.searchText.length === 0) {
        return [node]
      }

      return this.filterByWord(node)
    },
    filterByWord(node: JsonNode): JsonNode[] {
      if (isCollection(node)) {
        return this.filterCollectionByWord(node as CollectionJsonNode)
      }
      return this.isMatch(node) ? [node] : []
    },

    filterCollectionByWord(node: CollectionJsonNode):JsonNode[]  {
      let res:JsonNode[] = []
      if (this.isMatch(node)) {
        res.push(node)
      }

      return node.children.reduce((pre, cur, _index, _arr) => { 
        const items = this.filterByWord(cur)
        return items ? pre.concat(items) : pre
      }, res)
    },
    isMatch(node: JsonNode) {
      return node.name.search(this.searchText) >= 0
    },

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
    },
    dragStart(e:any) {
      console.log(e)
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
        <SearchInput class="node-search" placeholder="Search Node" v-model="searchText" 
        title="You can input string or regex rule to match node name">
          <template #prefix>
            <IconSearch/>
          </template>
        </SearchInput>
        <div v-if="!isSearching"  class="tree-panel">
          <NodeTree :items="tree"/>
        </div>
        <div v-else class="searching-panel">
          <SearchList :items="filteredTreeList"/>
        </div>
      </div>
      <!--div class="pin-panel"></!--div-->
    </div>
  </div>
    <div class="drag-bar" @mousedown.prevent="dragStart($event)"></div>
</template>

<style scoped lang="scss">
.drag-bar {
    min-width:4px;
    height: 100%;
    background-color: none;
    left: 204px;
    cursor: ew-resize;
    position: absolute;
    z-index: 9999;

    &:hover {
      background-color:  #79bbff;
      transition: all 2s;
    }
  }
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
  min-width: 200px;
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: stretch;

  .header {
    display: flex;
    height: 50px;
    min-height: 50px;
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
    flex-shrink: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .menu-panel {
      display: flex;
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      flex-grow: 1;
      flex-shrink: 1;
      overflow: hidden;

      .node-search {
        margin-left: 12px;
        height: 40px;
        min-height: 40px;
        margin-right: 12px;
      }

      .tree-panel,
      .searching-panel {
        flex-grow: 1;
        flex-shrink: 1;
        overflow: hidden;
        scroll-snap-align: start;
        width: calc(100% - 4px);
        padding-left: 2px;
        padding-right: 2px;

        &:hover {
          overflow: overlay;
        }
      }

      .tree-panel {
        &::-webkit-scrollbar {
          width: 6px;
          height: 1px;
        }

        &::-webkit-scrollbar-thumb {
          background:  rgba(200, 201, 204, .5);
        }
      }
    }
  }
}
</style>