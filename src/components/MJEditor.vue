<script lang="ts">
import { EditorView, basicSetup} from 'codemirror'
import { keymap } from "@codemirror/view"
import {defaultKeymap} from "@codemirror/commands"
import { json} from "@codemirror/lang-json"
import { defineComponent } from "vue";

class EditorHolder {
  e?: EditorView;
  init = (ref: any) => {
    console.log(ref)
    this.e = new EditorView({
        doc: "[1,2, {a:12}]\n",
        parent: ref,
        extensions: [basicSetup, json(), keymap.of(defaultKeymap)],
    })    
    console.log('JsonEditor Create.', ref)
  }
  destroy = () => {
    this.e?.destroy()
    this.e = void(0)
  }
}


export default defineComponent({
    name: "MJEditor",
    data () {
        return {
            editorHolder: new EditorHolder()
        }

    },
    mounted () {
        this.editorHolder.init(this.$refs['editor'])
    },
    beforeUnmount() {
        this.editorHolder.destroy()
    }
})





</script>

<template>
    <div class="mjeditor-container">
        <div ref="editor"></div>
    </div>
</template>