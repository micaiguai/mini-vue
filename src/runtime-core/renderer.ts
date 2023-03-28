import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function render(vnode, container) {
  patch(vnode, container)
}

export function patch(vnode: any, container) {
  const { type, shapeFlag } = vnode

  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break;
    case Text:
      processText(vnode, container)
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
      }
      break;
  }
}

function processFragment(vnode, container) {
  mountChildren(vnode.children, container)
}
function processText(vnode, container) {
  const el = vnode.el = document.createTextNode(vnode.children)
  container.append(el)
}

export function processComponent(vnode: any, container) {
  mountComponent(vnode, container)
}

export function mountComponent(initialVnode, container) {
  const instance = createComponentInstance(initialVnode)
  setupComponent(instance)
  setupRenderEffect(instance, initialVnode, container)
}

export function setupRenderEffect(instance, initialVnode, container) {
  const subTree = instance.render.call(instance.proxy)
  patch(subTree, container)

  initialVnode.el = subTree.el
}

export function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: Element) {
  const el: Element = vnode.el = document.createElement(vnode.type as string)
  const { children, props, shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el)
  }
  for (const key in props) {
    const isOn = /^on[A-Z]/.test(key)
    const value = props[key]
    if (isOn) {
      const event = key.slice(2, key.length).toLowerCase()
      el.addEventListener(event, value)
    } else {
      el.setAttribute(key, value)
    }
  }
  container.append(el)
}

function mountChildren(children: any, container: Element) {
  children.forEach(child => {
    patch(child, container)
  })
}

