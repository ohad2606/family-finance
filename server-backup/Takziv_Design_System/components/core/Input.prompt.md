Takziv text field — paper fill, hairline border, 12px radius, right-aligned for Hebrew, brass focus ring.

```jsx
<Input type="email" placeholder="אימייל" value={email} onChange={e => setEmail(e.target.value)} />
<Input type="password" placeholder="סיסמה" />
```

Stretches full width. Pair with `Select` and `Button fullWidth` inside auth and bottom-sheet forms.
