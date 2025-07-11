# Link Button Extension - Quick Create Relationship Update

## Overview
This update adds the ability to specify a custom relationship name when using the Quick Create mode in the Link Button extension. Previously, the extension assumed the relationship name always followed the pattern `entityType.toLowerCase() + 'Id'`, which was not always correct.

## Bug Fixes
- Fixed button display issues where buttons were showing as text fields
- Ensured proper template loading for all view modes (detail, list, edit)
- Added default values for style and buttonSize to prevent empty button rendering

## Changes Made

### 1. Added New Field Parameter
- Added `relationshipName` parameter to the field metadata (`link-button.json`)
- This field is only visible when "quickCreate" mode is selected
- Includes a tooltip explaining its purpose

### 2. Created Conditional View
- Created `relationship-name.js` view that extends varchar field
- Shows/hides the relationship name field based on the selected mode
- Located at: `files/client/custom/modules/link-button/src/views/admin/field-manager/fields/relationship-name.js`

### 3. Updated Quick Create Logic
- Modified `actionQuickCreate()` function in `link-button.js`
- Now checks for the `relationshipName` parameter
- If specified, uses the custom relationship name to link records
- If not specified, falls back to the original behavior (using entity type in lowercase)

### 4. Updated Language Files
- Added label "Relationship Name" in `Admin.json`
- Added tooltip in `FieldManager.json` explaining the field's purpose

## Usage

1. When creating or editing a Link Button field:
   - Select "Quick Create" as the mode
   - A new field "Relationship Name" will appear
   - Enter the exact relationship name (e.g., "account", "contact", "parentAccount")
   - If left empty, the system will use the default pattern (entityType.toLowerCase())

2. The relationship will be properly established when creating new records through the Quick Create modal

## Example

If you have a custom relationship where Opportunities are linked to Accounts via a relationship named "primaryAccount" instead of just "account":
- Set Mode: Quick Create
- Set Relationship Name: primaryAccount
- The new record will be linked using `primaryAccountId` and `primaryAccountName`

## Backward Compatibility
This update maintains full backward compatibility. Existing Link Button fields will continue to work as before, using the default entity-based relationship naming pattern.
