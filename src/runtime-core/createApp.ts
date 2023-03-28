import { render } from "./renderer"
import { createVnode } from "./vnode"

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      rootContainer = document.querySelector(rootContainer)
      const vnode = createVnode(rootComponent)
      render(vnode, rootContainer)
    }
  }
}
