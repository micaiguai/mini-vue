import { getCurrentInstance, h, renderSlots } from "../../../lib/guide-mini-vue.esm.js"

export default {
  name: 'Foo',
  setup(props, { emit }) {
    const instance = getCurrentInstance()
    console.log('instance :', instance)
  },
  render() {
    return h('div', {}, [
      renderSlots(this.$slots, 'head'),
      h('div', {}, 'body'),
      renderSlots(this.$slots, 'default', { age: 18 })
    ])
  }
}
