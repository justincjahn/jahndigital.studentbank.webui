import { describe, it, expect } from 'vitest';
import useDebounce from './useDebounce';

describe('useDebounce.ts', () => {
  it('should only fire a function once during the specified time', async () => {
    let timesFired = 0;

    function sut() {
      timesFired += 1;
    }

    const debouncedFunc = useDebounce(sut, 50);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    await new Promise((r) => {
      setTimeout(r, 50);
    });

    expect(timesFired).toEqual(1);
  });

  it('should fire the function again after the debounce timer expires', async () => {
    let timesFired = 0;

    function sut() {
      timesFired += 1;
    }

    const debouncedFunc = useDebounce(sut, 50);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    await new Promise((r) => {
      setTimeout(r, 50);
    });

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    await new Promise((r) => {
      setTimeout(r, 50);
    });

    expect(timesFired).toEqual(2);
  });
});
