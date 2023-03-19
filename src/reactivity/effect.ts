import { extend } from '../shared/index'

let activeEffect
let shouldTrack = false

class ReactiveEffect {
  private _fn: Function
  deps = []
  active = true
  onStop?: () => void
  constructor(fn, public scheduler) {
    this._fn = fn
  }
  run() {
    if (!this.active) {
      return this._fn() 
    }
    shouldTrack = true
    activeEffect = this
    const result = this._fn()
    shouldTrack = false
    return result
  }
  stop() {
    if (this.active) {
      this.active = false
      if (this.onStop) {
        this.onStop()
      }
    }
    cleanupEffect(this)
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: Set<ReactiveEffect>) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

const targetMap = new WeakMap()
export function track(target, key) {
  if (!isTracking()) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep: Set<ReactiveEffect> = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  if (dep.has(activeEffect)) {
    return
  }
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

function isTracking() {
  return activeEffect !== undefined && shouldTrack
}
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const deps = depsMap.get(key)
  deps.forEach(effect => {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  })
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options)
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
