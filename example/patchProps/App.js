import { h, ref } from "../../lib/guide-mini-vue.esm.js"

export const App = {
  name: 'App',
  setup() {
    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })
    function changeProp() {
      props.value.foo = 'new foo'
    }
    function setPropUndefined() {
      props.value.bar = undefined
    }
    function clearProp() {
      props.value = {
        bar: 'bar'
      }
    }

    return {
      props,
      changeProp,
      setPropUndefined,
      clearProp
    }
  },
  render() {
    console.log('this.props.foo :', this.props.foo)
    return h('div', {
      ...this.props
    }, [
      h('button', {
        onClick:  this.changeProp
      }, 'change prop'),
      h('button', {
        onClick:  this.setPropUndefined
      }, 'set prop undefined'),
      h('button', {
        onClick:  this.clearProp
      }, 'clear prop'),
    ])
  }
}
