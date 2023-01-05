<script lang="ts">
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from "@codemirror/state"
import { keymap, ViewPlugin, ViewUpdate} from "@codemirror/view"
import {diagnosticCount, linter, lintGutter, nextDiagnostic, openLintPanel, type LintSource} from "@codemirror/lint"
import {syntaxTree} from "@codemirror/language"
import { defaultKeymap } from "@codemirror/commands"
import { json , jsonParseLinter} from "@codemirror/lang-json"
import { defineComponent } from "vue";
import { editorBridge } from '@/stores/editorBridge'
import { JsonFormater } from '@/utils/jsonUtil'
import { parseTree } from '@/utils/jsonTree'

type DocUpdate = (stat: EditorState) => void
const LOCAL_STORE_KEY = 'mj-data'

class EditorHolder {
    view?: EditorView;
    init = (ref: any, docUpdate: DocUpdate) => {
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
            },
            '&.cm-forcused': {
                outline: 'none'
            }
        })

        const nodeUpdate = ViewPlugin.fromClass(class {
            update(update: ViewUpdate) {
                if (!update.docChanged) {
                    return
                }
                console.log(update)
                docUpdate(update.state)
            }
        })

        let data = localStorage.getItem(LOCAL_STORE_KEY)
        data = data ? data : ''

        let state = EditorState.create({
            doc: data,
            extensions: [
                basicSetup,
                json(),
                linter(myLinter),
                lintGutter(),
                keymap.of(defaultKeymap),
                theme,
                nodeUpdate]
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

    /*
    getDoc() {
        return this.view?.state.doc 
    }
    */

    state() {
        return this.view?.state
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
        this.editorHolder.init(this.$refs['editor'], this.docUpdate)
        setTimeout(()=>this.docUpdate(this.editorHolder.state()), 0)
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
        },

        docUpdate(stat?: EditorState) {
            if (!stat) {
                return
            }
            let c = syntaxTree(stat).cursor()
            let node = parseTree(c, stat)
            if (node) {
                this.bridge.docUpdate(node)
            }
            console.log(node)
            localStorage.setItem('mj-data', stat.doc.sliceString(0))
        }
    },
})





</script>

<template>
    <div ref="editor"></div>
</template>