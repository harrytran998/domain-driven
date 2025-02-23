import type Emittery from "emittery"
import type { ContextEventName, EventContextManager } from "../context/types"
import type { UniqueEntityID } from "../entity"
import type { EntityConfig, EntityProps } from "../entity/types"
import type { DomainEventHandler, DomainEventOptions } from "../events/types"

export interface AggregateConfig extends EntityConfig {
  emitter: Emittery
  resetMetrics?: boolean
}

export type AggregateUpdate<T> = (
  state: AggregateState<T>,
  eventHandlers: AggregateEventHandlers<T>,
) => AggregateState<T> | Promise<AggregateState<T>>

export interface AggregateState<T> {
  props: EntityProps<T>
  domainEvents: DomainEventsState
  dispatchEventsCount: number
  config: AggregateConfig
  typeName: string
}

export interface DomainEventsState {
  handlers: Record<
    string,
    {
      handler: DomainEventHandler<any>
      options?: DomainEventOptions
    }[]
  >
  emitted: unknown[]
}

export interface AggregateEventHandlers<T> {
  addEvent: (
    state: AggregateState<T>,
    nameOrHandler: ContextEventName | DomainEventHandler<T>,
    handler?: DomainEventHandler<T>,
    options?: DomainEventOptions,
  ) => AggregateState<T>
  removeEvent: (state: AggregateState<T>, name: ContextEventName) => AggregateState<T>
  dispatchEvent: (
    state: AggregateState<T>,
    name: ContextEventName,
    ...args: unknown[]
  ) => Promise<AggregateState<T>>
  clearEvents: (state: AggregateState<T>) => AggregateState<T>
}

export interface AggregateFactory<T> {
  getState: () => Readonly<AggregateState<T>>
  getContext: () => EventContextManager
  update: (fn: AggregateUpdate<T>) => Promise<AggregateFactory<T>>
  hashCode: () => UniqueEntityID
}
