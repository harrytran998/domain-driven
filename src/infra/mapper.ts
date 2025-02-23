import type { Entity } from "../domain"
import type { EntityProps } from "../domain/entity/types"

export interface DomainMapper<
  Props extends EntityProps<any>,
  Model,
  DomainEntity extends Entity<Props>,
  Response = unknown,
> {
  toPersistence(entity: DomainEntity): Model
  toDomain(record: Model): DomainEntity
  toResponse(entity: DomainEntity): Response
}
