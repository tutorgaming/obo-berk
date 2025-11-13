# OCR Receipt Auto-fill Feature

## Overview

The OCR (Optical Character Recognition) feature allows users to automatically extract information from receipt images and auto-fill the expense form fields. This feature integrates with an n8n workflow for image processing.

## Features

- 📸 Upload receipt images directly from the expense form
- 🤖 Automatic extraction of shop name, amount, date, and details
- ✨ Smart auto-fill of form fields with extracted data
- ⚡ Easy enable/disable toggle
- 🎨 Beautiful UI with loading states

## Configuration

### Enable/Disable the Feature

In `/frontend/src/components/ProjectDetail.jsx`, find:

```javascript
const ENABLE_OCR_FEATURE = true; // Set to false to disable OCR button
```

Set to `false` to hide the OCR upload button completely.

### Configure n8n API Endpoint

Update the API URL to point to your n8n webhook:

```javascript
const N8N_OCR_API_URL = 'https://your-n8n-instance.com/webhook/ocr-receipt';
```

## How It Works

### User Flow

1. User clicks "Add Expense" to open the form
2. An OCR upload button appears at the top of the form
3. User clicks "📸 Upload Receipt for OCR"
4. User selects a receipt image from their device
5. Image is uploaded to n8n API for processing
6. Extracted data automatically fills the form fields
7. User can review and adjust the auto-filled data
8. User submits the expense as normal

### Technical Flow

```
User Upload → n8n Webhook → OCR Processing → JSON Response → Auto-fill Form
```

## Expected API Response Format

Your n8n workflow should return JSON in this format:

```json
{
  "shop_name": "7-Eleven",
  "amount": "150.50",
  "date": "2025-11-13",
  "detail": "Snacks and drinks",
  "type": "eating"
}
```

### Response Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `shop_name` | string | No | Name of the store/shop |
| `amount` | string/number | No | Total amount from receipt |
| `date` | string | No | Date in YYYY-MM-DD format |
| `detail` | string | No | Description of items purchased |
| `type` | string | No | Expense type (eating, traveling, accommodation, equipment, other) |

**Note:** All fields are optional. The form will only update fields that are present in the response.

## Setting Up n8n Workflow

### Basic Workflow Structure

1. **Webhook Node** - Receives image upload
2. **OCR Service** - Process image (Google Vision API, Tesseract, etc.)
3. **Data Extraction** - Parse OCR text to extract relevant fields
4. **Response Node** - Return JSON data

### Example n8n Workflow

```
[Webhook] → [HTTP Request to OCR API] → [Function: Parse Text] → [Respond to Webhook]
```

### Recommended OCR Services

- **Google Cloud Vision API** - High accuracy, paid
- **Tesseract OCR** - Open source, free
- **AWS Textract** - Good for receipts, paid
- **Azure Computer Vision** - Microsoft's solution, paid

## Implementation Details

### Current Status

✅ UI component implemented
✅ File upload handling
✅ Auto-fill logic
✅ Loading states
✅ Error handling
⏳ API integration (placeholder - needs real n8n endpoint)

### To Complete Integration

1. Set up n8n workflow with OCR processing
2. Update `N8N_OCR_API_URL` with your webhook URL
3. Uncomment the API call code in `handleOCRUpload`:

```javascript
const response = await fetch(N8N_OCR_API_URL, {
  method: 'POST',
  body: formData,
});
const data = await response.json();
```

4. Remove the mock response code
5. Test with real receipt images

## Usage Example

### For Users

1. Start adding a new expense
2. Click the purple "📸 Upload Receipt for OCR" button
3. Select a clear photo of your receipt
4. Wait for processing (usually 2-5 seconds)
5. Review the auto-filled information
6. Make any necessary corrections
7. Submit the expense

### For Developers

```javascript
// The OCR handler automatically:
const handleOCRUpload = async (e) => {
  const file = e.target.files[0];

  // 1. Validates file type
  // 2. Sends to n8n API
  // 3. Receives JSON response
  // 4. Auto-fills form fields
  // 5. Shows success/error messages
};
```

## Troubleshooting

### OCR Button Not Showing

- Check if `ENABLE_OCR_FEATURE` is set to `true`
- Make sure you're adding a new expense (not editing)
- Clear browser cache and reload

### Upload Not Working

- Verify n8n webhook URL is correct
- Check n8n workflow is active
- Look for CORS issues in browser console
- Ensure n8n webhook accepts POST requests

### Inaccurate Results

- Use clearer, higher-resolution images
- Ensure receipt is well-lit and not blurry
- Try different OCR services in n8n
- Fine-tune OCR confidence thresholds

### Form Not Auto-filling

- Check browser console for errors
- Verify API response matches expected format
- Ensure field names match exactly
- Check if date format is YYYY-MM-DD

## Security Considerations

- Images are temporarily uploaded to n8n
- Configure n8n to delete images after processing
- Use HTTPS for n8n webhook
- Consider adding authentication to webhook
- Limit file size (recommended: 5MB max)
- Validate file types on both frontend and backend

## Future Enhancements

- [ ] Support for PDF receipts
- [ ] Batch processing multiple receipts
- [ ] Receipt image cropping before upload
- [ ] Confidence scores for extracted data
- [ ] Manual field selection from OCR results
- [ ] Receipt image storage for reference
- [ ] Multi-language OCR support
- [ ] Receipt validation (check if data makes sense)

## Version

Added in: Unreleased (November 2025)

## Related Files

- `/frontend/src/components/ProjectDetail.jsx` - Main component with OCR feature
- n8n workflow (to be created separately)
