import React from 'react'

/**
 * Takziv action button — brass primary, outline secondary, ghost text, ink dark.
 * @startingPoint section="Core" subtitle="Brass / outline / ghost / dark actions" viewport="700x150"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `primary` = brass fill (one per view), `secondary` = outline, `ghost` = brass text link, `dark` = ink fill. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
  /** Size — controls padding & font size. */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
  disabled?: boolean;
  /** Render as a different element, e.g. 'a' for a link-button. */
  as?: 'button' | 'a';
  children?: React.ReactNode;
}

/** Takziv action button — brass primary, outline secondary, ghost text, ink dark. */
export function Button(props: ButtonProps): JSX.Element;
