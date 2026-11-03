import React from 'react'

/**
 * Takziv brand lockup — logomark + optional תקציב wordmark, light or on-dark.
 * @startingPoint section="Brand" subtitle="Logomark + תקציב wordmark" viewport="700x140"
 */
export interface LogoProps {
  /** Logomark height in px; the wordmark scales with it. */
  size?: number;
  /** Show the תקציב wordmark beside the mark. */
  wordmark?: boolean;
  /** Use white wordmark for placement on an ink surface. */
  onDark?: boolean;
  style?: React.CSSProperties;
}

/** Takziv brand lockup — logomark + optional תקציב wordmark, light or on-dark. */
export function Logo(props: LogoProps): JSX.Element;
