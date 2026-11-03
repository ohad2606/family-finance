import React from 'react'

/**
 * Currency figure in Heebo + tabular-nums, ₪ formatted he-IL, income/expense colored.
 * @startingPoint section="Core" subtitle="₪ figure — colored, tabular, signed" viewport="700x130"
 */
export interface MoneyAmountProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Numeric value in ILS. Rendered with abs() — sign comes from `kind`/`showSign`. */
  value: number;
  /** Color semantics. `auto` picks income/expense from the value's sign. */
  kind?: 'income' | 'expense' | 'neutral' | 'auto';
  /** Prefix a + (income) or − (expense). */
  showSign?: boolean;
  /** Use the brighter mint/rose colors for placement on a dark card. */
  onDark?: boolean;
  /** CSS font-size (e.g. '2.2rem' for a balance). */
  size?: string;
  /** CSS font-weight token. */
  weight?: string;
}

/** Currency figure in Heebo + tabular-nums, ₪ formatted he-IL, income/expense colored. */
export function MoneyAmount(props: MoneyAmountProps): JSX.Element;
