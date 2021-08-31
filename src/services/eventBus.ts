/* eslint-disable @typescript-eslint/ban-types */

import uuid4 from '@/utils/uuid4';

/**
 * Denotes a function signature that accepts a payload and returns nothing.
 */
export type Action<TPayload = undefined> = (payload: TPayload) => void;

/**
 * Information about a registered event.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface EventInfo<TPayload extends object|undefined = any> {
  name: string;
  payload: TPayload;
}

/**
 * Individual subscriptions
 */
interface EventSubscription<TPayload> {
  [id: string]: Action<TPayload>;
}

/**
 * Collection of event subscriptions
 */
interface EventSubscriptions {
  [event: string]: EventSubscription<unknown>;
}

// The global subscriptions object
const subscriptions: EventSubscriptions = {};

/**
 * Create a new event
 *
 * @param name The name of the event.
 * @returns
 */
export function create<TPayload extends object|undefined = undefined>(
  name: string,
): EventInfo<TPayload> {
  return {
    name,
    payload: {} as TPayload,
  } as EventInfo<TPayload>;
}

/**
 * Subscribe to a given event.
 *
 * @param event The event to subscribe to.
 * @param visitor The function to call when the event is triggered.
 * @returns A function that, when called, will unsubscribe from the event.
 */
export function subscribe<TEvent extends EventInfo>(
  event: TEvent,
  visitor: Action<TEvent['payload']>,
): () => void {
  const uuid = uuid4();

  if (!Object.keys(subscriptions).includes(event.name)) {
    subscriptions[event.name] = {} as EventSubscription<EventInfo['payload']>;
  }

  subscriptions[event.name][uuid] = visitor;

  return () => {
    delete subscriptions[event.name][uuid];
  };
}

/**
 * Publish a payload (fire) a given event.
 *
 * @param event The event to fire.
 * @param payload The payload to provide to subscribers.
 */
export function publish<TEvent extends EventInfo>(
  event: TEvent,
  payload: TEvent['payload'],
): void {
  if (!subscriptions[event.name]) return;
  Object.values(subscriptions[event.name]).forEach((visitor) => visitor(payload));
}
