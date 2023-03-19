import { isReactive, reactive, isProxy } from "../reactive"

describe('reactive', () => {
  it('test reactive', () => {
    const original = { age: 1 }
    const observed = reactive(original)
    expect(observed.age).toBe(1)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)
    expect(isProxy(observed)).toBe(true)
    expect(observed).not.toBe(original)
  })  
  it('nested reactive', () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })
})
