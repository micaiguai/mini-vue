import { h } from "../../lib/guide-mini-vue.esm.js"
import Foo from './components/Foo.js'

export const App = {
  setup() {
    return {
      msg: 'world'
    }
  },
  render() {
    window.self = this
    return h(
      'div', 
      {
        class: ['red', 'hard']
      }, 
      // `hello ${this.msg}`,
      // `hello mini-vue`,
      [
        h(
          'div', 
          {
            class: 'blue'
          },
          'hi'
        ),
        h(
          'div', 
          {
            class: 'red'
          },
          ` ${this.msg}`
        ),
        h(Foo, {
          count: 1,
          onAdd(a, b) {
            console.log('on add', a, b)
          },
          onAddSth(a, b) {
            console.log('on onAddSth', a, b)
          }
        })
      ]
    )
  }
}
