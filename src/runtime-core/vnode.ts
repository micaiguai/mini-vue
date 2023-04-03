import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/ShapeFlags"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createVnode(type, props?, children?) {
  const vnode: Vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null
  }
  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObject(vnode.children)) {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }
  return vnode
}

export function createTextVnode(text) {
  return createVnode(Text, {}, text)
}

function getShapeFlag(type) {
  let shapeFlag
  if (typeof type === 'string') {
    shapeFlag = ShapeFlags.ELEMENT
  } else if (isObject(type)) {
    shapeFlag = ShapeFlags.STATEFUL_COMPONENT
  }
  return shapeFlag
}
