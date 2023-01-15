import type { EditorState, Text } from '@codemirror/state'
import type { TreeCursor } from '@lezer/common'

class JPath {
  value: string
  constructor(val = "$") {
    this.value = val
  }

  child(name: string) {
    return new JPath(this.value + name)
  }
}
class JsonNode { 
  parent: JsonNode|null = null
  path: JPath = new JPath()
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

  pathValue() {
    return this.path.value
  }

}

class BasicJsonNode extends JsonNode {
  constructor(type: string, from: number, to: number) {
    super(type, from, to)
  }
}

abstract class CollectionJsonNode extends JsonNode {
  children:JsonNode[] = [] 
  constructor(type: string, from: number, to: number) {
    super(type, from, to)
  }

  addChild(node: JsonNode, path:JPath):boolean {
    node.parent = this
    node.path = path
    this.children.push(node)
    return true
  }

  abstract setChildPath(node: JsonNode): void

}
class ArrayJsonNode extends CollectionJsonNode {
  constructor(from: number, to: number) {
    super('A', from, to)
  }

  setChildPath(node: JsonNode): void {
    node.path.value = `${this.path.value}[${this.children.length}]`

  }
}

class ObjectJsonNode extends CollectionJsonNode {
  constructor(from: number, to: number) {
    super('O', from, to)
  }
  setChildPath(node: JsonNode): void {
    node.path.value = `${this.path.value}.${node.name}`

  }
}


abstract class NodeIter {
  type:string = ""
  constructor(type: string) {
    this.type = type
  }
  abstract iter(c: TreeCursor, doc: Text, path: JPath): JsonNode|undefined;
}

class BasicTypeIter extends NodeIter {
  iter(c: TreeCursor, doc:Text, path: JPath): JsonNode|undefined {
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

  iter(c: TreeCursor, doc: Text, path: JPath): JsonNode|undefined {
    let node = this.createNode(c)
    if (!c.next() || !this.isBegin(c)) {
      return ;
    }
    while (c.next() && !this.isEnd(c)) {
      if (!this.iterChild(c, node, doc, path)) {
        return ;
      }
    }
    return node;
  }

  isBegin(c: TreeCursor): boolean { return c.name === this.leftBracket; }
  isEnd(c: TreeCursor): boolean { return c.name === this.rightBracket; }

  abstract iterChild(c: TreeCursor, node: CollectionJsonNode, doc: Text, path: JPath): boolean 
  abstract createNode(c:TreeCursor):CollectionJsonNode
}

class ArrayTypeIter extends CollectionTypeIter {
  constructor() {
    super('A', '[]')
  }
  iterChild(c: TreeCursor, parent: CollectionJsonNode, doc: Text, path: JPath): boolean {
    let it = getIter(c.name)
    const childName =`[${parent.children.length}]`
    let subPath = path.child(childName)
    let n = it?.iter(c, doc, subPath)
    if (!n) {
      return false
    }
    n.name = childName
    return parent.addChild(n, subPath);
  }

  createNode(c: TreeCursor): CollectionJsonNode {
    return new ArrayJsonNode(c.from, c.to)
  }
}
class ObjectTypeIter extends CollectionTypeIter {
  constructor() {
    super('O', '{}')
  }
  iterChild(c: TreeCursor, parent: CollectionJsonNode, doc: Text, path: JPath): boolean {
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
    const childName =`.${name}`
    let subPath = path.child(childName)
    let node = it?.iter(c, doc, subPath)
    if (!node) {
      return false
    }
    node.name = name
    return parent.addChild(node, subPath)
  }

  createNode(c: TreeCursor): CollectionJsonNode {
    return new ObjectJsonNode(c.from, c.to)
  }
}

const STREAM_MAP: Map<string, NodeIter> = new Map([
  ["Number", new BasicTypeIter('I')],
  ["String", new BasicTypeIter('S')],
  ["True", new BasicTypeIter('B')],
  ["False", new BasicTypeIter('B')],
  ['Null', new BasicTypeIter('N')],
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
  let path = new JPath()
  let root = it?.iter(c, state.doc, path)
  if (root) {
    root.name = '<root>'
  }
  return root

 }

function isCollection(node: JsonNode) {
  return node instanceof CollectionJsonNode;
 }

export {
  parseTree,
  isCollection,
  type JsonNode,
  type CollectionJsonNode
}