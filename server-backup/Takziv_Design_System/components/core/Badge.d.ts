import React from 'react'

/**
 * Small status pill — soft fg-on-tint health chips plus solid brass/income/expense fills.
 * @startingPoint section="Core" subtitle="Status & label pills" viewport="700x120"
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color tone. The first five are the soft health-status chips; the last three are solid fills. */
  tone?: 'excellent' | 'good' | 'fair' | 'poor' | 'na' | 'brass' | 'income' | 'expense';
  children?: React.ReactNode;
}

/** Small status pill — soft fg-on-tint health chips plus solid brass/income/expense fills. */
export function Badge(props: BadgeProps): JSX.Element;
