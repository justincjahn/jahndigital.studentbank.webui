import { describe, it, expect } from 'vitest';
import '@/common/utils/tests/crypto';
import { create, subscribe, publish } from './eventBus';

describe('services/eventBus.ts', () => {
  it('fires an event with no payload', () => {
    const TEST_EVENT = create('TEST_EVENT');

    let fired = false;
    function testSubscriber() {
      fired = true;
    }

    const unsubscribe = subscribe(TEST_EVENT, testSubscriber);
    publish(TEST_EVENT);
    unsubscribe();

    expect(fired).toBe(true);
  });

  it('fires an event with a payload', () => {
    const expected = { value: 'TESTING!!!' };
    const TEST_EVENT = create<{ value: string }>('TEST_EVENT_PAYLOAD');

    let value = '';
    function testSubscriber(val: { value: string }) {
      value = val.value;
    }

    const unsubscribe = subscribe(TEST_EVENT, testSubscriber);
    publish(TEST_EVENT, expected);
    unsubscribe();

    expect(value).toBe(expected.value);
  });

  it('no longer fires an unsubscribed event', () => {
    const TEST_EVENT = create('TEST_EVENT_UNSUBSCRIBED');

    let callCount = 0;
    function testSubscriber() {
      callCount += 1;
    }

    const unsubscribe = subscribe(TEST_EVENT, testSubscriber);
    publish(TEST_EVENT);
    unsubscribe();
    publish(TEST_EVENT);

    expect(callCount).toBe(1);
  });
});
