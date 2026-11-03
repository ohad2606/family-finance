Segmented control. Equal-width outline pills; active flips to ink fill with white text.

```jsx
<Tabs value={mode} onChange={setMode}
  items={[{ value: 'login', label: 'כניסה' }, { value: 'register', label: 'הרשמה' }]} />
```

Used for the login/register switch. For the income/expense money switch use `KindToggle` instead (it color-fills).
