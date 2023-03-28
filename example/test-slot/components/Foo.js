import { h, renderSlots } from "../../../lib/guide-mini-vue.esm.js"

export default {
  name: 'Foo',
  setup(props, { emit }) {
  },
  render() {
    return h('div', {}, [
      renderSlots(this.$slots, 'head'),
      h('div', {}, 'body'),
      renderSlots(this.$slots, 'default', { age: 18 })
    ])
  }
}
