Dropdown matching the Input field. Children are native `<option>`s.

```jsx
<Select value={accountId} onChange={e => setAccountId(e.target.value)}>
  <option value="">בחר חשבון</option>
  <option value="1">עו״ש</option>
</Select>
```

Used in the add-transaction sheet for account & category pickers.
