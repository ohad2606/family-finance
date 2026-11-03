The Takziv surface — a fill + radius, usually borderless. Separation comes from paper→card→ink contrast.

```jsx
<Card>…</Card>                                  {/* off-white */}
<Card tone="dark" radius="xl">שווי נקי …</Card>  {/* forest-ink, white text */}
<Card accent="var(--income)">הכנסות יוני</Card>  {/* 3px colored top border */}
```

`tone`: light | paper | dark. `radius`: lg(16) | xl(20) | 2xl(22). `accent` adds the colored top-border used on the income/expense summary cards. `shadow` adds the quiet card shadow (auth card, popovers) — most cards have none.
