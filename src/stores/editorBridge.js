import { defineStore } from 'pinia'

export const editorBridge = defineStore('editorBridge', {
    state: () => ({
        textMode: true,
        treeMode: true
    }),
    getters: {
        isAllModeOn: (state) => state.textMode && state.treeMode
    },
    actions: {
        toggleTextMode() {
            this.textMode = !this.textMode
        },
        toggleTreeMode() {
            this.treeMode = !this.treeMode
        },
    }
})