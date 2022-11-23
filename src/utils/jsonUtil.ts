import type { EditorState } from '@codemirror/state'
import {syntaxTree} from "@codemirror/language"
import type { TreeCursor } from '@lezer/common'

const clone = (c: TreeCursor) => {
    return c.node.cursor()
}
class SpaceIndent {
    state: EditorState
    constructor(state:EditorState) {
        this.state = state
    }

    deco(c:TreeCursor, comma?:boolean): string {
        return comma? `${this.str(c)},` : this.str(c)
    }

    str(c: TreeCursor): string {
        return this.state.doc.sliceString(c.from, c.to)
    }

    stepIn() { }
    stepOut() { }
} 

class StyledIndent extends SpaceIndent {
    private level: number = 0
    deco(c:TreeCursor, comma?:boolean): string {
        const val = `${"  ".repeat(this.level)}${this.str(c)}`
        return comma ? val + ',' : val
    }
    stepIn(): void {
        this.level += 1
    }
    stepOut(): void {
        this.level -= 1
    }
}

interface Serilizer {
    (c:TreeCursor, indenter:SpaceIndent, seq:string[], comma?:boolean):boolean
}

let BaseSerilizer = (c: TreeCursor, indenter: SpaceIndent, seq: string[], comma?:boolean): boolean => { 
    seq.push(indenter.deco(c, comma))
    return true
}

let ArraySerilizer = (root: TreeCursor, indenter: SpaceIndent, seq: string[], comma?: boolean): boolean => {
    let c = clone(root)
    if (!c.firstChild() && c.name !== '[') return false

    BaseSerilizer(c, indenter, seq)
    indenter.stepIn()
    let size = 0
    while (c.nextSibling() && c.name !== ']' && ++size) {
        const func = getTypeToSeqFun(c.name)
        if (!func) {
            console.log(`unknown node:"${c.name}" as pos:(${c.from}, ${c.to}`)
            return false
        }
        func(c, indenter, seq, true)
    }
    if (size > 0) {
        let lastItem = seq[seq.length - 1]
        seq[seq.length -1] = lastItem.slice(0, lastItem.length -1)
    }
    indenter.stepOut()
    BaseSerilizer(c, indenter, seq, comma)

    return true
}

let typeMap: Map<string, Serilizer> = new Map([
    ["Array", ArraySerilizer],
    ["Number", BaseSerilizer],
    ["String", BaseSerilizer],

])

const getTypeToSeqFun = (nodeType: string) => {
    return typeMap.get(nodeType)
}

class JsonFormater {
    root:TreeCursor
    state:EditorState
    constructor(state:EditorState) {
        this.state = state
        this.root = syntaxTree(state).cursor()
    }

    toStyledString() {
        console.log("start to String")
        let c = clone(this.root)
        if (c.name !== 'JsonText' || !c.firstChild()) {
            return null
        }

        let func  = getTypeToSeqFun(c.name) 
        if (func === undefined) {
            return null
        }
        let seq: string[] = []
        let indenter = new StyledIndent(this.state)
        const ret = func(c, indenter, seq)
        return seq.join('\n')
    }


}

export {
    JsonFormater
}
