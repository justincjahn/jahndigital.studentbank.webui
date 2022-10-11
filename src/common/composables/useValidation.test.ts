import { describe, it, expect } from 'vitest';
import { ref, Ref } from 'vue';
import useValidation, { ValidationFunc, DecoratorFunc } from './useValidation';

describe('useValidation.ts', () => {
  it('should validate when the value changes', async () => {
    let validationFired = false;
    const validationFunc: ValidationFunc = () => {
      validationFired = true;
      return '';
    };

    const { value } = useValidation(validationFunc);
    expect(validationFired).toBe(false);

    value.value = 'testing';

    await new Promise((r) => {
      setTimeout(r, 50);
    });

    expect(validationFired).toBe(true);
  });

  it('should validate when the value changes and immediately if requested', async () => {
    let validationFired = false;
    const validationFunc: ValidationFunc = () => {
      validationFired = true;
      return '';
    };

    const { value } = useValidation(validationFunc, { immediate: true });
    expect(validationFired).toBe(true);

    value.value = 'testing';

    await new Promise((r) => {
      setTimeout(r, 50);
    });

    expect(validationFired).toBe(true);
  });

  it('should pass in the value to the validation function', async () => {
    const data = 'This is a test!';
    let received: string | null = '';

    const validationFunc: ValidationFunc = (s) => {
      received = s;
      return '';
    };

    const { value } = useValidation(validationFunc);
    value.value = data;

    await new Promise((r) => {
      setTimeout(r, 50);
    });

    expect(received).toEqual(data);
  });

  it('should pass in the value to the validation function with decorations', async () => {
    const data = 'This is a test!';
    const decoratorData = ' Data to be appended.';
    const expectedData = `${data}${decoratorData}`;
    let received: string | null = '';

    const validationFunc: ValidationFunc = (s) => {
      received = s;
      return '';
    };

    const decoratorFunc: DecoratorFunc = (s) => `${s}${decoratorData}`;

    const { value } = useValidation(validationFunc, {
      decorator: decoratorFunc,
    });

    value.value = data;

    await new Promise((r) => {
      setTimeout(r, 50);
    });

    expect(received).toEqual(expectedData);
  });

  it('should use the provided value', async () => {
    const data = 'This is a test!';
    const value = ref('');
    let received: string | null = '';

    const validationFunc: ValidationFunc = (s) => {
      received = s;
      return '';
    };

    useValidation(validationFunc, {
      value,
    });

    value.value = data;

    await new Promise((r) => {
      setTimeout(r, 50);
    });

    expect(received).toEqual(data);
  });

  it('should output the provided error message from validation func', async () => {
    const data = 'This is a test!';
    const errorMessage = 'This is an error message.';
    let received: string | null = '';

    const validationFunc: ValidationFunc = (s) => {
      received = s;
      return errorMessage;
    };

    const { value, error } = useValidation(validationFunc);
    value.value = data;

    await new Promise((r) => {
      setTimeout(r, 50);
    });

    expect(received).toEqual(data);
    expect(error.value).toEqual(errorMessage);
  });

  it('should watch for effects in validation functions', async () => {
    const data = 'This is a test!';
    const errorMessage = 'Values do not match';
    const field2 = ref('');
    let timesFired = 0;
    let received: string | null = '';
    let receivedSecond = '';

    function validateSecondaryEffects(repeat: Ref<string>): ValidationFunc {
      return (value) => {
        timesFired += 1;
        const secondValue = repeat.value;
        received = value;
        receivedSecond = secondValue;

        if (value !== secondValue) {
          return errorMessage;
        }

        return '';
      };
    }

    const { value, error } = useValidation(validateSecondaryEffects(field2));
    expect(error.value).toEqual('');
    expect(value.value).toEqual(null);

    value.value = data;

    await new Promise((r) => {
      setTimeout(r, 50);
    });

    expect(received).toEqual(data);
    expect(error.value).toEqual(errorMessage);
    expect(timesFired).toEqual(1);

    field2.value = data;

    await new Promise((r) => {
      setTimeout(r, 50);
    });

    expect(receivedSecond).toEqual(data);
    expect(error.value).toEqual('');
    expect(timesFired).toEqual(2);
  });
});
