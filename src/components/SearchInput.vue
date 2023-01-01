<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: "SearchInput",
  props: ['placeholder']
})
</script>

<template>
  <div class="mj-search-input">
    <slot name="prefix"></slot>
    <input type="text" class="mj-input-inner" :placeholder="placeholder">
    <slot name="suffix"></slot>
  </div>
</template>

<style scoped lang="scss">
  .mj-search-input {
    display: flex;
    height: 30px;
    align-items: center;
    border-bottom: 1px solid var(--mj-border-color);
    color: var(--mj-border-color);

    input {
      border: none;
      outline: none;
      background: none;

      &::placeholder {
        color: var(--mj-text-color-placeholder);
      }
    }
  }

</style>