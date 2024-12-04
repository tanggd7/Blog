function deepCopy(value) {
  const cache = new Map()

  function _deepCopy(value) {
    if (value === null || typeof value !== "object") {
      return value
    }

    if (cache.has(value)) {
      return cache.get(value)
    }

    if (typeof value === "function") {
      return value
    }

    const result = Array.isArray(value) ? [] : {}
    cache.set(value, result)

    for (const key in value) {
      result[key] = _deepCopy(value[key])
    }

    return result
  }

  return _deepCopy(value)
}
