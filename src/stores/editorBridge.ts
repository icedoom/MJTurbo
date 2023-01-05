import { defineStore } from 'pinia'
import type { JsonNode }  from '@/utils/jsonTree'

export const editorBridge = defineStore('editorBridge', {
    state: () => ({
        nodeTree: null as JsonNode | null
    }),
    actions: {
        codeFormat() {
            console.log("code format call")
        },
        zipCode() {
            console.log("zip code call")
        },
        docUpdate(node: JsonNode) {
            this.nodeTree = node
            this.$patch({nodeTree: node})
            console.log(this.nodeTree)
        },
    }
})