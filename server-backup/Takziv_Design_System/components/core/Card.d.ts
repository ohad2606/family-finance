import React from 'react'

/**
 * Takziv content surface — off-white by default, ink when dark, with an optional colored top accent.
 * @startingPoint section="Core" subtitle="Light, paper & dark surfaces" viewport="700x220"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Surface tone. `dark` = forest-ink card with white text. */
  tone?: 'light' | 'paper' | 'dark';
  /** Corner radius token, or a raw CSS value. */
  radius?: 'lg' | 'xl' | '2xl' | string;
  /** Colored top accent border (e.g. var(--income)); used on summary cards. */
  accent?: string;
  /** Apply the quiet card shadow (auth / popovers). Most cards have none. */
  shadow?: boolean;
  children?: React.ReactNode;
}

/** Takziv content surface — off-white by default, ink when dark, with an optional colored top accent. */
export function Card(props: CardProps): JSX.Element;
