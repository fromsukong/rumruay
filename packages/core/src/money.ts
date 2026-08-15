import Decimal from 'decimal.js';

/** Currency code. Start with THB (Prame's base) — extensible via ISO 4217. */
export type Currency = 'THB' | 'USD' | 'EUR' | 'JPY';

/**
 * Immutable money value backed by decimal.js.
 * All financial math in rumruay goes through Money to avoid float drift.
 */
export class Money {
  readonly #amount: Decimal;
  readonly currency: Currency;

  constructor(amount: Decimal.Value, currency: Currency = 'THB') {
    this.#amount = new Decimal(amount);
    this.currency = currency;
  }

  get value(): Decimal {
    return this.#amount;
  }

  get isNegative(): boolean {
    return this.#amount.isNegative();
  }

  add(other: Money): Money {
    this.#assertSameCurrency(other);
    return new Money(this.#amount.plus(other.#amount), this.currency);
  }

  subtract(other: Money): Money {
    this.#assertSameCurrency(other);
    return new Money(this.#amount.minus(other.#amount), this.currency);
  }

  multiply(factor: Decimal.Value): Money {
    return new Money(this.#amount.times(factor), this.currency);
  }

  abs(): Money {
    return new Money(this.#amount.abs(), this.currency);
  }

  /** Format as a human-readable string, e.g. "฿1,234.56". */
  format(): string {
    const symbol = this.currency === 'THB' ? '฿' : `${this.currency} `;
    const fixed = this.#amount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    const grouped = (intPart ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${symbol}${grouped}.${decPart ?? '00'}`;
  }

  toJSON(): string {
    return this.format();
  }

  #assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}

export const THB = (amount: Decimal.Value): Money => new Money(amount, 'THB');
