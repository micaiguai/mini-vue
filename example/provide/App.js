import { createTextVnode, getCurrentInstance, h, inject, provide } from "../../lib/guide-mini-vue.esm.js"


export const App = {
  name: 'App',
  setup() {
    provide('foo', 'foo value')
  },
  render() {
    return h(Child)
  }
}

const Child = {
  name: 'Child',
  setup() {
    provide('foo', 'child foo value')
    const foo = inject('foo')
    const bar = inject('bar', 'default bar')
    return {
      foo,
      bar
    }
  },
  render() {
    return h('div', {}, [
      h('div', {}, `Child foo is ${this.foo}, bar is ${this.bar}`),
      h(Grandchild)  
    ])
  }
} 

const Grandchild = {
  name: 'Child',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar', () => 'functional default bar')
    return {
      foo,
      bar
    }
  },
  render() {
    return h('div', {}, `Grandchild foo is ${this.foo}, bar is ${this.bar}`)
  }
} 
