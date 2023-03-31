import { effect, proxyRefs } from "../reactivity"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

  function render(vnode, container) {
    patch(null, vnode, container, null)
  }
  
  function patch(n1, n2: any, container, parentComponent) {
    const { type, shapeFlag } = n2
  
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
        break
    }
  }
  
  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2.children, container, parentComponent)
  }
  function processText(n1, n2, container) {
    const el = n2.el = document.createTextNode(n2.children)
    container.append(el)
  }
  
  function processComponent(n1, n2: any, container, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }
  
  function mountComponent(initialVnode, container, parentComponent) {
    const instance = createComponentInstance(initialVnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container)
  }
  
  function setupRenderEffect(instance, initialVnode, container) {
    effect(() => {
      if (!instance.isMounted) {
        const subTree = instance.subTree = instance.render.call(proxyRefs(instance.proxy))
        patch(null, subTree, container, instance)
        initialVnode.el = subTree.el
        instance.isMounted = true
      } else {
        const prevSubTree = instance.subTree
        const subTree = instance.subTree = instance.render.call(proxyRefs(instance.proxy))
        patch(prevSubTree, subTree, container, instance)
        initialVnode.el = subTree.el
      }
    })
  }
  
  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }
  
  function patchElement(n1, n2, container) {
    console.log('patchElement')
    console.log('n1 :', n1)
    console.log('n2 :', n2)
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
      patch(null, child, container, parentComponent)
    })
  }
  
  return {
    createApp: createAppApi(render)
  }
}
