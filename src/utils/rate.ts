/**
 * Quick and dirty class to work with rate values stored in databases as integers.
 */
export default class Rate {
  // The precision when rounding and storing in the database
  static precision = 4;

  /**
   * Converts the rate stored in the database as an integer into a Rate object.
   *
   * @param rate
   */
  static fromDatabase(rate: number): Rate {
    return new Rate(rate / (10 ** Rate.precision));
  }

  /**
   * Converts a regular number into a Rate object.
   *
   * @param rate
   */
  static fromNumber(rate: number): Rate {
    return new Rate(rate);
  }

  /**
   * Converts a string into a Rate object, or throws an exception.
   *
   * @param rate
   */
  static fromString(rate: string): Rate {
    const s = rate
      .replace(' ', '') // Replace all spaces (38 % -> 38%)
      .replace(',', '') // Replace thousands separator
      .replace(/[%]{2,}/, '%') // Replace redundant percentage characters
      .replace(/[.]+/, '.') // Replace repeated periods
      .replace(/[.]([%])?$/, '$1'); // Replace unnecessary periods

    // Make sure the rate has zero or one decimal points
    if ((s.match(/\./g) || []).length > 1) {
      throw new Error(
        'Rates may only contain one decimal point.',
      );
    }

    // Make sure the string contains valid characters
    if (!/^-?[0-9]+(\.?[0-9]+)?[%]?$/.test(s)) {
      throw new Error(
        'Rates cannot contain alpha characters or special characters other than period and percent.',
      );
    }

    // If the rate was provided as a percentage, convert it and divide by 100
    if (s.endsWith('%')) {
      if (s.length === 1) {
        throw new Error(
          'Rate percentages must contain a numeric value and only a percent was provided.',
        );
      }

      const r = (Number.parseFloat(s.substring(0, s.length - 1)) / 100);
      return new Rate(r);
    }

    // The rate didn't contain a percent, so it is probably a float already
    const r = Number.parseFloat(s);
    return new Rate(r);
  }

  /**
   * Tries to convert the provided string to a Rate, or returns a new rate of 0.
   *
   * @param {string} rate String representation of the rate to try and convert.
   * @returns A rate representing the input, or a default of 0%
   */
  static fromStringOrDefault(rate: string): Rate {
    try {
      return this.fromString(rate);
    } catch {
      return new Rate(0);
    }
  }

  /**
   * Rounds the rate to the nearest .125.
   *
   * @param num
   * @param precision
   */
  static round(num: number, precision = 0.125): number {
    const p = 1 / precision;
    return Math.round(num * p) / p;
  }

  // The actual rate as a float
  private rate: number;

  /**
   *
   * @param amount
   */
  private constructor(rate: number) {
    this.rate = rate;
  }

  /**
   * Converts the Rate object into a whole number suitable for database storage
   */
  getDatabaseRate(): number {
    return Math.floor(this.round() * (10 ** Rate.precision));
  }

  /**
   * Returns the rate as a float. Use toLocaleString to make into a percentage.
   */
  getRate(): number {
    return this.rate;
  }

  /**
   * Rounds the amount using banker's rounding.
   *
   * @param precision The nearest number to round to.
   */
  round(nearest = 0.125): number {
    return Rate.round(this.rate, nearest);
  }

  /**
   * Subtracts the rate by the provided minuend.
   *
   * @param minuend The amount to subtract.
   */
  sub(minuend: Rate): Rate {
    return new Rate(this.rate - minuend.getRate());
  }

  /**
   * Adds the rate by the provided addend.
   *
   * @param addend The amount to add.
   */
  add(addend: Rate): Rate {
    return new Rate(this.rate + addend.getRate());
  }

  /**
   * Converts the object to a percent.
   *
   * @returns The rate as a percent.
   */
  toPercent(locale = 'en-US'): string {
    return this.rate.toLocaleString(locale, { style: 'percent' });
  }

  /**
   * Converts the object to a string.
   *
   * @returns The rate as a percentage.
   */
  toString(): string {
    return this.toPercent(navigator.language);
  }
}
