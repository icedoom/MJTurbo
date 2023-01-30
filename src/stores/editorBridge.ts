import { defineStore } from 'pinia'
import { isCollection, type CollectionJsonNode, type JsonNode }  from '@/utils/jsonTree'
type PinNodeMap = Map<string, JsonNode>;

export const editorBridge = defineStore('editorBridge', {
    state: () => ({
        nodeTree: null as JsonNode | null,
        current: {
            path: "",
            id: 0
        },
        pinNodes: new Map() as PinNodeMap
    }),
    getters: {
        hasNodeSellected(state) {
           return state.current.path.length > 0
        }
    },
    actions: {
        isPined(node: JsonNode) { 
            const sign = node.pathSign()
            return this.pinNodes.has(sign)
        },
        togglePin(node: JsonNode) {
            const sign = node.pathSign()
            if (this.pinNodes.has(sign)) {
                this.pinNodes.delete(sign)
            } else {
                this.pinNodes.set(sign, node)
            }
        },
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

            if (this.current.path.length === 0) {
                this._initSelectNode(node)
            }

            this.$patch({nodeTree: node})
        },
        isCurrentSelectNode(node: JsonNode) {
            return this.current.id === node.id && this.current.path === node.path.value
        },
        setCurrentSelectNode(node: JsonNode) {
            this.current.id = node.id
            this.current.path = node.path.value
        },
        navToNode(node: JsonNode) {
            this.setCurrentSelectNode(node)
            this.eventGotoNode(node)
        },
        _initSelectNode(node: JsonNode):boolean {
            if (!isCollection(node)) {
                this.navToNode(node)
                return true
              } else {
                const collectionNode = (node as CollectionJsonNode)
                for (const child of collectionNode.children) {
                  if (this._initSelectNode(child)) {
                    console.log(child)
                    return true
                  }
                }
                return false
              }
        }
    }
})