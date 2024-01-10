import { h, ref } from "../../lib/guide-mini-vue.esm.js"

export const App = {
  name: 'App',
  setup() {
    const count = ref(1)
    function plusCount() {
      count.value++
    }
    return {
      count,
      plusCount
    }
  },
  render() {
    console.log('this.count :', this.count)
    return h('div', {}, [
      h('div', {}, `count is ${this.count}`),
      h('button', {
        onClick: this.plusCount
      }, 'click me')
    ]) 
  }
}
