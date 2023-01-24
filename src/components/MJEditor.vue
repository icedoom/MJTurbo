<script lang="ts">
import { EditorView, basicSetup } from 'codemirror'
import { EditorSelection, EditorState } from "@codemirror/state"
import { gutters, keymap, ViewPlugin, ViewUpdate } from "@codemirror/view"
import { diagnosticCount, linter, lintGutter, nextDiagnostic, openLintPanel, type LintSource } from "@codemirror/lint"
import { syntaxTree } from "@codemirror/language"
import { defaultKeymap } from "@codemirror/commands"
import { json, jsonParseLinter } from "@codemirror/lang-json"
import { defineComponent, nextTick } from "vue";
import { editorBridge } from '@/stores/editorBridge'
import { JsonFormater } from '@/utils/jsonUtil'
import { parseTree, type JsonNode } from '@/utils/jsonTree'

type DocUpdate = (stat: EditorState) => void
type BridgeEvent = { name: string, args: Array<any> }
const LOCAL_STORE_KEY = 'mj-data'

class EditorHolder {
    view?: EditorView;
    init = (ref: any, docUpdate: DocUpdate) => {
        const jLinter = jsonParseLinter()
        const myLinter: LintSource = (view: EditorView) => {
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
            },
            ".cm-scroller": { overflow: "visible" }
        })

        const nodeUpdate = ViewPlugin.fromClass(class {
            update(update: ViewUpdate) {
                if (!update.docChanged) {
                    return
                }
                docUpdate(update.state)
            }
        })

        let data = localStorage.getItem(LOCAL_STORE_KEY)
        data = data ? data : ''

        let state = EditorState.create({
            doc: data,
            extensions: [
                lintGutter(),
                basicSetup,
                gutters({ fixed: true }),
                json(),
                linter(myLinter),
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

    state() {
        return this.view?.state
    }

    selectNode(node: JsonNode) {
        const from = node.type === 'S' ? node.from + 1 : node.from;
        const to = node.type === 'S' ? node.to - 1 : node.to;

        this.view?.dispatch({
            selection: EditorSelection.create([
                EditorSelection.range(from, to),
            ]),
            effects: EditorView.scrollIntoView(from, {
                y: 'center'
            }),
            scrollIntoView: true
        })
        this.view?.focus()
    }

    private styleCode(fun: (formater: JsonFormater) => string | null) {
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
        this.view.dispatch({ changes: { from: 0, to: this.view.state.doc.length, insert: res } })
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

type EventHandler = (e: BridgeEvent) => void
interface EventMap {
    [key: string]: EventHandler | undefined
}

export default defineComponent({
    name: "MJEditor",
    setup() {

        const bridge = editorBridge()
        return { bridge }
    },
    data() {
        return {
            editorHolder: new EditorHolder()
        }
    },
    mounted() {
        this.editorHolder.init(this.$refs['editor'], this.docUpdate)
        nextTick(() => this.docUpdate(this.editorHolder.state()))
        const envMap: EventMap = {
            "codeFormat": this.codeFormat,
            'zipCode': this.zipCode,
            'eventGotoNode': this.gotoNode
        }

        function eventDispatch(e: BridgeEvent) {
            const func = envMap[e.name]
            if (func) {
                func(e)
            }
        }
        this.bridge.$onAction(eventDispatch, true)
    },
    beforeUnmount() {
        this.editorHolder.destroy()
    },
    methods: {
        codeFormat(e: BridgeEvent) {
            this.editorHolder.codeFormat()
        },
        zipCode(e: BridgeEvent) {
            this.editorHolder.zipCode()
        },
        gotoNode(e: BridgeEvent) {
            if (e.args.length !== 1) {
                return
            }
            const node = (e.args[0] as JsonNode)
            this.editorHolder.selectNode(node)
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
            localStorage.setItem('mj-data', stat.doc.sliceString(0))
        }
    },
})

</script>

<template>
    <div ref="editor"></div>
</template>