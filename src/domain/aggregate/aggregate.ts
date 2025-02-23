import Emittery from "emittery"
import { createEventContext } from "../context"
import { UniqueEntityID } from "../entity"
import type { EntityProps } from "../entity/types"
import type {
  AggregateConfig,
  AggregateEventHandlers,
  AggregateFactory,
  AggregateState,
  DomainEventsState,
} from "./types"

const initializeDomainEvents = (): DomainEventsState => ({
  handlers: {},
  emitted: [],
})

function eventHandlers<T>(): AggregateEventHandlers<T> {
  return {
    addEvent: (current, nameOrHandler, handler, options) => {
      const newHandlers = { ...current.domainEvents.handlers }

      if (typeof nameOrHandler === "string" && handler) {
        newHandlers[nameOrHandler] = [...(newHandlers[nameOrHandler] || []), { handler, options }]
      } else if (typeof nameOrHandler === "function") {
        const eventName = (nameOrHandler as any).params?.name
        const eventHandler = (nameOrHandler as any).dispatch
        const eventOptions = (nameOrHandler as any).params?.options

        if (eventName && eventHandler) {
          newHandlers[eventName] = [
            ...(newHandlers[eventName] || []),
            { handler: eventHandler, options: eventOptions },
          ]
        }
      }

      return {
        ...current,
        domainEvents: {
          ...current.domainEvents,
          handlers: newHandlers,
        },
      }
    },

    removeEvent: (current, name) => {
      const { [name]: _, ...remainingHandlers } = current.domainEvents.handlers
      return {
        ...current,
        domainEvents: {
          ...current.domainEvents,
          handlers: remainingHandlers,
        },
      }
    },

    dispatchEvent: async (current, name, ...args) => {
      const handlers = current.domainEvents.handlers[name] || []
      const newEmitted = [...current.domainEvents.emitted, ...args]

      // Execute handlers asynchronously
      await Promise.all(
        handlers.map(async ({ handler }) => {
          try {
            // @ts-expect-error Ignore type error for now
            await handler(...args)
          } catch (error) {
            if (current.config.debug) {
              console.error(`Error handling event ${name}:`, error)
            }
          }
        }),
      )

      return {
        ...current,
        domainEvents: {
          ...current.domainEvents,
          emitted: newEmitted,
        },
        dispatchEventsCount: current.dispatchEventsCount + 1,
      }
    },
    clearEvents(current) {
      return {
        ...current,
        dispatchEventsCount: current.config.resetMetrics ? 0 : current.dispatchEventsCount,
        domainEvents: initializeDomainEvents(),
      }
    },
  }
}

export const Aggregate = <T>(
  typeName: string,
  initialProps: Partial<EntityProps<T>> = {},
  config: AggregateConfig = { emitter: new Emittery(), debug: false },
): AggregateFactory<T> => {
  let state: AggregateState<T> = {
    typeName,
    props: {
      id: UniqueEntityID(initialProps?.id).toString(),
      ...initialProps,
    } as EntityProps<T>,
    domainEvents: initializeDomainEvents(),
    dispatchEventsCount: 0,
    config,
  }

  const context = createEventContext(config.emitter)

  const aggregate: AggregateFactory<T> = {
    getState: () => ({ ...state }),
    getContext: () => context,

    update: async fn => {
      const newState = await fn({ ...state }, eventHandlers<T>())
      state = newState
      return aggregate
    },

    hashCode: () => UniqueEntityID(`[Aggregate@${typeName}]:${state.props.id}`),
  }

  return aggregate
}

export const cloneAggregate = <T>(
  original: AggregateState<T>,
  props?: Partial<EntityProps<T>> & { copyEvents?: boolean },
): AggregateState<T> => ({
  ...original,
  props: { ...original.props, ...props },
  domainEvents: props?.copyEvents ? original.domainEvents : initializeDomainEvents(),
})
