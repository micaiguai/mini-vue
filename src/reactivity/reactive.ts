import { mutableHandlers, ReactiveFlags, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers"

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}
export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(target) {
  return !!target[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(target) {
  return !!target[ReactiveFlags.IS_READONLY]
}

export function isProxy(target) {
  return isReactive(target) || isReadonly(target)
}

function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}
