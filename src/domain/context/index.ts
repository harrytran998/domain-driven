import type EventEmitter from "emittery"
import { createBrowserEventManager } from "./browser.event"
import { createServerEventManager } from "./server.event"
import type { EventContextManager } from "./types"

let eventContextManager: EventContextManager

export function createEventContext(emitter: EventEmitter): EventContextManager {
  if (eventContextManager) return eventContextManager
  if (typeof window !== "undefined") {
    eventContextManager = createBrowserEventManager(globalThis.window)
  } else {
    eventContextManager = createServerEventManager(emitter)
  }
  return eventContextManager
}
