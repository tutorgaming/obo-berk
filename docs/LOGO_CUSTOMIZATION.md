# Logo Customization Guide

## Quick Start

The OBO-Berk application now supports displaying your company logo in the header beside the title.

## How to Add Your Logo

### Option 1: Replace the Placeholder Logo
1. Prepare your logo image (PNG, JPG, or SVG format)
2. Name it exactly as one of these:
   - `logo.png`
   - `logo.jpg`
   - `logo.svg`
3. Place it in the `/frontend/src/assets/` directory
4. Restart your development server or rebuild the Docker container

### Option 2: Use the Placeholder
A sample SVG logo is already included at `/frontend/src/assets/logo.svg`. You can:
- Use it as-is for testing
- Edit it to customize colors/text
- Replace it with your actual logo

## Logo Specifications

### Recommended Dimensions
- **Height**: 40-60 pixels (will be displayed at 48px height)
- **Width**: Automatic based on aspect ratio
- **Aspect Ratio**: Square (1:1) or horizontal (up to 3:1)

### File Formats
- **SVG** (Recommended) - Scales perfectly, small file size
- **PNG** - Supports transparency, good quality
- **JPG** - Solid background only

### File Size
- Keep under 100KB for optimal loading speed
- SVG files are typically very small (1-10KB)

## Technical Details

### Auto-Detection
The application automatically:
1. Tries to load `logo.png`
2. Falls back to `logo.jpg` if PNG not found
3. Falls back to `logo.svg` if JPG not found
4. Displays heading only if no logo is found

### Error Handling
- If the logo file fails to load, it will automatically hide
- The header will gracefully display without the logo
- No error messages shown to users

### Styling
The logo is displayed with:
- Fixed height of 48px (3rem)
- Auto width maintaining aspect ratio
- Object-fit: contain (prevents distortion)
- Smooth opacity transition on hover

## Examples

### Creating a Simple SVG Logo
You can edit the existing `logo.svg` file or create a new one:

```svg
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="22" fill="#FFFFFF" stroke="#3B82F6" stroke-width="2"/>
  <text x="24" y="30" font-family="Arial" font-size="20" font-weight="bold"
        fill="#3B82F6" text-anchor="middle">
    OBO
  </text>
</svg>
```

### Converting Your Logo
If you have a logo in other formats:
- Use online converters like CloudConvert or Convertio
- Use image editing software (Photoshop, GIMP, Inkscape)
- Ensure transparency is preserved (for PNG/SVG)

## Troubleshooting

### Logo Not Showing?
1. **Check file name**: Must be exactly `logo.png`, `logo.jpg`, or `logo.svg`
2. **Check location**: Must be in `/frontend/src/assets/` directory
3. **Restart server**: Run `npm run dev` again or rebuild Docker
4. **Check browser console**: Look for any loading errors
5. **Clear cache**: Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

### Logo Looks Distorted?
- Check your original image aspect ratio
- Recommended: Use square or horizontal logos
- Avoid very tall/vertical logos

### Logo Too Small/Large?
Edit the height in `/frontend/src/App.jsx`:
```jsx
className="h-12 w-auto object-contain"  // Change h-12 to h-16 for larger
```

## Need Help?

If you need to customize the logo display further:
- Edit `/frontend/src/App.jsx`
- Look for the `<img>` tag with `alt="OBO Logo"`
- Modify className properties for different sizing/spacing

## Version
Added in: Unreleased (November 2025)
