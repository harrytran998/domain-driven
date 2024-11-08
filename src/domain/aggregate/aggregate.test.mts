import type { EntityId } from "@techmely/types";
import { describe, expect } from "vitest";
import { Aggregate } from ".";

describe("Aggregate", () => {
  describe("Aggregate basic", () => {
    type Props = {
      id: EntityId;
      name: string;
      age: number;
    };

    const User = Aggregate.create<Props>({ id: 1, name: "John", age: 20 });
    const value = User.value();
    const { createdAt, updatedAt, ...rest } = value.toObject();
    expect(rest).toStrictEqual({ id: 1, name: "John", age: 20 });
  });

  describe("Aggregate with no id", () => {
    type Props = {
      name: string;
      age: number;
    };

    const User = Aggregate.create<Props>({ name: "John", age: 20 });
    const value = User.value();
    const { createdAt, updatedAt, id, ...rest } = value.toObject();
    expect(id.toString().startsWith("ett")).toBe(true);
    expect(rest).toStrictEqual({ name: "John", age: 20 });
  });

  // describe("Aggregate with updated/created at");
  // describe("Aggregate with domain id");
  // describe("Aggregate events", () => {
  //   it("Should dispatch the specified event");
  //   it("Should add event");
  //   it("Should remove event");
  //   it("Should dispatch all events");
  //   it("Should clear all events");
  // });
  // describe("Aggregate to object");
});
