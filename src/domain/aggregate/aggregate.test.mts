import { describe, expect, it } from "vitest";
import { Aggregate } from ".";
import { Result } from "../../utils";
import type { EntityProps } from "../entity/types";
import type { AggregateConfig } from "./types";

describe("Aggregate", () => {
  describe("Aggregate basic", () => {
    type Props = {
      id: string;
      name: string;
    };
    // it("Should generate exactly hash-code");
    // it("Should have a context");
    // it("Should get a valid aggregate metrics");
    // it("Should clone another instance");
  });
  // describe("Aggregate with value object");
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
