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
        codeFormat() {
            console.log("code format call")
        },
        toggleTextMode() {
            this.textMode = !this.textMode
        },
        toggleTreeMode() {
            this.treeMode = !this.treeMode
        },
    }
})