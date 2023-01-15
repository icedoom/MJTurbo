<script lang="ts">
import { defineComponent } from 'vue';
import  IconClear from '@/components/icons/IconClear.vue'

export default defineComponent({
  name: "SearchInput",
  components: {IconClear},
  props: ['placeholder', 'modelValue'],
  emits: ['update:modelValue'],
  methods: {
    clear() {
      this.$emit('update:modelValue', '')
    }
  }
})
</script>

<template>
  <div class="mj-search-input">
    <slot name="prefix"></slot>
    <input type="text" class="mj-input-inner" :placeholder="placeholder" 
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement)?.value)"
    />
      <IconClear v-if="modelValue?.length > 0" class="icon-close" @click="clear"/>
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

    .icon-close {
      cursor: pointer;
    }
  }

</style>