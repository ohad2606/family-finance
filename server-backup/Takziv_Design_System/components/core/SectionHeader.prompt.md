Heebo section title with an optional trailing ghost action — the header that opens every dashboard section.

```jsx
<SectionHeader title="תנועות אחרונות" actionLabel="הכל" onAction={goAll} />
<SectionHeader title="חשבונות">
  <Button variant="ghost" size="sm">+ הוסף</Button>
</SectionHeader>
```

Pass `children` for more than one trailing button.
