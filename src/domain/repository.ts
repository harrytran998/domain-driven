import type { StringEnum } from "@techmely/types"

export type Paginated<T> = Readonly<{
  count: number
  limit: number
  page: number
  data: readonly T[]
}>

export type OrderBy = Readonly<{
  field: string | true
  param: "asc" | "desc"
}>

export type PaginatedQueryParams = Readonly<{
  limit: number
  page: number
  offset: number
  orderBy: OrderBy
}>

/**
 * Creates a new Paginated result
 * @param props Pagination properties
 * @returns Immutable Paginated object
 */
export const createPaginated = <T>(props: Paginated<T>): Paginated<T> => ({
  count: props.count,
  limit: props.limit,
  page: props.page,
  data: Object.freeze([...props.data]),
})

export interface RepositoryPort<Entity> {
  findById(id: string): Promise<Entity>
  findByKey(key: StringEnum<keyof Entity>, value: unknown): Promise<Entity>
  findAll(): Promise<Entity[]>
  findAllByIds(ids: string[]): Promise<Entity[]>
  findAllPaginated(params: PaginatedQueryParams): Promise<Paginated<Entity>>
  existsById(id: string): Promise<boolean>
  count(): Promise<bigint | number>

  insert(entity: Entity): Promise<Entity>
  insertBulk(entity: Entity): Promise<void>
  insertMany(entities: Entity[]): Promise<void>
  insertBulkMany(entities: Entity[]): Promise<void>

  update(entity: Entity): Promise<Entity>
  updateBulk(entity: Entity): Promise<void>
  updateMany(entities: Entity[]): Promise<void>
  updateBulkMany(entities: Entity[]): Promise<void>

  delete(entity: Entity): Promise<boolean>
  deleteById(id: string): Promise<boolean>
  deleteAllByIds(ids: string[]): Promise<boolean>
  deleteBulk(ids: string[]): Promise<boolean>

  transaction<T>(handler: () => Promise<T>): Promise<T>
}
