import { BROWSER } from 'esm-env';
import { writable } from 'svelte/store'
import type  { Updater } from 'svelte/store'

// saves having to branch for server vs client
const noopStorage = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
}

export function web_storage<T>(name: string, defaultValue: T, persist = true) {
  const storage = BROWSER
    ? persist
      ? localStorage
      : sessionStorage
    : noopStorage

  const persisted = storage.getItem(name)
  const parsed = JSON.parse(persisted ?? 'null')
  console.log(parsed)

  let value = typeof defaultValue === 'object'
    ? { ...defaultValue, ...(persisted ? parsed : {}) }
    : persisted ? parsed : defaultValue

  const { subscribe, set: _set } = writable(value, () => {
    if (BROWSER && persist) {
      function handler(e: StorageEvent) {
        if (e.key === name) {
          _set(value = (e.newValue ? JSON.parse(e.newValue) : defaultValue))
        }
      }

      addEventListener('storage', handler)
      return () => removeEventListener('storage', handler)
    }
  });

  function set(v: T) {
    _set((value = v));
    storage.setItem(name, JSON.stringify(value))
  }

  function update(updater: Updater<T>) {
    set(updater(value));
  }

  return {
    subscribe,
    set,
    update,
  }
}

if (import.meta.vitest) {
  // TODO
}