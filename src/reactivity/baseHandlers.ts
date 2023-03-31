import { extend, isObject } from "../shared"
import { track, trigger } from "./effect"
import { reactive, readonly, shallowReadonly } from "./reactive"

const get = createGetter()
const shallowReadonlyGet = createGetter(true, true)
const readonlyGet = createGetter(true)
const set = createSetter()

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

function createGetter(isReadonly = false, shallow = false) {
  return function(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    const result = Reflect.get(target, key, receiver)
    if (shallow) {
      return result
    }
    if (isObject(result)) {
      return isReadonly ? readonly(result) : reactive(result)
    }

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

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value, receiver) {
    console.warn(`key: ${key} set false, because target is readonly.`, target)
    return true
  }
}

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet
})
