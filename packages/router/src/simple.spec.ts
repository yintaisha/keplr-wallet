import { SimpleMessage } from "./simple";
import { JSONUint8Array } from "./uint8-array";

describe("Test simple message", () => {
  it("test simple message", () => {
    const simpleMessage = new SimpleMessage("route-test", "type-test", {
      test: 1,
      test2: "test",
    });

    expect(simpleMessage.route()).toBe("route-test");
    expect(simpleMessage.type()).toBe("type-test");
    expect(simpleMessage.approveExternal()).toBe(true);
    expect(() => {
      simpleMessage.validateBasic();
    }).not.toThrow();
  });

  it("encoded simple message should have only datas", () => {
    const simpleMessage = new SimpleMessage("route-test", "type-test", {
      test: 1,
      test2: "test",
    });

    const encoded = JSONUint8Array.stringify(simpleMessage);
    const decoded = JSONUint8Array.parse(encoded);

    expect(decoded["route"]).toBe(undefined);
    expect(decoded["type"]).toBe(undefined);
    expect(decoded["test"]).toBe(1);
    expect(decoded["test2"]).toBe("test");
    expect(Object.keys(decoded).length).toBe(2);
  });

  it("data keys should not override simple message methods", () => {
    const simpleMessage = new SimpleMessage("route-test", "type-test", {
      approveExternal: false,
      route: "data-route",
      toJSON: "data-to-json",
      type: "data-type",
      validateBasic: "data-validate-basic",
    });

    expect(simpleMessage.route()).toBe("route-test");
    expect(simpleMessage.type()).toBe("type-test");
    expect(simpleMessage.approveExternal()).toBe(true);
    expect(() => {
      simpleMessage.validateBasic();
    }).not.toThrow();

    const encoded = JSONUint8Array.stringify(simpleMessage);
    const decoded = JSONUint8Array.parse(encoded);

    expect(decoded["approveExternal"]).toBe(false);
    expect(decoded["route"]).toBe("data-route");
    expect(decoded["toJSON"]).toBe("data-to-json");
    expect(decoded["type"]).toBe("data-type");
    expect(decoded["validateBasic"]).toBe("data-validate-basic");
  });

  it("should preserve router metadata when encoding simple messages", () => {
    const simpleMessage = new SimpleMessage("route-test", "type-test", {
      test: 1,
    });
    Object.defineProperty(simpleMessage, "origin", {
      configurable: true,
      enumerable: true,
      value: "https://example.com",
      writable: true,
    });
    simpleMessage.routerMeta = {
      routerId: 1,
    };

    const encoded = JSONUint8Array.stringify(simpleMessage);
    const decoded = JSONUint8Array.parse(encoded);

    expect(decoded["test"]).toBe(1);
    expect(decoded["origin"]).toBe("https://example.com");
    expect(decoded["routerMeta"]).toEqual({
      routerId: 1,
    });
  });
});
