# Shop Name Autocomplete Feature

## Overview
The Shop Name autocomplete feature provides intelligent suggestions when entering shop names in expense forms. This feature helps users input data faster by suggesting previously used shop names within the same project.

## Features

### 1. Smart Suggestions
- **Automatic Extraction**: Extracts all unique shop names from existing expenses in the current project
- **Real-time Filtering**: Filters suggestions based on what you type
- **Case-Insensitive Search**: Finds matches regardless of letter casing

### 2. User Interface
- **Dropdown Display**: Shows suggestions in a clean dropdown below the input field
- **Hover Highlighting**: Highlights suggestions on mouse hover
- **Keyboard Selection**: Highlights the selected suggestion when navigating with keyboard
- **Auto-hide**: Dropdown disappears when clicking outside or after selection

### 3. Keyboard Navigation
- **Arrow Down** (↓): Move to next suggestion
- **Arrow Up** (↑): Move to previous suggestion
- **Enter**: Select the highlighted suggestion
- **Escape**: Close the suggestions dropdown

## How to Use

### Method 1: Mouse/Touch
1. Click on the "Shop Name" field in the expense form
2. Start typing the shop name
3. Matching suggestions will appear below
4. Click on any suggestion to select it

### Method 2: Keyboard
1. Tab to or click on the "Shop Name" field
2. Start typing the shop name
3. Use Arrow Down/Up to navigate through suggestions
4. Press Enter to select the highlighted suggestion
5. Press Escape to close suggestions without selecting

## Examples

### Scenario 1: Repeating Restaurant
If you've entered "7-Eleven" before:
1. Type "7" → suggestion "7-Eleven" appears
2. Click or press Enter to select it
3. The field is automatically filled

### Scenario 2: Similar Shop Names
If you have "McDonald's Central" and "McDonald's Silom":
1. Type "mcd" → both suggestions appear
2. Continue typing or use arrows to select the correct one

## Technical Details

### State Management
- `shopNameSuggestions`: Array of unique shop names from all expenses
- `showSuggestions`: Boolean to control dropdown visibility
- `selectedSuggestionIndex`: Index of keyboard-selected suggestion

### Data Source
- Suggestions are extracted from `expenses` array
- Filters out empty/null shop names
- Updates automatically when expenses change

### Performance
- Minimal impact: Uses React's `useMemo`-like pattern
- Efficient filtering with case-insensitive search
- Debounced blur event (200ms) for smooth UX

## Benefits

1. **Faster Data Entry**: Reduces typing for repeated shop names
2. **Consistency**: Helps maintain consistent naming across expenses
3. **Reduced Errors**: Less chance of typos or different spellings
4. **Better UX**: Modern autocomplete interface users expect

## Implementation Date
Added: October 21, 2025

## Related Files
- `frontend/src/components/ProjectDetail.jsx` - Main component with autocomplete logic
