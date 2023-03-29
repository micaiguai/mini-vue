import { createRenderer } from '../runtime-core/index'

function createElement(type) {
  return document.createElement(type)
}
function patchProp(el, key, val) {
  const isOn = /^on[A-Z]/.test(key)
  if (isOn) {
    const event = key.slice(2, key.length).toLowerCase()
    el.addEventListener(event, val)
  } else {
    el.setAttribute(key, val)
  }
}
function insert(el, container) {
  container.append(el)
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core/index'
