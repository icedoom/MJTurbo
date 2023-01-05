<script lang="ts">
import { defineComponent } from 'vue';
import type {JsonNode , CollectionJsonNode } from '@/utils/jsonTree'

export default defineComponent({
  name: 'NodeTree',
  props: ['level', 'items'],
  computed: {
    levelClass() {
      let finalLevel = this.level ? this.level : 0
      return `level-${finalLevel}`
    },
    nextLevel() {
      return this.level ? this.level + 1 : 1;
    }
  },
  methods: {
    isCollection(node: JsonNode) {
      return node.type === 'A' || node.type === 'O'
    },
    itemTypeClass(item: JsonNode) {
      return 'item-type-' + item.type
    },
    collectionLenth(node: JsonNode) {
      if (node.type === 'A') {
        return `[${(node as CollectionJsonNode).children.length}]`
      }
      if (node.type === 'O') {
        return `{${(node as CollectionJsonNode).children.length}}`
      }
      return ""
    }
  }
})
</script>


<template>
  <div class="tree-list">
    <template v-for="item in items">
      <div class="tree-item-con">
        <div class="tree-item">
          <span :class="levelClass"></span>
          <span :class="['item-type', itemTypeClass(item)]">{{ item.type }}
          <span v-if="isCollection(item)"  class="item-extra">{{ collectionLenth(item) }}</span>
          
          </span>
          <span class="item-name" :tooltips="item.path.value">{{ item.name }}</span>
        </div>
        <NodeTree v-if="isCollection(item)" :items="item.children" :level="nextLevel"/>
      </div>
    </template>
  </div>
</template>


<style lang="scss">
.tree-item {
  .level-0 { padding-left: 12px;}
  .level-1 { padding-left: 20px;}
  .level-2 { padding-left: 28px;}
  .level-3 { padding-left: 36px;}
}
.tree-item {
  height: 2rem;
  display: flex;
  align-items: center;
  color: #606266;
  cursor: pointer;
  filter: opacity(0.8);

  &:hover {
    transition: all .3s;
    filter: none;
    color: #303133;
    background-color: #F5F7FA;
  }

  .item-type {
    //height: 16px;
    border-radius: 2px;
    display: flex;
    height: 1.2rem;
    font-size: 10px;
    margin-right: 4px;
    color: white;
    padding-left: 4px;
    padding-right: 4px;
    align-items: center;

    .item-extra {
      padding-left: 4px;
    }

    &.item-type-N {
      background-color: #9E1068;
    }

    &.item-type-S {
      background-color: #389E0D;
    }

    &.item-type-B {
      background-color: #1677FF;
    }

    &.item-type-O {
      background-color: #F5222D;
    }

    &.item-type-A {
      background-color: #D4380D;
    }

  }

}

</style>