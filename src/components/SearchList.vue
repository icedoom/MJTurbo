<script lang="ts">
import type { JsonNode } from '@/utils/jsonTree';
import { defineComponent } from 'vue';
import { editorBridge } from "@/stores/editorBridge";
import IconMore from '@/components/icons/IconMore.vue'

export default defineComponent({
  name: 'SearchList',
  props: ['items'],
  components: {IconMore},
  setup() {
    const bridge = editorBridge()
    return {
      bridge
    }
  },
  data() {
    return {
      activePath: ""
    }
  },
  methods: {
    getPath(node: JsonNode) {
      const path = node.pathValue()
      const idx = path.lastIndexOf(node.name)
      return idx > 0 ? path.substring(0, idx -1) : path
    },
    isActive(node: JsonNode) {
      return this.activePath === node.pathValue()
    },
    click(node: JsonNode) {
      this.activePath = node.pathValue()
      this.bridge.eventGotoNode(node)
    }
  }
})
</script>

<template>
  <div class="search-list">
    <div v-for="node in items" class="node-item" :class="{ active: isActive(node) }" @click="click(node)">
      <div class="info-con">
        <div class="node-name">{{ node.name }}</div>
        <div class="node-path">{{ getPath(node) }}</div>
      </div>
      <div class="control">
          <IconMore />
      </div>
    </div>
    </div>
</template>

<style lang="scss" scoped>
.control {
  display: none;
}

.node-item {
  width: 100%;
  height: 2rem;
  display: flex;
  cursor: pointer;

  .info-con {
    flex-grow: 1;
    flex-shrink: 1;
    margin-left: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &:hover {
    .control {
      width: 24px;
      min-width: 24px;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        height: 16px;
        width: 16px;
      }
    }
  }

  &:hover {
    background-color: #e9e9eb;

    .node-path {
      display: block;
    }
  }

  &.active {
    background-color: #d9ecff;
    border: 1px solid #409EFF;
    height: calc(2rem - 2px);

    .node-path {
      display: block;
    }
  }

  .node-name, .node-path {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .node-name {
    font-size: 0.9rem;
    color: #606266;
  }

  .node-path {
    color: #79bbff;
    font-size: 0.5rem;
    display: none;
  }

}
</style>