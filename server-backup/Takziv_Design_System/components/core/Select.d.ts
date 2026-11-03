import React from 'react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: React.ReactNode;
}

/** Takziv dropdown — matches the Input field styling; children are <option>s. */
export function Select(props: SelectProps): JSX.Element;
