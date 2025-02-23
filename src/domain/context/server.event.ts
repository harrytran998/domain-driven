import type EventEmitter from "emittery"
import { WILDCARD_EVENT_ALIAS, validateContextEventName } from "./context.utils"
import type { ContextEventName, EventContextManager, EventPort, EventType } from "./types"

type ServerEventState = {
  events: EventType[]
  emitter: EventEmitter
}

let instanceState: ServerEventState | null = null

const validateServerEnvironment = () => {
  if (typeof global?.process === "undefined") {
    throw new Error("ServerEventManager is not supported")
  }
}

const findEvent = (state: ServerEventState, name: ContextEventName): EventType | undefined =>
  state.events.find(e => e.name === name)

const exists = (state: ServerEventState, name: ContextEventName): boolean => {
  const count = state.emitter.listenerCount(name)
  const hasListener = count > 0
  const hasLocal = !!findEvent(state, name)
  return hasListener || hasLocal
}

const subscribe = (
  state: ServerEventState,
  name: ContextEventName,
  fn: (event: EventPort) => void | Promise<void>,
): void => {
  validateContextEventName(name)
  if (exists(state, name)) return

  state.events.push({ name, callback: fn })
  state.emitter.on(name, fn)
}

const remove = (state: ServerEventState, name: ContextEventName): boolean => {
  const event = findEvent(state, name)
  if (!event) return false

  state.events = state.events.filter((e): boolean => e.name !== name)
  state.emitter.off(name, event.callback)
  return true
}

const dispatch = (state: ServerEventState, name: ContextEventName, ...args: unknown[]): void => {
  validateContextEventName(name)

  if (name.includes(WILDCARD_EVENT_ALIAS)) {
    const regex = new RegExp(name.replace(WILDCARD_EVENT_ALIAS, ".*"))
    for (const event of state.events) {
      const match = regex.test(event.name)
      if (match) {
        state.emitter.emit(event.name, args)
      }
    }
  }
  state.emitter.emit(name, { detail: args || [] })
}

export const createServerEventManager = (emitter: EventEmitter): EventContextManager => {
  validateServerEnvironment()

  if (instanceState) {
    return createManagerInterface(instanceState)
  }

  instanceState = {
    events: [],
    emitter,
  }

  return createManagerInterface(instanceState)
}

const createManagerInterface = (state: ServerEventState): EventContextManager => ({
  subscribe: (name, fn) => subscribe(state, name, fn),
  exists: name => exists(state, name),
  remove: name => remove(state, name),
  dispatch: (name, ...args) => dispatch(state, name, ...args),
})
