import { defineStore } from 'pinia'
import type { JsonNode }  from '@/utils/jsonTree'

export const editorBridge = defineStore('editorBridge', {
    state: () => ({
        nodeTree: null as JsonNode | null,
        currentSelectNode: ""
    }),
    actions: {
        codeFormat() {
            console.log("code format call")
        },
        zipCode() {
            console.log("zip code call")
        },
        eventGotoNode(node: JsonNode) {
            console.log('event goto node fired')
            console.log(node)
        },
        docUpdate(node: JsonNode) {
            this.nodeTree = node
            this.$patch({nodeTree: node})
            console.log(this.nodeTree)
        },
        isCurrentSelectNode(node: JsonNode) {
            return this.currentSelectNode === node.path.value
        },
        setCurrentSelectNode(node: JsonNode) {
            this.currentSelectNode = node.path.value
        }
    }
})