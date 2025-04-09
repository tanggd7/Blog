import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"

class Observer<T> {
  private subscribers: ((data: T) => void)[]
  constructor() {
    this.subscribers = []
  }
  subscribe(fn: (data: T) => void) {
    this.subscribers.push(fn)
  }
  unsubscribe(fn: (data: T) => void) {
    this.subscribers = this.subscribers.filter((subfn) => subfn !== fn)
  }
  notify(data: T) {
    this.subscribers.forEach((fn) => {
      fn(data)
    })
  }
}
export function proxy<T extends object>(initialValue: T) {
  const dispatcher = new Observer<string>()
  return new Proxy(initialValue, {
    get(target, key: string) {
      if (key === "dispatcher") return dispatcher
      return Reflect.get(target, key)
    },
    set(target, key: string, value) {
      if (Reflect.get(target, key) === value) {
        return true
      }
      const status = Reflect.set(target, key, value)
      dispatcher.notify(key)
      return status
    },
  })
}
export function useSnapshot<
  T extends object & { dispatcher?: Observer<string> }
>(proxy: T): T {
  const [_, setUpdate] = useState(0)
  const toUpdate = useRef(new Set<string>()) // Need to test for perf against map
  toUpdate.current.clear()
  const forceUpdate = useCallback((key: string) => {
    if (toUpdate.current.has(key)) {
      setUpdate((update) => ++update)
    }
  }, [])

  const data = useMemo(() => {
    return new Proxy(proxy, {
      get(target, key: string) {
        toUpdate.current.add(key)
        return Reflect.get(target, key)
      },
    })
  }, [proxy])
  useLayoutEffect(() => {
    // Test case 2 break with useEffect, because we update value before subscribing
    proxy.dispatcher?.subscribe(forceUpdate)
    return () => {
      proxy.dispatcher?.unsubscribe(forceUpdate)
    }
  }, [proxy])
  return data
}
