import type { EntityId, Records } from "@techmely/types";
import type { UniqueEntityID } from "./unique-entity";

export type BaseEntityProps = {
  id: UniqueEntityID | EntityId;
  createdAt: string;
  updatedAt: string;
};

export type EntityProps<T> = Partial<BaseEntityProps> & T & Records;

export type EntityConfig = {
  /** @description Enable debug mode for entity.
   * @default false
   */
  debug?: boolean;
};

export interface EntityPort<Props, ToObject = Records> {
  /**
   * @description Get hash to identify the entity.
   * @example
   * `[Entity@ClassName]:UUID`
   */
  hashCode(): UniqueEntityID | EntityId;
  /**
   * @description Get a new instanced based on current Entity.
   */
  clone(): EntityPort<Props, ToObject>;
  /**
   * @description Get value as object from entity.
   */
  toObject(): ToObject;
}
