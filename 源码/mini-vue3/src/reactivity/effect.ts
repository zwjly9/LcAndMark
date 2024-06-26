import { extend } from "../shared"
let activeEffect;
let shouldTrack
class ReactiveEffect {
  private _fn: any
  deps = []
  active = true
  onStop?: ()=> void
  public scheduler: Function | undefined
  constructor(fn, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    if(!this.active) {
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
      clearupEffect(this)
      if(this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function clearupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}
export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

const targetMap = new Map()

export function track(target, key) {
  if(!isTracking()) return
  // target -> key -> fn
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  trackEffects(dep)
}
export function trackEffects(dep) {
  if(dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function trigger(target, key) {
  // 基于target和key 取出fn,执行
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  triggerEffects(dep)
}
export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}




export function effect(fn, options: any = {}) {
  // 执行fn
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // 可能存在多个参数
  // _effect.onStop = options.onStop
  // Object.assign(_effect, options)
  // 语义化
  extend(_effect, options)

  _effect.run();
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}