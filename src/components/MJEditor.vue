<script lang="ts">
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from "@codemirror/state"
import { keymap } from "@codemirror/view"
import { defaultKeymap } from "@codemirror/commands"
import { json } from "@codemirror/lang-json"
import { defineComponent } from "vue";

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


export default defineComponent({
    name: "MJEditor",
    data() {
        return {
            editorHolder: new EditorHolder()
        }

    },
    mounted() {
        this.editorHolder.init(this.$refs['editor'])
    },
    beforeUnmount() {
        this.editorHolder.destroy()
    }
})





</script>

<template>
    <div ref="editor"></div>
</template>