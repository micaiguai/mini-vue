import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const instance: any = getCurrentInstance()
  if (instance) {
    let { provides, parent } = instance
    if (provides === parent?.provides) {
      provides = instance.provides = Object.create(provides)
    }
    provides[key] = value
  }
}

export function inject(key, defaultValue) {
  const instance: any = getCurrentInstance()
  const { provides } = instance.parent
  if (key in provides) {
    return provides[key]
  } else if (defaultValue) {
    if (typeof defaultValue === 'function') {
      return defaultValue()
    }
    return defaultValue
  }
}

