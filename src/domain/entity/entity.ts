import type { Records } from "@techmely/types";
import { invariant } from "@techmely/utils";
import { Result } from "../../utils";
import type { IResult } from "../../utils/result/types";
import type { EntityConfig, EntityPort, EntityProps } from "./types";
import { UniqueEntityID } from "./unique-entity";

const defaultEntityConfig: EntityConfig = {
  debug: Boolean(process.env.DEBUG) || false,
};

export class Entity<Props extends EntityProps> implements EntityPort<Props> {
  readonly #props: Props;
  readonly #config: EntityConfig;

  constructor(props: EntityProps, config?: EntityConfig) {
    let { id, ...rest } = props;
    id = id || UniqueEntityID.create();
    this.#props = { ...rest, id } as any;
    this.#config = config || defaultEntityConfig;
  }

  static isEntity(entity: unknown): entity is Entity<any> {
    return entity instanceof Entity;
  }

  public static create(props: EntityProps, config?: EntityConfig): IResult<any, any, any>;
  /**
   *
   * @param props params as Props
   * @param id optional uuid as string in props. If not provided on props a new one will be generated.
   * @returns instance of result with a new Entity on state if success.
   * @summary result state will be `null` case failure.
   */
  public static create(props: EntityProps, config?: EntityConfig): Result<any, any, any> {
    const entity = new Entity(props, config);
    return Result.Ok(entity);
  }

  /**
   * @description Get hash to identify the entity.
   */
  hashCode(): UniqueEntityID {
    const instance = Reflect.getPrototypeOf(this);
    return new UniqueEntityID(`[Entity@${instance?.constructor?.name}]:${this.#props.id}`);
  }

  /**
   * @description Get a new instanced based on current Entity.
   * @summary if not provide an id a new one will be generated.
   * @param props as optional Entity Props.
   * @returns new Entity instance.
   */
  clone(props?: Partial<Props>): this {
    const _props = props ? { ...this.#props, ...props } : this.#props;
    const instance = Reflect.getPrototypeOf(this);
    invariant(instance, "Cannot get prototype of this entity instance");
    const entity = Reflect.construct(instance.constructor, [_props, this.#config]);
    return entity;
  }

  /**
   * Convert an Entity and all sub-entities/Value Objects it
   * contains to a plain object with primitive types. Can be
   * useful when logging an entity during testing/debugging
   */
  toObject(): Records {
    const clone = this.#convertPropsToObject(this.#props);
    const result = {
      id: this.#props.id?.toString(),
      createdAt: this.#props.createdAt,
      updatedAt: this.#props.updatedAt,
      ...clone,
    };
    return Object.freeze(result);
  }

  #convertPropsToObject(props: Props) {
    const propsCopy = structuredClone(props) as any;
    for (const prop in propsCopy) {
      const item = propsCopy[prop];
      if (Array.isArray(item)) {
        propsCopy[prop] = item.map((i) => {
          return Entity.isEntity(i) ? i.toObject() : i;
        });
      }
      propsCopy[prop] = Entity.isEntity(item) ? item.toObject() : item;
    }

    return propsCopy;
  }
}
