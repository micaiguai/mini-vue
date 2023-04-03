import { createRenderer } from '../runtime-core/index'

function createElement(type) {
  return document.createElement(type)
}
function patchProp(el: Element, key: string, prevProp, nextProp) {
  const isOn = /^on[A-Z]/.test(key)
  if (isOn) {
    const event = key.slice(2, key.length).toLowerCase()
    el.addEventListener(event, nextProp)
  } else {
    if (nextProp === undefined || nextProp === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextProp)
    }
  }
}
function insert(el, container) {
  container.append(el)
}

function remove(el: Element) {
  const parent = el.parentNode
  parent?.removeChild(el)
}

function setElementText(el: Element, text) {
  el.textContent = text
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core/index'
