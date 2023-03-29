import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

  function render(vnode, container) {
    patch(vnode, container, null)
  }
  
  function patch(vnode: any, container, parentComponent) {
    const { type, shapeFlag } = vnode
  
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent)
        break
      case Text:
        processText(vnode, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent)
        }
        break
    }
  }
  
  function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode.children, container, parentComponent)
  }
  function processText(vnode, container) {
    const el = vnode.el = document.createTextNode(vnode.children)
    container.append(el)
  }
  
  function processComponent(vnode: any, container, parentComponent) {
    mountComponent(vnode, container, parentComponent)
  }
  
  function mountComponent(initialVnode, container, parentComponent) {
    const instance = createComponentInstance(initialVnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container)
  }
  
  function setupRenderEffect(instance, initialVnode, container) {
    const subTree = instance.render.call(instance.proxy)
    patch(subTree, container, instance)
  
    initialVnode.el = subTree.el
  }
  
  function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent)
  }
  
  function mountElement(vnode: any, container: Element, parentComponent) {
    const el: Element = vnode.el = hostCreateElement(vnode.type as string)
    const { children, props, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent)
    }
    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, val)
    }
    hostInsert(el, container)
  }
  
  function mountChildren(children: any, container: Element, parentComponent) {
    children.forEach(child => {
      patch(child, container, parentComponent)
    })
  }
  
  return {
    createApp: createAppApi(render)
  }
}
