export const extend = Object.assign

export const isObject = (target) => {
  return target !== null && typeof target === 'object'
}

export const hasChanged = (value, newValue) => {
  return !Object.is(value, newValue)
}
