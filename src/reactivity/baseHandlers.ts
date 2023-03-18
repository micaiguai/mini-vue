import { track, trigger } from "./effect"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
  return function(target, key, receiver) {
    const result = Reflect.get(target, key, receiver)
    if (!isReadonly) {
      track(target, key)
    }
    return result
  }
}

function createSetter() {
  return function (target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return result
  }
}


export const mutableHandlers = {
  get,
  set
}

export const readonlyHanlders = {
  get: readonlyGet,
  set(target, key, value, receiver) {
    console.warn(`key: ${key} set false, because target is readonly.`, target)
    return true
  }
}
