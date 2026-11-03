import React from 'react'

/**
 * Takziv text field — paper fill, hairline border, right-aligned, brass focus ring.
 * @startingPoint section="Forms" subtitle="Text field with brass focus" viewport="700x110"
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Native type — text | email | password | number | date … */
  type?: string;
  placeholder?: string;
}

/** Takziv text field — paper fill, hairline border, right-aligned, brass focus ring. */
export function Input(props: InputProps): JSX.Element;
