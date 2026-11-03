import React from 'react'

export interface TabItem { value: string; label: string; }

/**
 * Segmented tabs — outline pills, active flips to ink fill / white text (the login switch).
 * @startingPoint section="Navigation" subtitle="Ink-fill segmented tabs" viewport="700x110"
 */
export interface TabsProps {
  items: TabItem[];
  /** Currently active value. */
  value: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

/** Segmented tabs — outline pills, active flips to ink fill / white text (the login switch). */
export function Tabs(props: TabsProps): JSX.Element;
