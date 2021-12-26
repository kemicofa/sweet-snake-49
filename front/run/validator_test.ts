import { validateUsername } from "./validator.ts";
import { assertEquals } from "https://deno.land/std@0.117.0/testing/asserts.ts";

Deno.test("should not validate empty string", () => {
  assertEquals(validateUsername(""), false);
});

Deno.test("should validate alpha numeric username", () => {
  assertEquals(validateUsername("aA01"), true);
});

Deno.test("should not validate non alpha numeric username", () => {
  assertEquals(validateUsername("aA01!"), false);
});

Deno.test("should not validate if username is longer than 32 characters", () => {
  const username = new Array(33).fill(undefined).map(() => "a").join("");
  assertEquals(validateUsername(username), false);
});
