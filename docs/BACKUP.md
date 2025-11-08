# Backup and Data Synchronization

This document describes the backup and data synchronization features implemented in the Water Tracker Hydration app.

## Overview

The backup system provides comprehensive data protection features to minimize the risk of data loss. Users can export their data in multiple formats, import data from backups, and benefit from automatic daily backups.

## Features

### 1. Automatic Backups

- **Daily Backups**: The app automatically creates a backup every time it starts (once per day)
- **Backup Retention**: Keeps the last 7 daily backups automatically
- **Storage**: Backups are stored locally using AsyncStorage with the key pattern `autoBackup_YYYY-MM-DD`
- **Data Included**: All app data (water history, settings, gamification progress, onboarding status)

### 2. Manual Export

Users can manually export their data in two formats:

#### JSON Export
- **What it includes**: Complete backup of all app data
  - Water intake history
  - User settings (glass capacity, daily water requirement, day hours, language)
  - Gamification data (achievements, notifications)
  - Onboarding status
- **File format**: JSON with pretty printing (2-space indentation)
- **File name**: `hydration_backup_YYYY-MM-DD.json`
- **Version**: Includes backup version number for compatibility

#### CSV Export
- **What it includes**: Water intake history only
- **File format**: CSV with headers
- **Columns**: Date, Water (ml)
- **File name**: `hydration_data_YYYY-MM-DD.csv`
- **Use case**: Easy import into spreadsheet applications for analysis

### 3. Import / Restore

#### JSON Import
- **Purpose**: Full data restoration from a backup file
- **Data merging**: Imports all data, replacing existing data with backup data
- **Validation**: Checks backup version and data structure
- **Auto-reload**: Automatically reloads all stores after successful import

#### CSV Import
- **Purpose**: Import or restore water intake history
- **Data merging**: Merges imported data with existing data (doesn't delete current data)
- **Validation**: 
  - Validates date format (YYYY-MM-DD)
  - Sanitizes numeric values to ensure non-negative numbers
  - Skips invalid entries
- **Auto-reload**: Automatically reloads water store after successful import

## User Interface

The backup features are accessible from the **Setup** screen (⚙️ tab):

### Buttons Available:
1. **Export Data (JSON)** - Creates and shares a complete backup file
2. **Export Data (CSV)** - Exports water history as CSV
3. **Import Data (JSON)** - Restores all data from a backup file
4. **Import Data (CSV)** - Imports water history from CSV

### User Feedback:
- Success/error alerts after each operation
- Loading states (buttons disabled during processing)
- Proper error logging for troubleshooting

## Technical Implementation

### File Sharing
- Uses `expo-sharing` for iOS/Android native share dialog
- Users can save to Files app, send via messaging, or share to cloud storage

### File Picking
- Uses `expo-document-picker` for file selection
- Supports JSON and CSV file types
- Copies files to cache for processing

### Data Validation
- **Date format**: YYYY-MM-DD regex validation
- **Numeric values**: Uses `sanitizeNonNegativeNumber` utility
- **Data structure**: Validates backup version and required fields
- **Type safety**: Full TypeScript support with proper types

### Error Handling
- All operations wrapped in try-catch blocks
- Errors logged using the app's error logging utility
- User-friendly error messages displayed
- Graceful degradation on failures

## Data Format Examples

### JSON Backup Format
```json
{
  "waterData": {
    "2025-01-15": { "water": "2000" },
    "2025-01-16": { "water": "1800" }
  },
  "setupData": {
    "glassCapacity": "250",
    "minimumWater": "2000",
    "day": {
      "startHour": "08:00",
      "endHour": "23:00"
    },
    "dateFormat": "DD/MM/YYYY",
    "languageCode": "en"
  },
  "gamificationData": {
    "achievements": [...],
    "notifications": [...]
  },
  "onboardingData": {
    "status": "completed"
  },
  "exportDate": "2025-01-17T10:30:00.000Z",
  "version": "1.0.0"
}
```

### CSV Export Format
```csv
Date,Water (ml)
2025-01-15,2000
2025-01-16,1800
2025-01-17,2200
```

## Best Practices

### For Users:
1. **Regular Exports**: Export your data regularly, especially before major updates
2. **Safe Storage**: Store backup files in a safe location (cloud storage recommended)
3. **Verify Imports**: Check data after importing to ensure accuracy
4. **Keep CSV Clean**: When editing CSV files, maintain the date format and use only numbers for water amounts

### For Developers:
1. **Version Compatibility**: Always check backup version before restoring
2. **Data Validation**: Validate all imported data before storing
3. **Error Logging**: Log all errors with context for debugging
4. **User Feedback**: Provide clear success/error messages
5. **Data Merging**: Merge rather than replace when possible to prevent data loss

## Limitations

1. **Automatic Backups**: Only kept for 7 days
2. **File Format**: JSON and CSV only (no cloud sync)
3. **Manual Process**: Users must manually share/store export files
4. **No Versioning**: Imported data replaces existing data (JSON) or merges (CSV)
5. **Local Only**: No built-in cloud storage integration

## Future Enhancements

Potential improvements for future versions:
- Cloud storage integration (Google Drive, iCloud)
- Scheduled automatic exports
- Backup encryption
- Incremental backups
- Backup history management UI
- Import preview before confirming
- Conflict resolution for merged data

## Troubleshooting

### Export Issues
- **Problem**: Export fails
- **Solution**: Check app permissions for file access and storage

### Import Issues
- **Problem**: Import fails silently
- **Solution**: Check file format matches expected structure (JSON/CSV)
- **Problem**: CSV import shows no data
- **Solution**: Verify date format is YYYY-MM-DD and amounts are numeric

### Data Not Updated After Import
- **Problem**: Data doesn't show after import
- **Solution**: Restart the app to reload all stores

## References

- [Expo FileSystem Documentation](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [Expo Sharing Documentation](https://docs.expo.dev/versions/latest/sdk/sharing/)
- [Expo DocumentPicker Documentation](https://docs.expo.dev/versions/latest/sdk/document-picker/)
