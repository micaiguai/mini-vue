import { h } from "../../lib/guide-mini-vue.esm.js"

export const App = {
  setup() {
    return {
      msg: 'world'
    }
  },
  render() {
    return h('div', `hello ${this.msg}`)
  }
}
