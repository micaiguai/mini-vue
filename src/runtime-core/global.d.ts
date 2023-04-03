type Vnode = {
  type: string | SFC,
  props: Record<string, any>,
  children: Vnode[],
  shapeFlag: number,
  el: Element | null
}

type SFC = {
  setup: () => Record<string, any>,
  render: () => Vnode
}

type Mounted = (rootComponent: Element) => void

type Renderer = {
  createApp: () => Mounted
}
