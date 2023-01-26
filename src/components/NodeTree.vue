<script lang="ts">
import { defineComponent, ref } from 'vue';
import {type JsonNode , type CollectionJsonNode, isCollection } from '@/utils/jsonTree'
import { editorBridge } from "@/stores/editorBridge";
import IconTriangleRight  from '@/components/icons/IconTriangleRight.vue'
import IconTriangleDown  from '@/components/icons/IconTriangleDown.vue'
import IconPinNormal from '@/components/icons/IconPinNormal.vue'

export default defineComponent({
  name: 'NodeTree',
  components: {IconTriangleRight, IconTriangleDown, IconPinNormal},
  props: ['level', 'items', 'expand'],
  setup() {
    const bridge = editorBridge()
    let checkedPath = ref("")
    return {
      bridge,
      checkedPath
    }
  },
  data() {
    return {
      currentNode: {
        path: "",
        expand: false
      },
      realLevel : this.level ?? 0
    }
  },
  computed: {
    levelClass() {
      let finalLevel = this.level ? this.level : 0
      return `level-${finalLevel}`
    },
    nextLevel() {
      return this.realLevel + 1
    }
  },
  methods: {
    isCollection(node: JsonNode) {
      return isCollection(node)
    },
    isPined(node: JsonNode) {
      return this.bridge.isPined(node)
    },
    collectionLenth(node: JsonNode) {
      if (node.type === 'A') {
        return `[${(node as CollectionJsonNode).children.length}]`
      }
      if (node.type === 'O') {
        return `{${(node as CollectionJsonNode).children.length}}`
      }
      return ""
    },

    contentClick(node: JsonNode) {
      this.bridge.navToNode(node)

      if (this.currentNode.path !== node.path.value) {
        this.currentNode.path = node.path.value
        this.currentNode.expand = true
      } else {
        this.currentNode.expand = !this.currentNode.expand
      }
    },
    pinClick(node: JsonNode) {
      this.bridge.togglePin(node)
    },
    isCurrentSelectNode(node: JsonNode) {
      return this.bridge.isCurrentSelectNode(node)
    },

    isCurrentExpand(node: JsonNode) {
      return this.currentNode.path === node.path.value && this.currentNode.expand
    }
  }
})
</script>


<template>
  <template v-for="item in items" :key="item.id">
    <div class="tree-node" :level="realLevel">
      <div class="node-content" :class="{ active: isCurrentSelectNode(item) }" @click="contentClick(item)">
        <span v-for="n in realLevel" class="item-prefix"></span>

        <template v-if="isCollection(item)">
          <div class="node-icon">
            <IconTriangleDown v-if="isCurrentExpand(item)" />
            <IconTriangleRight v-else />
          </div>
          <span class="children-length">{{ collectionLenth(item) }}</span>
        </template>

        <span class="item-name" :title="item.path.value">{{ item.name }}</span>
        <span class="item-opt" :class="{pined: isPined(item)}" @click.stop="pinClick(item)" title="Pin node">
          <IconPinNormal/>
        </span>
      </div>
      <div v-if="isCollection(item)" class="node-children" :is-expand="isCurrentExpand(item)">
        <NodeTree :items="item.children" :level="nextLevel" />
      </div>
    </div>
  </template>
</template>


<style lang="scss" scoped>
.tree-node {
  .item-prefix {
    width: 12px;
    min-width: 12px;
    height: 100%;
    border-left: 1px solid #d0d1d3;
  }
  .item-name {
    text-overflow: ellipsis;
    overflow: hidden;
    flex-grow: 1;
  }
  .item-opt {
    min-width: 18px;
    height: 100%;
    display: none;
    align-items: center;
    margin-right: 4px;
    color:  #b1b3b8;
  }

  .node-icon {
    margin-right: 4px;
  }

  .children-length {
    color:  #79bbff;
    margin-right: 8px;
  }
}

.tree-node {
  display: block;
  color: #606266;
  cursor: pointer;
  width: 100%;
  white-space: nowrap;

  .node-content {
    height: 2rem;
    align-items: center;
    display: flex;
    width: 100%;

    &.active,&.active:hover{
      background-color:  #d9ecff;
      border: 1px solid #409EFF;
      width: calc(100% - 2px);
      height: calc(2rem - 2px);
    }

    .item-opt.pined {
      display: flex;
      color: #409EFF;
    }
    
    &:hover {
      background-color:   #e9e9eb;
      
      .item-opt {
        display: flex;
      }
    }

  }

  .node-children {
    width: 100%;

    &[is-expand="false"] {
      display: none;
    }
  }

}
</style>