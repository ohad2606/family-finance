Brass-filled call to action; the one "do this" color on a Takziv screen. Use exactly one `primary` per view.

```jsx
<Button variant="primary" size="lg" onClick={start}>התחל בחינם</Button>
<Button variant="secondary">כניסה</Button>
<Button variant="ghost" size="sm">הכל</Button>
```

Variants: `primary` (brass + glow), `secondary` (hairline outline), `ghost` (brass text — used for "all/details" links), `dark` (ink fill). Sizes `sm | md | lg`. Pass `as="a"` + `href` for link-buttons (e.g. the Google sign-in row), and `fullWidth` for form submits.
