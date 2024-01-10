export const extend = Object.assign

export const EMPTY_OBJ = {}

export const isObject = (target) => {
  return target !== null && typeof target === 'object'
}

export const hasChanged = (value, newValue) => {
  return !Object.is(value, newValue)
}

export function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key)
}

export const toHandlerKey = str => {
  return `on${capitalize(str)}`
}
const capitalize = (str: string) => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`
}
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c.toUpperCase()
  })
}
