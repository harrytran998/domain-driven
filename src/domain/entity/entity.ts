import { envShims } from "@techmely/es-toolkit"
import type { MarkRequired } from "@techmely/types"
import { Result } from "../../utils"
import type { IResult } from "../../utils/result/types"
import type { EntityConfig, EntityProps } from "./types"
import { UniqueEntityID } from "./unique-entity"

const defaultEntityConfig: EntityConfig = {
  debug: Boolean(envShims().DEBUG) || false,
}

export type Entity<T> = {
  props: EntityProps<T>
  config: EntityConfig
}

// Helper functions
const convertPropsToObject = <T>(props: EntityProps<T>) => {
  const propsCopy = structuredClone(props) as any

  for (const prop in propsCopy) {
    const item = propsCopy[prop]
    if (Array.isArray(item)) {
      propsCopy[prop] = item.map(i => {
        return isEntity(i) ? toObject(i) : i
      })
    }
    propsCopy[prop] = isEntity(item) ? toObject(item) : item
  }

  return propsCopy
}

// Main entity functions
export const createEntity = <T>(
  props: EntityProps<T>,
  config: EntityConfig = defaultEntityConfig,
): IResult<Entity<T>, any, any> => {
  const { id, ...rest } = props
  const entityId = id || UniqueEntityID.toString()

  const entity: Entity<T> = {
    props: { ...rest, id: entityId } as any,
    config,
  }

  return Result.Ok(entity)
}

export const isEntity = (entity: unknown): entity is Entity<any> => {
  return entity !== null && typeof entity === "object" && "props" in entity && "config" in entity
}

export const hashCode = <T>(entity: Entity<T>): string => {
  return `[Entity]:${entity.props.id}`
}

export const cloneEntity = <T>(
  entity: Entity<T>,
  newProps?: Partial<EntityProps<T>>,
): Entity<T> => {
  const updatedProps = newProps ? { ...entity.props, ...newProps } : entity.props

  return {
    props: updatedProps,
    config: entity.config,
  }
}

export const toObject = <T>(entity: Entity<T>) => {
  const clone = convertPropsToObject(entity.props)

  const result: MarkRequired<EntityProps<T>, "createdAt" | "updatedAt" | "id"> = {
    id: entity.props.id?.toString(),
    createdAt: entity.props.createdAt || new Date().toISOString(),
    updatedAt: entity.props.updatedAt || new Date().toISOString(),
    ...clone,
  }

  return Object.freeze(result)
}

// Optional: Create a convenience function to handle all entity operations
export const entityFactory = {
  create: createEntity,
  isEntity,
  hashCode,
  clone: cloneEntity,
  toObject,
}
