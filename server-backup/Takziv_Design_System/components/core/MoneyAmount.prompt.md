Every monetary figure in Takziv — Heebo, `tabular-nums`, ₪ formatted `he-IL` with no decimals, colored by semantics.

```jsx
<MoneyAmount value={127430} size="2.2rem" weight="var(--fw-black)" />      {/* neutral balance */}
<MoneyAmount value={14200} kind="income" showSign />                       {/* +₪14,200 green */}
<MoneyAmount value={3800} kind="expense" showSign />                       {/* −₪3,800 terracotta */}
<MoneyAmount value={158000} kind="income" onDark />                        {/* brighter mint on a dark card */}
```

`kind="auto"` colors by sign. Always abs()-es the value; the sign is drawn from `showSign`. Use `onDark` on ink surfaces so it switches to the mint/rose on-dark colors.
