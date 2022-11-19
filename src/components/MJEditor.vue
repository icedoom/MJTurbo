<script lang="ts">
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from "@codemirror/state"
import { keymap } from "@codemirror/view"
import {linter, lintGutter, type Diagnostic, type LintSource} from "@codemirror/lint"
import {syntaxTree} from "@codemirror/language"
import { defaultKeymap } from "@codemirror/commands"
import { json , jsonParseLinter} from "@codemirror/lang-json"
import { defineComponent } from "vue";
import { editorBridge } from '@/stores/editorBridge'

class EditorHolder {
    view?: EditorView;
    init = (ref: any) => {
        const jLinter = jsonParseLinter()
        const myLinter:LintSource = (view: EditorView) => {
            const ds = jLinter(view)
            for (const d of ds) {
                console.log(d)
            }
            return ds
        }

        let state = EditorState.create({
            doc: "[1,2, {a:12}]\n",
            extensions: [basicSetup, json(), linter(myLinter), lintGutter(), keymap.of(defaultKeymap)]
        })

        this.view = new EditorView({
            parent: ref,
            state: state
        })
        console.log('JsonEditor Create.', ref)
    }
    destroy = () => {
        this.view?.destroy()
        this.view = void (0)
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
            console.log(this.editorHolder.view?.state)
        }
    },
})





</script>

<template>
    <div ref="editor"></div>
</template>