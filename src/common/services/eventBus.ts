import uuid4 from '@/common/utils/uuid4';

/**
 * Simple implementation of a type-safe event system that enables the creation of a shared
 * EventInfo object that can be subscribed to.  Subscribers can subsequently remove their
 * subscriptions by calling the function returned by the subscribe method.  Publishers can
 * call the publish function by passing in the EventInfo object and the payload, if required.
 */

/**
 * Denotes a function signature that accepts a payload and returns nothing.
 */
export type Action<TPayload = undefined> = (payload: TPayload) => void;

/**
 * Denotes the type of payload for a given event.
 */
export type Payload = object | string | number | null | undefined;

/**
 * Information about a registered event.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface EventInfo<TPayload extends Payload = any> {
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
 * Create a new event.
 *
 * @param name The name of the event.
 * @returns An EventInfo object that is used to publish and subscribe to events.
 */
export function create<TPayload extends Payload = undefined>(
  name: string
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
  visitor: Action<TEvent['payload']>
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
 * Publish (fire) a given event with an optional payload object.
 *
 * @param event The event to fire.
 * @param payload The payload to provide to subscribers, if required.
 */
export function publish<TEvent extends EventInfo>(
  event: TEvent,
  payload: TEvent['payload'] = undefined
): void {
  if (!subscriptions[event.name]) return;
  Object.values(subscriptions[event.name]).forEach((visitor) =>
    visitor(payload)
  );
}
