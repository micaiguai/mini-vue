import { effect, proxyRefs } from "../reactivity"
import { EMPTY_OBJ } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
  const { 
    createElement: hostCreateElement, 
    patchProp: hostPatchProp, 
    insert: hostInsert, 
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

  function render(vnode, container) {
    patch(null, vnode, container, null, null)
  }
  
  function patch(n1, n2: any, container, parentComponent, anchor) {
    const { type, shapeFlag } = n2
  
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break
    }
  }
  
  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }
  function processText(n1, n2, container) {
    const el = n2.el = document.createTextNode(n2.children)
    container.append(el)
  }
  
  function processComponent(n1, n2: any, container, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor)
  }
  
  function mountComponent(initialVnode, container, parentComponent, anchor) {
    const instance = createComponentInstance(initialVnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container, anchor)
  }
  
  function setupRenderEffect(instance, initialVnode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        const subTree = instance.subTree = instance.render.call(proxyRefs(instance.proxy))
        patch(null, subTree, container, instance, anchor)
        initialVnode.el = subTree.el
        instance.isMounted = true
      } else {
        const prevSubTree = instance.subTree
        const subTree = instance.subTree = instance.render.call(proxyRefs(instance.proxy))
        patch(prevSubTree, subTree, container, instance, anchor)
        initialVnode.el = subTree.el
      }
    })
  }
  
  function processElement(n1, n2: any, container: any, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }
  
  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props ?? EMPTY_OBJ
    const newProps = n2.props ?? EMPTY_OBJ
    const el = n2.el = n1.el
    pathProps(el, oldProps, newProps)
    patchChildren(n1, n2, el, parentComponent, anchor)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1
    const { shapeFlag, children: c2 } = n2
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1)
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function isSameVnode(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key
  }
  function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
    let i = 0
    let l1 = c1.length
    let l2 = c2.length
    let e1 = l1 - 1
    let e2 = l2 - 1

    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor)
        i++
      } else {
        break
      }
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor)
        e1--
        e2--
      } else {
        break
      }
    }
    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          const n2 = c2[i]
          const nextE2 = e2 + 1
          const anchor = nextE2 < l2 ? c2[nextE2].el : null
          patch(null, n2, container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        const n1 = c1[i]
        hostRemove(n1.el)
        i++
      }
    } else {
      
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      hostRemove(el)
    }
  }

  function pathProps(el: Element, oldProps: Record<string, any>, newProps: Record<string, any>) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }
    }

    if (oldProps !== EMPTY_OBJ) {
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, undefined, undefined)
        }
      }
    }
  }

  function mountElement(vnode: any, container: Element, parentComponent, anchor) {
    const el: Element = vnode.el = hostCreateElement(vnode.type as string)
    const { children, props, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent, anchor)
    }
    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }
    hostInsert(el, container, anchor)
  }
  
  function mountChildren(children: any, container: Element, parentComponent, anchor) {
    children.forEach(child => {
      patch(null, child, container, parentComponent, anchor)
    })
  }
  
  return {
    createApp: createAppApi(render)
  }
}
