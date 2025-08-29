# Fix for Controlled Component Error

## Problem
The application was showing a React error:

```
Error: You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set `onChange`.
```

## Root Cause
In the `FolderFormDialog.tsx` component, several form elements had `value` props but were missing `onChange` handlers:

1. **Goal Type** `<select>` (line 178)
2. **Goal Description** `<Textarea>` (line 195) 
3. **Goal Status** `<select>` (line 205)
4. **Goal Priority** `<select>` (line 220)
5. **Goal Notes** `<Textarea>` (line 247)

These elements were intended to be read-only but React requires controlled components to have both `value` and `onChange` props.

## Solution Applied

### For `<select>` Elements
Added both `onChange={() => {}}` (no-op handler) and `disabled` attribute:

```tsx
<select
  value={folder?.goal_type || ''}
  onChange={() => {}} // Read-only, no-op handler
  disabled
>
```

### For `<Textarea>` Elements
Added `onChange={() => {}}` (no-op handler) while keeping `readOnly`:

```tsx
<Textarea
  value={folder?.goal_description || ''}
  onChange={() => {}} // Read-only, no-op handler
  readOnly
/>
```

## Why This Works

1. **Controlled Components**: React requires form elements with `value` props to also have `onChange` handlers
2. **Read-only Intent**: The `disabled` (for selects) and `readOnly` (for textareas) attributes preserve the intended read-only behavior
3. **No-op Handler**: The empty `onChange={() => {}}` satisfies React's requirement without allowing actual changes

## Alternative Solutions

If these fields should be truly read-only and not form controls, consider:

1. **Using `defaultValue`** instead of `value` (makes them uncontrolled)
2. **Displaying as text** instead of form elements
3. **Using `<input readOnly>`** for text fields

## Files Modified
- `src/components/ui/FolderFormDialog.tsx`

## Testing
After applying this fix, the React controlled component error should no longer appear in the browser console. 