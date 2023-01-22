import { defineStore } from 'pinia'
import type { JsonNode }  from '@/utils/jsonTree'

export const editorBridge = defineStore('editorBridge', {
    state: () => ({
        nodeTree: null as JsonNode | null,
        current: {
            path: "",
            id: 0
        }
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
            return this.current.id === node.id && this.current.path === node.path.value
        },
        setCurrentSelectNode(node: JsonNode) {
            this.current.id = node.id
            this.current.path = node.path.value
        }
    }
})