import { hasChanged, isObject } from '../shared'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

class refImpl {
  private _value: any
  private _rawValue: any
  dep = new Set()
  __v_isRef
  constructor(raw) {
    this.__v_isRef = true
    this._rawValue = raw
    this._value = convert(raw)
  }
  get value() {
    trackRefValue(this.dep)
    return this._value
  }
  set value(newValue) {
    if (!hasChanged(this._rawValue, newValue)) {
      return
    }
    this._value = convert(newValue)
    this._rawValue = newValue
    triggerEffects(this.dep)
  }
}

function trackRefValue(dep) {
  if (isTracking()) {
    trackEffects(dep)
  }
}

function convert(raw) {
  return isObject(raw) ? reactive(raw) : raw
}

export function ref(raw) {
  return new refImpl(raw)
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

export const proxyRefs = (raw) => {
  return new Proxy(raw, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)
      return unRef(result)
    },
    set(target, key, newValue, receiver) {
      const oldValue = target[key]
      if (isRef(oldValue) && !isRef(newValue)) {
        oldValue.value = newValue
        return true
      }
      return Reflect.set(target, key, newValue, receiver)
    }
  })
}
