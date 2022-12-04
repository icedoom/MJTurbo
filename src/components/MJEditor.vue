<script lang="ts">
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from "@codemirror/state"
import { keymap } from "@codemirror/view"
import {diagnosticCount, linter, lintGutter, nextDiagnostic, openLintPanel, type Diagnostic, type LintSource} from "@codemirror/lint"
import {syntaxTree} from "@codemirror/language"
import { defaultKeymap } from "@codemirror/commands"
import { json , jsonParseLinter} from "@codemirror/lang-json"
import { defineComponent } from "vue";
import { editorBridge } from '@/stores/editorBridge'
import { JsonFormater } from '@/utils/jsonUtil'


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
        let theme = EditorView.theme({
            '.cm-panel.cm-panel-lint ul [aria-selected]': { backgroundColor: '#fcb2b2' },
            '.cm-lintPoint:after': {
                border: '2px solid red',
                position: 'inherit'
            }
        })

        let state = EditorState.create({
            doc: '{"a":12}\n',
            extensions: [basicSetup, json(), linter(myLinter), lintGutter(), keymap.of(defaultKeymap), theme]
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

    getDoc() {
        return this.view ? this.view.state.doc : null
    }

    private styleCode(fun: (formater:JsonFormater)=>string|null) {
        if (this.view === undefined) {
            return
        } 
        const dCount = diagnosticCount(this.view.state)
        if (dCount > 0) {
            openLintPanel(this.view)
            nextDiagnostic(this.view)
            console.log('can not format code due to invalid json data')
            return
        }

        let c = syntaxTree(this.view.state).cursor()
        if (c.name !== 'JsonText') {
            return 
        }

        const formater = new JsonFormater(this.view.state)
        const res = fun(formater)
        if (!res) {
            return
        }
        console.log(res)
        this.view.dispatch({changes: {from: 0, to: this.view.state.doc.length, insert: res }})
    }

    codeFormat() {
        this.styleCode((formater: JsonFormater) => {
            return formater.toStyledString()
        })
    }
    zipCode() { 
        this.styleCode((formater: JsonFormater) => {
            return formater.toZipString()
        })
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
            "codeFormat": this.codeFormat,
            'zipCode': this.zipCode
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
            this.editorHolder.codeFormat()
        },
        zipCode() {
            this.editorHolder.zipCode()
        }
    },
})





</script>

<template>
    <div ref="editor"></div>
</template>