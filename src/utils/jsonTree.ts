import type { EditorState, Text } from '@codemirror/state'
import {syntaxTree} from "@codemirror/language"
import type { TreeCursor } from '@lezer/common'
class JsonNode { 
  parent: JsonNode|null = null
  name:string = ""
  type:string = ""
  from: number = 0
  to: number = 0

  constructor(type: string, from:number, to:number) {
    this.name = type
    this.type = type
    this.from = from
    this.to = to
  }
}

class BasicJsonNode extends JsonNode {
  constructor(type: string, from: number, to: number) {
    super(type, from, to)
  }
}

class CollectionJsonNode extends JsonNode {
  children:JsonNode[] = [] 
  constructor(type: string, from: number, to: number) {
    super(type, from, to)
  }

  addChild(node: JsonNode):boolean {
    node.parent = this
    if (node.name === "") {
      node.name = `${this.children.length}`
    }
    this.children.push(node)
    return true
  }

}
class ArrayJsonNode extends CollectionJsonNode {
  constructor(from: number, to: number) {
    super('array', from, to)
  }
}

class ObjectJsonNode extends CollectionJsonNode {
  constructor(from: number, to: number) {
    super('object', from, to)
  }
}


abstract class NodeIter {
  type:string = ""
  constructor(type: string) {
    this.type = type
  }
  abstract iter(c: TreeCursor, doc: Text): JsonNode|undefined;
}

class BasicTypeIter extends NodeIter {
  iter(c: TreeCursor, doc:Text): JsonNode|undefined {
    return new BasicJsonNode(this.type, c.from, c.to)
  }
}

abstract class CollectionTypeIter extends NodeIter {
  leftBracket: string;
  rightBracket: string;

  constructor(type: string, brackets: string) {
    super(type);
    if (brackets.length != 2) {
      throw new Error("invalid brackets. brackets length must be 2");
    }
    this.leftBracket = brackets[0];
    this.rightBracket = brackets[1];
  }

  iter(c: TreeCursor, doc: Text): JsonNode| undefined {
    let node = this.createNode(c)
    if (!c.next() || !this.isBegin(c)) {
      return ;
    }
    while (c.next() && !this.isEnd(c)) {
      if (!this.iterChild(c, node, doc)) {
        return ;
      }
    }
    return node;
  }

  isBegin(c: TreeCursor): boolean { return c.name === this.leftBracket; }
  isEnd(c: TreeCursor): boolean { return c.name === this.rightBracket; }

  abstract iterChild(c: TreeCursor, node: CollectionJsonNode, doc: Text): boolean 
  abstract createNode(c:TreeCursor):CollectionJsonNode
}

class ArrayTypeIter extends CollectionTypeIter {
  constructor() {
    super('array', '[]')
  }
  iterChild(c: TreeCursor, parent: CollectionJsonNode, doc: Text): boolean {
    let it = getIter(c.name)
    let n = it?.iter(c, doc)
    if (n) {
      n.name = ""
      return parent.addChild(n)
    }
    return false
  }

  createNode(c: TreeCursor): CollectionJsonNode {
    return new ArrayJsonNode(c.from, c.to)
  }
}
class ObjectTypeIter extends CollectionTypeIter {
  constructor() {
    super('object', '{}')
  }
  iterChild(c: TreeCursor, parent: CollectionJsonNode, doc: Text): boolean {
    if (c.name !== "Property") {
      return false;
    }
    // asume the struct is correct below

    // handle PropertyName. same as string
    c.next();
    let name = doc.sliceString(c.from+1, c.to-1)

    // handle PropertyValue
    c.next();
    let it = getIter(c.name);
    let node = it?.iter(c, doc)
    if (!node) {
      return false
    }
    node.name = name
    return parent.addChild(node)
  }

  createNode(c: TreeCursor): CollectionJsonNode {
    return new ObjectJsonNode(c.from, c.to)
  }
}

const STREAM_MAP: Map<string, NodeIter> = new Map([
  ["Number", new BasicTypeIter('number')],
  ["String", new BasicTypeIter('string')],
  ["True", new BasicTypeIter('boolean')],
  ["False", new BasicTypeIter('boolean')],
  ["Array", new ArrayTypeIter()],
  ["Object", new ObjectTypeIter()]
])

function getIter(name:string): NodeIter | undefined {
  let it = STREAM_MAP.get(name)
  if (!it) {
    console.log(`invalid node type: ${name}`)
    return
  }
  return it
}

function parseTree(c: TreeCursor, state:EditorState): JsonNode | undefined {
  if (c.name != 'JsonText' || !c.next()) {
    console.log('invalid data')
    return
  }
  let it = getIter(c.name)
  return it?.iter(c, state.doc)

 }

export {
  parseTree
}