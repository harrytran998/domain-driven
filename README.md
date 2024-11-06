# @techmely/domain-driven

Domain driven design for all techmely apps. We follow the [type-ddd](https://github.com/4lessandrodev/type-ddd) project and change some parts to fit our needs


## Expose functions



## Core concepts about Domain Driven Design

Please read docs carefully before using this lib

Note alias word

```
Domain services = DS

```

### 1. Ubiquitous language

- The language/terms agreed upon by both business-developer side, within a bounded context
- Entities with the same name in a different context can have different behavior and data
- Bounded context helps in single responsibility for domain models

### 2. Rich domain model

- Models(aggregates, entities, value objects) with the rich behavior are preferred over anemic domain models(entities without behavior, which only keep data and represent the DB tables)

- Due to single responsibility principle (a class or method should have only one reason to change), non-cohesive behavior should delegated to other classes(or even handled inside DS) when necessary

- Model methods can also delegate the task to DS by raising domain events

### 3. Thin domain service working on rich domain models

- DS should not hold state(different with application services, they are on the outer layer close to the UI layer, and can hold application/task state)

- DS should not contain behavior, only which does not fit cohesively in any domain model

- DS should locate in the core domain layer and expose domain models in their interfaces ???

### 4. Layers in a DDD App

- Core domain layer: aggregates, entities, value objects, events
- Core domain layer is surrounded by the UI/Application layer: UI & application service facade with messaging, JSON, XML, capabilities, session, etc...
- Infra layer: Persistence, file system, network, mail, logging, etc...

### 5. Entities

- Live longer than the application, should endure restarts, and are persisted and read from data sources (DB, file system, network, etc.)
- Have an id (preferably a GUID rather than a DB generated int because business transactions do not rely on persistence, can be persisted after other operations carried out in model's behavior)
- Have entity semantics (equality and GetHashCode() defined by class name + id)
- Behavior in an entity mostly orchestrates value objects for a use case
- Entity class should not have public property setters, setting a property should be a behavior method
- Entities should not have bidirectional relations (depending on the bounded context, either an egg can have a chicken or a chicken can have eggs, but not both)
- Entity relations should not reflect the complete set of DB foreign key relationships, should be bare down to the minimum for performing the behavior inside the bounded context
- Entity relations should not hold a reference to another entity class, it can only keep the id of another entity
- If a business transaction needs a reference to other entities in relation, aggregates should be used instead (aggregates can hold a reference to other aggregate roots, which are entity classes by definition)

### 6. Value objects

Theory: A value object is a small, simple object that represents a single value or characteristic, such as a monetary amount or a date. It is characterized by having no identity of its own, meaning it is equal to another value object if its values are equal, regardless of its reference. Value objects are often used in domain-driven design to represent simple entities in the system.

- Are only identified by their values, not by their ids (for example money is a value object as long as we are not tracking individual banknotes, if we need to track individual banknotes then it should be a banknote entity)
- Can be used to measure or describe things (name, description, amount, height, date, time, range, address, etc.)
- You can combine other value types that usually go together into a new value object type, like address (city, street, country, postal code) or ...range, or ...type
- Prefer to put the behavior on value objects rather than on entities because value objects are immutable and do not have side effects (like changing their state or changing the state of any entity)
- Can be part of an entity
- Have value semantics (equality and GetHashCode() defined by property values)
- Should be immutable, behaviors should not change the state of a value object, but can rather create a new value object (should act similar to C# strings, structs, ints, and other value types)
- Can be persisted but only as part of an entity, not individually

We use [valibot](https://valibot.dev/) to validate value objects.

Example:

*Create a value object with business rules.*

```ts
const 

```


### 7. Factories

- Create, build aggregates and entities:
- Static Create...() factory method on a model class is used to guard against the construction of an invalid or incomplete model
- The model class should not have a public default constructor (however if it is to be persisted, for Entity Framework to work, it can have a protected or private default constructor)

### 8. Aggregates

- Encapsulate and are composed of entity classes and value objects that change together in a business transaction
- Aggregates are a transactional graph of model objects
- Aggregate root should be an entity, an aggregate can even be a single entity
- Aggregate can keep a reference to other aggregate roots, but not to other entity classes which are not aggregate roots themselves
- Aggregate should not keep a reference to other aggregate root entity classes if those other entities do not change together with this aggregate root entity
- Aggregate can also keep the id of another entity, but keeping too many foreign key ids is a code smell (why?)
- If deleting an entity has a cascade effect on the other entities referenced by class in the object graph, these entities are part of the same aggregate, if not, they should not be inside this aggregate

### 9. Repositories

- Persist and read aggregates to/from DB or file system
- Should have an interface close to a collection but should allow only the necessary operations needed for this aggregate (for example an aggregate might not need to be allowed to get updated or deleted)
- Should not be generic (should be specific for the aggregate type)
- Can have specific query methods if needed (like FindByName() etc.)
- Do not use lazy loading, instead use eager loading (use Include(...) in Entity Framework), else you can face "N+1 problem"s and excessive number of queries sent to DB
- Can have specific methods that only load some of the columns from a table
- Repository add/update/remove operation should commit to DB by itself (call Entity Framework ...Context.SaveChanges() at the end), because aggregate operations should be ACID transactions
- Repository interface sits inside Core domain layer, but implementations are inside Infrastructure layer
- Repositories are not used inside the domain models (entities, value objects, aggregates)

### 10. Shared Kernel

Is where cross-cutting concerns or common types shared by all bounded contexts sit (like entity abstract base type, value object abstract base type, common value objects, authorization, etc.)

### 11. Domain Events

- Can be raised when a state change occurs in an entity
- Decouple models from each other
- Only used when an event needs to be handled inside a different model than the one raising this event, or handled inside a domain service or even an application service
- Are immutable classes, that represent past, named in the past tense, and cannot change (...Changed, ...Happened, etc.)
- Should include the time that this event was raised, as well as any other useful info for handling the event, as well as the id of the entity which raised the event
- Should not have behavior
- Domain events are subscribed to with a callback (lambda), or using pub sub interfaces, on a singleton or static event message bus
- Domain events implemented this way can be subscribed to and handled in the aggregate root of the entity which raised the event, or in domain services, or even in UI/Application layer
- Domain events are raised synchronously, if an asynchronous task needs to be carried out, it can be done inside the event handler (async-await pattern)
- Outside applications can also be triggered by using a message queue or an enterprise service bus (ESB) inside the domain event handler

### 12. Anti-corruption layer

- Used to translate models from outside system or legacy apps to models inside the bounded context and vice versa. Also to ease the communication with legacy services

- Can use service facades and model adapters

## Details Domain Driven Design

### Entities
### Value Objects
### Factories
### Aggregates
### Repositories
### Shared Kernel
### Domain Events

## Folder structures

Folders structure suggestion

- Application layer
- Domain layer
  - Contexts
- Infra layer

## License

MIT &copy; [TechMeLy](https://github.com/sponsors/TechMeLy)
