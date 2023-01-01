<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: "PillBtnGroup",
    setup() {

    },
    methods: {
        click() {
            
        }
    }

})
</script>

<template>
    <div class="mj-pill-btn-group">
        <button>Menu</button>
        <button>Pin</button>
    </div>
</template>

<style scoped lang="scss">
.mj-pill-btn-group {
    button {
        background-color: red;
    }
}
</style>