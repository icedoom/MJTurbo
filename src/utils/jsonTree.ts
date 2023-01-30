import type { EditorState, Text } from '@codemirror/state'
import type { TreeCursor } from '@lezer/common'


/** 
 * Json node type enum
*/
enum JsonType {
  OBJECT = "O",
  ARRAY = "A",
  STRING = "S",
  NUMBER = "I",
  BOOLEAN = "B",
  NULL = "N"
}

const SEED = 31 

function hashCode(val: string, index:number): number {
  let res = 0
  if (!val) {
    return res;
  }
  for (let i = 0; i < val.length; ++i) {
    const c = val.charCodeAt(i)
    res = (res * SEED + c) & Number.MAX_SAFE_INTEGER
  }
  res = (res * SEED + index) & Number.MAX_SAFE_INTEGER

  return res
}

class DocContext {
  private _path?: JPath 
  constructor(public cursor: TreeCursor, private doc: Text) { }

  get from():number { return this.cursor.from}
  get to():number { return this.cursor.to}
  get name(): string { return this.cursor.name }
  get path(): JPath {
    if (!this._path) {
      this._path = new JPath()
    }
    return this._path
  }

  slice(from: number, to: number): string {
    return this.doc.sliceString(from, to)
  }

  next():boolean {return this.cursor.next()}
  swapPath(newPath: JPath): JPath {
    const cur = this.path
    this._path = newPath
    return cur
  }
}
class JPath {
  readonly value: string = ""
  constructor(val = "$") {
    this.value = val
  }
  arrayChild(name: string): JPath {
    return new JPath(`${this.value}${name}`)
  }

  objectChild(name: string): JPath {
    return new JPath(`${this.value}.${name}`)
  }

}

class JsonNode { 
  parent: JsonNode|null = null
  path: JPath = new JPath()
  name:string = ""
  id: number = 0
  type: JsonType
  from: number
  to: number

  constructor(type: JsonType, from: number, to: number) {
    this.name = type
    this.type = type
    this.from = from
    this.to = to
  }
  pathValue():string {
    return this.path.value
  }
  pathSign(): string {
    return `${this.path.value}##${this.id}`
  }
}

class BasicJsonNode extends JsonNode {
  constructor(type: JsonType, from: number, to: number) {
    super(type, from, to)
  }
}

abstract class CollectionJsonNode extends JsonNode {
  children:JsonNode[] = [] 
  constructor(type: JsonType, from: number, to: number) {
    super(type, from, to)
  }

  addChild(child: JsonNode):boolean {
    child.parent = this
    this.children.push(child)
    return true
  }
}
class ArrayJsonNode extends CollectionJsonNode {
  constructor(from: number, to: number) {
    super(JsonType.ARRAY, from, to)
  }
}

class ObjectJsonNode extends CollectionJsonNode {
  constructor(from: number, to: number) {
    super(JsonType.OBJECT, from, to)
  }
}


abstract class NodeIter {
  type:JsonType
  constructor(type: JsonType) {
    this.type = type
  }
  abstract iter(ctx: DocContext): JsonNode|undefined;
}

class BasicTypeIter extends NodeIter {
  iter(ctx: DocContext): JsonNode|undefined {
    return new BasicJsonNode(this.type, ctx.from, ctx.to)
  }
}

type ChildInfo = [string, JPath]
abstract class CollectionTypeIter extends NodeIter {
  leftBracket: string;
  rightBracket: string;

  constructor(type: JsonType, brackets: string) {
    super(type);
    if (brackets.length != 2) {
      throw new Error("invalid brackets. brackets length must be 2");
    }
    this.leftBracket = brackets[0];
    this.rightBracket = brackets[1];
  }

  iter(ctx: DocContext): JsonNode|undefined {
    let node = this.createNode(ctx.from, ctx.to)
    if (!ctx.next() || !this.isBegin(ctx.name)) {
      return ;
    }
    while (ctx.next() && !this.isEnd(ctx.name)) {
      if (!this.addChild(node, ctx)) {
        return ;
      }
    }
    return node;
  }

  addChild(parent:CollectionJsonNode, ctx: DocContext): boolean {
    const [childName, childPath ] = this.childInfo(parent, ctx)
    let curPath = ctx.swapPath(childPath)

    try {
      let it = getIter(ctx.name);
      let child = it?.iter(ctx);
      if (!child) {
        return false;
      }
      child.name = childName
      child.path = ctx.path
      child.id = hashCode(child.path.value, parent.children.length)
      return parent.addChild(child);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      ctx.swapPath(curPath);
    }
  }

  private isBegin(val: string): boolean { return val === this.leftBracket; }
  private isEnd(val: string): boolean { return val === this.rightBracket; }

  abstract childInfo(parent: CollectionJsonNode, ctx: DocContext): ChildInfo;
  abstract createNode(from: number, to: number):CollectionJsonNode
}

class ArrayTypeIter extends CollectionTypeIter {
  constructor() {
    super(JsonType.ARRAY, '[]')
  }

  childInfo(parent: CollectionJsonNode, ctx: DocContext): ChildInfo {
    const childName = `[${parent.children.length}]`
    return [childName, ctx.path.arrayChild(childName)]
  }

  createNode(from:number, to:number): CollectionJsonNode {
    return new ArrayJsonNode(from, to)
  }
}
class ObjectTypeIter extends CollectionTypeIter {
  constructor() {
    super(JsonType.OBJECT, '{}')
  }

  childInfo(_parent: CollectionJsonNode, ctx: DocContext): ChildInfo {
    // handle PropertyName. same as string
    ctx.next();
    let name = ctx.slice(ctx.from + 1, ctx.to - 1);

    // handle PropertyValue
    ctx.next();
    return [name, ctx.path.objectChild(name)];
  }

  createNode(from: number, to: number): CollectionJsonNode {
    return new ObjectJsonNode(from, to)
  }
}

const STREAM_MAP: Map<string, NodeIter> = new Map([
  ["Number", new BasicTypeIter(JsonType.NUMBER)],
  ["String", new BasicTypeIter(JsonType.STRING)],
  ["True", new BasicTypeIter(JsonType.BOOLEAN)],
  ["False", new BasicTypeIter(JsonType.BOOLEAN)],
  ['Null', new BasicTypeIter(JsonType.NULL)],
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
  let ctx = new DocContext(c, state.doc)
  let it = getIter(c.name)
  let root = it?.iter(ctx)
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
  type CollectionJsonNode,
  JsonType
}