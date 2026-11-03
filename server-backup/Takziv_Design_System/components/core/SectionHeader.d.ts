import React from 'react'

export interface SectionHeaderProps {
  /** Section title (Heebo). */
  title: string;
  /** Optional trailing ghost-button label, e.g. 'הכל' or '+ הוסף'. */
  actionLabel?: string;
  onAction?: () => void;
  /** Custom trailing content; overrides actionLabel. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Section title with an optional trailing brass ghost action — the header atop every dashboard card. */
export function SectionHeader(props: SectionHeaderProps): JSX.Element;
