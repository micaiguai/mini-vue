import { h } from "../../../lib/guide-mini-vue.esm.js"

export default {
  setup(props, { emit }) {
    console.log('props :', props)
    props.count++
    return {
      onClick() {
        console.log('onClick')
        emit('add', 1, 2)
        emit('add-sth', 1, 2)
      }
    }
  },
  render() {
    const button = h('button', { 
      onClick: this.onClick
    }, 'click me')
    return h('div', {}, [button])
  }
}
