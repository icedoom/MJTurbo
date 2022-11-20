import type { TreeCursor } from '@lezer/common'
const SPACE = ' '
interface TypeToSeq {
    (c:TreeCursor, indentTimes:number, seq:string[]):boolean
}

let BToSeq = (c: TreeCursor, indentTimes: number, seq: string[]): boolean => { 
    seq.push(`${SPACE.repeat(indentTimes)}${c.name}`)
    return true
}

let ArrayTypeToSeq = (c: TreeCursor, indentTimes: number, seq:string[]): boolean => {
    if (!c.firstChild()) return false

    BToSeq(c, indentTimes, seq)
    const childIndentTimes = indentTimes + 1

    while (c.nextSibling()) {
        const func = getTypeToSeqFun(c.name)
        if (!func) {
            console.log(`unknown node:"${c.name}" as pos:(${c.from}, ${c.to}`)
            return false
        }
        func(c, childIndentTimes, seq)
    }

    return true
}

let typeMap: Map<string, TypeToSeq> = new Map([
    ["Array", ArrayTypeToSeq],
    ["[", BToSeq],
    ["]", BToSeq]
])

const getTypeToSeqFun = (nodeType: string) => {
    return typeMap.get(nodeType)
}


class ArrayTypeFormater extends JsonTypeFormater {
    seq(cursor: TreeCursor, indentTimes: number): string[] | undefined {
        let seq:string[] = []
        if (!cursor.firstChild()) return

        const indent = SPACE.repeat(indentTimes)
        seq.push(`${indent}${cursor.name}`)

        while (cursor.nextSibling()) {
            
        }



        return seq
    }
    
}

class JsonFormater {
    cursor:TreeCursor
    constructor(cursor:TreeCursor) {
        this.cursor = cursor
    }

    toString() {
        if (this.cursor.name !== 'JsonText' || !this.cursor.firstChild()) {
            return null
        }

        let seq: string[] = []
        

    }


}

export {
    JsonFormater
}