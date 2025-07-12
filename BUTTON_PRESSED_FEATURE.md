# Button Pressed Feature

## Overview
The "Button Pressed" mode is a new feature for the EspoCRM Link Button extension that allows buttons to set their field value to "1" and submit the form when pressed. This enables workflow automation based on button clicks.

## How It Works
When a Link Button field is configured with the "Button Pressed" mode:
1. The button appears on the detail view without requiring a URL
2. When clicked, the button sets its field value to "1"
3. The form is automatically saved
4. EspoCRM workflows can detect this field value change and trigger actions

## Use Case Example
**Scenario**: Save as Draft button
1. Create a Link Button field called "saveAsDraft"
2. Set the mode to "Button Pressed"
3. Set the button label to "Save as Draft"
4. Create a workflow that:
   - Triggers when the saveAsDraft field equals "1"
   - Sets the record status to "Draft"
   - Optionally resets the saveAsDraft field back to empty

## Configuration
1. In Entity Manager, add a new Link Button field
2. Set the following parameters:
   - **Mode**: Button Pressed
   - **Button Label**: Your desired button text (e.g., "Save as Draft")
   - **Style**: Choose button appearance (primary, success, etc.)
   - **Button Size**: Select size (small, medium, large)
   - **Icon Left/Right**: Optional icons for the button

## Workflow Integration
To use with workflows:
1. Create a new workflow for your entity
2. Set trigger type to "After record saved"
3. Add condition: `[Your Button Field Name] equals 1`
4. Add desired actions (e.g., update status field)
5. Optionally add action to reset button field to empty

## Technical Details
- The button field value is set to "1" when pressed
- The record is automatically saved after button click
- After saving, the view automatically returns to detail mode (just like the normal Save button)
- No URL validation is required for this mode
- The button is always visible in detail view (doesn't check for field value)

## Files Modified
- `files/custom/Espo/Modules/LinkButton/Resources/metadata/fields/link-button.json` - Added "buttonPressed" to mode options
- `files/client/custom/modules/link-button/src/views/fields/link-button.js` - Added button press handler and validation logic
- `files/client/custom/modules/link-button/res/templates/fields/detail.tpl` - Added button template for new mode
- `files/custom/Espo/Modules/LinkButton/Resources/i18n/en_US/Admin.json` - Added English translation
- `files/custom/Espo/Modules/LinkButton/Resources/i18n/de_DE/Admin.json` - Added German translation
