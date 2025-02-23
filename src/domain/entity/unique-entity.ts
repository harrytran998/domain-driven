import { generatePrefixId } from "@techmely/es-toolkit/generate"
import type { EntityId } from "@techmely/types"

export type UniqueEntityID = {
  readonly id: EntityId
  isEqual: (base: UniqueEntityID, other?: UniqueEntityID) => boolean
  isUniqueEntityID: (value: unknown) => value is UniqueEntityID
  toValue: (entityId: UniqueEntityID) => EntityId
  toString: () => string
}

export function UniqueEntityID(id?: EntityId): UniqueEntityID {
  /**
   * Checks if two UniqueEntityIDs are equal
   * @param base The base UniqueEntityID to compare
   * @param other The other UniqueEntityID to compare against
   * @returns boolean indicating if the IDs are equal
   */
  const isEqual = (base: UniqueEntityID, other?: UniqueEntityID): boolean => {
    if (!other) return false
    if (!isUniqueEntityID(other)) return false
    return other.id === base.id
  }

  /**
   * Type guard to check if a value is a UniqueEntityID
   * @param value Value to check
   * @returns boolean indicating if the value is a UniqueEntityID
   */
  const isUniqueEntityID = (value: unknown): value is UniqueEntityID => {
    return (
      typeof value === "object" &&
      value !== null &&
      "id" in value &&
      (typeof value.id === "string" || typeof value.id === "number")
    )
  }
  const lastId = id || generatePrefixId("ett")

  return {
    id: lastId,
    isEqual,
    isUniqueEntityID,
    toValue: (entityId: UniqueEntityID): EntityId => entityId.id,
    toString: () => lastId.toString(),
  }
}
