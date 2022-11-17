<script lang="ts">
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from "@codemirror/state"
import { keymap } from "@codemirror/view"
import { defaultKeymap } from "@codemirror/commands"
import { json } from "@codemirror/lang-json"
import { defineComponent } from "vue";
import { editorBridge } from '@/stores/editorBridge'

class EditorHolder {
    e?: EditorView;
    init = (ref: any) => {
        console.log(ref)

        let startState = EditorState.create({
            doc: "[1,2, {a:12}]\n",
            extensions: [basicSetup, json(), keymap.of(defaultKeymap)]
        })


        console.log(startState)
        this.e = new EditorView({
            parent: ref,
            state: startState
        })
        console.log('JsonEditor Create.', ref)
    }
    destroy = () => {
        this.e?.destroy()
        this.e = void (0)
    }
}

type EventHandler = () => void
interface EventMap {
    [key: string]: EventHandler|undefined
}



export default defineComponent({
    name: "MJEditor",
    setup() {

        const bridge = editorBridge()
        return {bridge}
    },
    data() {
        return {
            editorHolder: new EditorHolder()
        }
    },
    mounted() {
        this.editorHolder.init(this.$refs['editor'])

        const envMap:EventMap = {
            "codeFormat": this.codeFormat
        }

        function eventDispatch(e: {name: string}) {
            const func = envMap[e.name]
            if (func) {
                func()
            }
        }
        this.bridge.$onAction(eventDispatch, true)
    },
    beforeUnmount() {
        this.editorHolder.destroy()
    },
    methods: {
        codeFormat() {
            console.log("now format")
            console.log(this.editorHolder.e?.state)
        }
    },
})





</script>

<template>
    <div ref="editor"></div>
</template>