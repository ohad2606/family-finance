import React from 'react'

/**
 * The expense/income switch — active pill fills with the matching money color.
 * @startingPoint section="Forms" subtitle="Expense / income color switch" viewport="700x110"
 */
export interface KindToggleProps {
  /** 'expense' or 'income'. */
  value?: 'expense' | 'income';
  onChange?: (value: 'expense' | 'income') => void;
  style?: React.CSSProperties;
}

/** The expense/income switch — active pill fills with the matching money color. */
export function KindToggle(props: KindToggleProps): JSX.Element;
