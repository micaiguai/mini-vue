import { reactive } from "../reactive"

describe('reactive', () => {
  it('test reactive', () => {
    const originalObject = { age: 1 }
    const observedObject = reactive(originalObject)
    expect(observedObject.age).toBe(1)
    expect(observedObject).not.toBe(originalObject)
  })  
})
