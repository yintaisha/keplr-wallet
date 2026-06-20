import { Message } from "./message";
import { MessageRequester } from "./types";

const symbolRoute: unique symbol = Symbol();
const symbolType: unique symbol = Symbol();
const symbolData: unique symbol = Symbol();

const reservedDataKeys = new Set([
  "approveExternal",
  "route",
  "toJSON",
  "type",
  "validateBasic",
]);

export class SimpleMessage<R = any> extends Message<R> {
  protected [symbolRoute]: string;
  protected [symbolType]: string;
  protected [symbolData]: Record<string, any>;

  [key: string]: any;

  constructor(route: string, type: string, data: Record<string, any>) {
    super();

    this[symbolRoute] = route;
    this[symbolType] = type;
    this[symbolData] = Object.create(null);

    for (const key of Object.keys(data)) {
      Object.defineProperty(this[symbolData], key, {
        configurable: true,
        enumerable: true,
        value: data[key],
        writable: true,
      });

      if (!reservedDataKeys.has(key)) {
        Object.defineProperty(this, key, {
          configurable: true,
          enumerable: true,
          value: data[key],
          writable: true,
        });
      }
    }
  }

  route(): string {
    return this[symbolRoute];
  }

  type(): string {
    return this[symbolType];
  }

  // validateBasic should be handled in background.
  validateBasic(): void {
    // noop
  }

  // approveExternal should be handled in background.
  override approveExternal(): boolean {
    return true;
  }

  toJSON(): Record<string, any> {
    const message = { ...this[symbolData] };

    if (Object.prototype.hasOwnProperty.call(this, "origin")) {
      message["origin"] = this.origin;
    }

    if (this.routerMeta !== undefined) {
      message["routerMeta"] = this.routerMeta;
    }

    return message;
  }
}

/**
 * Send message without typing and message instance.
 * Usage of this function is not recommended.
 * However, if you know about this function well,
 * and you want to avoid the usage of troublesome typing and class definition,
 * You can try using this function.
 * @param requester
 * @param port
 * @param route
 * @param type
 * @param data
 */
export async function sendSimpleMessage<R = any>(
  requester: MessageRequester,
  port: string,
  route: string,
  type: string,
  data: Record<string, any>
): Promise<R> {
  return await requester.sendMessage(
    port,
    new SimpleMessage(route, type, data)
  );
}
