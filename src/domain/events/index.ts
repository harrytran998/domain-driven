import { validateContextEventName } from "../context/context.utils"
import type { ContextEventName } from "../context/types"
import type {
  DomainEvent,
  DomainEventHandler,
  DomainEventOptions,
  DomainEventPort,
  DomainEventPromiseHandler,
  DomainMetrics,
} from "./types"

type DomainEventsState<T> = {
  events: DomainEvent<T>[]
  totalDispatched: number
}

/**
 * Creates a new domain events manager
 * @param aggregate - The aggregate root
 * @returns Domain events port implementation
 */
export const createDomainEvents = <T>(aggregate: T): DomainEventPort<T> => {
  const state: DomainEventsState<T> = {
    events: [],
    totalDispatched: 0,
  }

  const getMetrics = (): DomainMetrics => ({
    totalDispatched: () => state.totalDispatched,
    totalEvents: () => state.events.length,
  })

  const getPriority = () => {
    const totalEvents = state.events.length
    return totalEvents <= 1 ? 2 : totalEvents
  }

  const remove = (name: ContextEventName): void => {
    state.events = state.events.filter(e => e.name !== name)
  }

  const add = (
    name: ContextEventName,
    handler: DomainEventHandler<T>,
    _options?: DomainEventOptions,
  ): void => {
    validateContextEventName(name)

    if (typeof handler !== "function") {
      throw new Error(`Add event handler for ${name} must be a function`)
    }

    const options: DomainEventOptions = _options ?? { priority: getPriority() }
    remove(name)
    state.events.push({ name, handler, options })
  }

  const dispatch = (name: ContextEventName, ...args: unknown[]): void | Promise<void> => {
    const event = state.events.find(e => e.name === name)
    if (!event) return

    state.totalDispatched += 1
    event.handler(aggregate, [event, ...args])
    remove(name)
  }

  const clear = (): void => {
    state.events = []
  }

  const dispatchEvents = async (): Promise<void> => {
    const promiseEvents: DomainEventPromiseHandler<T>[] = []
    const sortedEvents = [...state.events].sort((a, b) => a.options.priority - b.options.priority)

    for (const event of sortedEvents) {
      state.totalDispatched += 1
      const fn = event.handler(aggregate, [event])

      if (fn instanceof Promise) {
        promiseEvents.push(fn as unknown as DomainEventPromiseHandler<T>)
      }
    }

    try {
      await Promise.all(promiseEvents)
    } catch (error) {
      console.error(error)
    } finally {
      clear()
    }
  }

  return {
    metrics: getMetrics(),
    dispatch,
    add,
    clear,
    remove,
    dispatchEvents,
  }
}
