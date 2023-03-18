import { mutableHandlers, readonlyHanlders } from "./baseHandlers"

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHanlders)
}

function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}
