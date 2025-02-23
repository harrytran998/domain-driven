import { WILDCARD_EVENT_ALIAS, validateContextEventName } from "./context.utils"
import type { ContextEventName, EventContextManager, EventPort, EventType } from "./types"

const SS_DDD_NAME_PREFIX = "ddd"

type BrowserEventState = {
  events: EventType[]
  window: Window & typeof globalThis
}

let instanceState: BrowserEventState | null = null

const validateBrowserEnvironment = (window: Window & typeof globalThis) => {
  if (typeof window === "undefined") {
    throw new Error("BrowserEventManager need run into browser runtime")
  }
}

const getSSEventName = (name: ContextEventName) => `${SS_DDD_NAME_PREFIX}:${name}`

const findEvent = (state: BrowserEventState, name: ContextEventName): EventType | undefined =>
  state.events.find(e => e.name === name)

const exists = (state: BrowserEventState, name: ContextEventName): boolean => {
  const existsOnWindow = !!state.window.sessionStorage.getItem(getSSEventName(name))
  const existsInternal = !!findEvent(state, name)
  return existsOnWindow || existsInternal
}

const subscribe = (
  state: BrowserEventState,
  name: ContextEventName,
  fn: (event: EventPort) => void | Promise<void>,
): void => {
  validateContextEventName(name)
  if (exists(state, name)) return

  state.events.push({ name, callback: fn })
  state.window.sessionStorage.setItem(getSSEventName(name), Date.now().toString())
  state.window.addEventListener(name, fn as unknown as VoidFunction)
  state.window.addEventListener("beforeunload", () => {
    state.window.sessionStorage.removeItem(getSSEventName(name))
  })
}

const remove = (state: BrowserEventState, name: ContextEventName): boolean => {
  const event = findEvent(state, name)
  if (!event) return false

  state.window.sessionStorage.removeItem(getSSEventName(name))
  state.events = state.events.filter((e): boolean => e.name !== name)
  state.window.removeEventListener(name, event.callback)
  return true
}

const dispatch = (state: BrowserEventState, name: ContextEventName, ...args: unknown[]): void => {
  validateContextEventName(name)

  if (name.includes(WILDCARD_EVENT_ALIAS)) {
    const regex = new RegExp(name.replace(WILDCARD_EVENT_ALIAS, ".*"))
    for (const event of state.events) {
      const match = regex.test(event.name)
      if (match) {
        state.window.dispatchEvent(
          new state.window.CustomEvent(event.name, {
            bubbles: true,
            detail: args || [],
          }),
        )
      }
    }
  }

  state.window.dispatchEvent(
    new state.window.CustomEvent(name, {
      bubbles: true,
      detail: args || [],
    }),
  )
}

export const createBrowserEventManager = (
  window: Window & typeof globalThis,
): EventContextManager => {
  validateBrowserEnvironment(window)

  if (instanceState) {
    return createManagerInterface(instanceState)
  }

  instanceState = {
    events: [],
    window,
  }

  return createManagerInterface(instanceState)
}

const createManagerInterface = (state: BrowserEventState): EventContextManager => ({
  subscribe: (name, fn) => subscribe(state, name, fn),
  exists: name => exists(state, name),
  remove: name => remove(state, name),
  dispatch: (name, ...args) => dispatch(state, name, ...args),
})
