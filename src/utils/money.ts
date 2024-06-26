/**
 * Quick and dirty class to work with monetary values stored in databases as integers.
 */
export default class Money {
  // The precision when rounding and storing in the database (should probably be 2 for us currency)
  static precision = 2;

  /**
   * Converts the currency stored in the database as an integer into a Money object.
   *
   * @param amount
   */
  static fromDatabase(amount: number): Money {
    return new Money(amount / (10 ** Money.precision));
  }

  /**
   * Converts a regular number into a Money object.
   *
   * @param amount
   */
  static fromNumber(amount: number): Money {
    return new Money(amount);
  }

  /**
   * Converts a string into a Money object.
   *
   * @param amount
   */
  static fromString(amount: string): Money {
    const trimmed = amount.trim();
    if (/^-?\$?[0-9]{0,}\.?[0-9]{0,}$/.test(trimmed) !== true) {
      throw new Error('Provided value is not valid US currency.');
    }

    const sanitized = trimmed.replace(',', '').replace('$', '');
    const value = Number.parseFloat(sanitized);
    if (Number.isNaN(value)) {
      // We probably shouldn't end up here, but *just in case*
      throw new Error('Provided value is not a number.');
    }

    return this.fromNumber(value);
  }

  /**
   * Attempt to convert a string into a Money object, or return a Money object with a zero balance.
   *
   * @param amount The amount to try converting into a Money object.
   * @returns A Money object with the value provided as a string, or zero.
   */
  static fromStringOrDefault(amount: string): Money {
    try {
      const ret = this.fromString(amount);
      return ret;
    } catch {
      return this.fromNumber(0);
    }
  }

  // The actual amount as a float
  private amount: number;

  /**
   *
   * @param amount
   */
  private constructor(amount: number) {
    this.amount = amount;
  }

  /**
   * Converts the Money object into a whole number suitable for database storage
   */
  getDatabaseAmount(): number {
    return Math.floor(this.round() * (10 ** Money.precision));
  }

  /**
   * Returns the amount as a float
   */
  getAmount(): number {
    return this.amount;
  }

  /**
   * Rounds the amount using banker's rounding.
   */
  round(): number {
    return Money.round(this.amount, Money.precision);
  }

  /**
   * Subtracts the amount by the provided minuend.
   *
   * @param minuend The amount to subtract.
   */
  sub(minuend: Money): Money {
    return new Money(this.amount - minuend.getAmount());
  }

  /**
   * Adds the amount by the provided addend.
   *
   * @param addend The amount to add.
   */
  add(addend: Money): Money {
    return new Money(this.amount + addend.getAmount());
  }

  /**
   * Converts the object into a currency string.
   *
   * @returns String in the format $1.00.
   */
  toString(): string {
    return new Intl.NumberFormat(
      'en-US',
      {
        style: 'currency',
        currency: 'USD',
      },
    ).format(this.round());
  }

  /**
   * Rounds the amount using banker's rounding.
   *
   * @param num
   * @param precision
   */
  static round(num: number, precision = 2): number {
    const power = num * (10 ** precision);
    let rounded = Math.round(power);
    // eslint-disable-next-line no-nested-ternary
    rounded = Math.abs(power) % 1 === 0.5 ? (rounded % 2 === 0 ? rounded : rounded - 1) : rounded;
    return rounded / (10 ** precision);
  }
}
