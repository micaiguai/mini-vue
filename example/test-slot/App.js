import { createTextVnode, h } from "../../lib/guide-mini-vue.esm.js"
import Foo from './components/Foo.js'

export const App = {
  name: 'App',
  setup() {
  },
  render() {
    return h('div', {}, [
      h(
        Foo, 
        {},
        {
          default: ({ age }) => [h('div', {}, `hi ${age}`), createTextVnode('hi mcg')],
          head: () => h('div', {}, 'head')
        }
      )
    ]) 
  }
}
