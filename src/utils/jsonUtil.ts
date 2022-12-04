import type { EditorState, Text } from '@codemirror/state'
import {syntaxTree} from "@codemirror/language"
import type { TreeCursor } from '@lezer/common'

function clone(cursor: TreeCursor) {
    return cursor.node.cursor()
}
class DocTyper {
    readonly doc: Text;
    buffer:string[] = []
    row = ""
    warpper = ""
    constructor(doc: Text) {
        this.doc = doc
    }

    str(c: TreeCursor) {
        return this.doc.sliceString(c.from, c.to)
    }

    append(val: string): DocTyper {
        this.row += val
        return this
    }

    endl(): DocTyper {
        this.buffer.push(this.row)
        this.row = ""
        return this
    }

    flush() {
        if (this.row.length > 0) {
            this.buffer.push(this.row)
        }
        const res = this.buffer.join(this.warpper)
        this.buffer = []
        return res
    }

    childBegin() { return this }

    childEnd() { return this }
}

class StyledDocTyper extends DocTyper {
    static INDENT = '  '

    level = 0
    constructor(doc: Text) {
        super(doc)
        this.warpper = '\n'
    }

    append(val: string): DocTyper {
        if (this.row.length === 0 && this.level > 0) {
            this.row = StyledDocTyper.INDENT.repeat(this.level)
        }
        return super.append(val)
    }

    childBegin(): this {
       this.level += 1 
       return this
    }

    childEnd(): this {
        this.level -= 1
        return this
    }
}

abstract class ItemStreamer {
    abstract stream(cursor:TreeCursor, typer:DocTyper): boolean
}

class BaseStreamer extends ItemStreamer {
    
    stream(cursor: TreeCursor, typer: DocTyper): boolean {
        const val = typer.str(cursor)
        typer.append(val)
        return true
    }
}

abstract class CollectionStreamer extends ItemStreamer {
    leftBracket: string
    rightBracket: string
    constructor(brackets:string) {
        super()
        if (brackets.length != 2) {
            throw "invalid brackets. brackets length must be 2"
        }
        this.leftBracket = brackets[0]
        this.rightBracket = brackets[1] 
    }

    stream(cursor: TreeCursor, typer: DocTyper): boolean {
        if (!cursor.next() || !this.isBegin(cursor)) {
            return false
        }
        typer.append(this.leftBracket)
        if (!this.iterStreamChildren(cursor, typer)) {
            return false
        }
        typer.endl().append(this.rightBracket)
        return true
    }

    private iterStreamChildren(cursor:TreeCursor, typer:DocTyper):boolean {
        typer.childBegin()
        let isFirstChild = true 
        while (cursor.next() && !this.isEnd(cursor)) {
            if (isFirstChild) {
                isFirstChild = false
            } else {
                typer.append(',')
            }
            typer.endl()
            if (!this.streamChild(cursor, typer)) {
                return false
            }
        }
        typer.childEnd() 
        return true
    }

    private isBegin(cursor: TreeCursor):boolean {
        return cursor.name === this.leftBracket
     }

    private isEnd(cursor: TreeCursor): boolean {
        return cursor.name === this.rightBracket
    }

    abstract streamChild(cursor:TreeCursor, typer:DocTyper): boolean
}


class ArrayStreamer extends CollectionStreamer {
    constructor() {
        super('[]')
    }

    streamChild(cursor: TreeCursor, typer: DocTyper): boolean {
        const streamer = getTypeStreamer(cursor.name)
        if (!streamer) {
            return false
        }
        return streamer.stream(cursor, typer)
    }
}

class ObjectStreamer extends CollectionStreamer {
    constructor() {
        super('{}')
    }

    streamChild(cursor: TreeCursor, typer: DocTyper): boolean {
        // Property struct:
        // Property
        //  PropertyName (same as string)
        //  <PropertyValue> (spec type of val .like Number )
        if (cursor.name !== 'Property') {
            return false
        }
        // asume the struct is correct below

        // handle PropertyName. same as string
        cursor.next()
        let streamer = getTypeStreamer('String')
        if (!streamer) {
            return false
        }
        streamer.stream(cursor, typer)
        typer.append(':')

        // handle PropertyValue
        cursor.next()
        streamer = getTypeStreamer(cursor.name)
        if (!streamer) {
            return false
        }
        return streamer.stream(cursor, typer)
    }

}

const STREAM_MAP: Map<string, ItemStreamer> = new Map([
    ["Number", new BaseStreamer()],
    ["String", new BaseStreamer()],
    ["True", new BaseStreamer()],
    ["False", new BaseStreamer()],
    ["Array", new ArrayStreamer()],
    ["Object", new ObjectStreamer()],

])

function getTypeStreamer(name: string):ItemStreamer | undefined {
    const streamer = STREAM_MAP.get(name)
    if (!streamer) {
        console.log(`unknown syntrax node type: ${name}`)
        return 
    }
    return streamer
}


class JsonFormater {
    root:TreeCursor
    state:EditorState
    constructor(state:EditorState) {
        this.state = state
        this.root = syntaxTree(state).cursor()
    }

    serializeCode(typer: DocTyper) {
        console.log("start to String")
        let c = clone(this.root)
        if (c.name !== 'JsonText' || !c.firstChild()) {
            return null
        }

        let streamer = getTypeStreamer(c.name) 
        if (streamer === undefined) {
            return null
        }

        if (!streamer.stream(c, typer)) {
            return null
        }

        return typer.flush() 
    }
    toStyledString() {
        return this.serializeCode(new StyledDocTyper(this.state.doc))
    }

    toZipString() {
        return this.serializeCode(new DocTyper(this.state.doc))
    }
}

export {
    JsonFormater
}
