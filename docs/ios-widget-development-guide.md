# iOS Widget Development Guide for React Native/Expo Projects

A comprehensive guide to building iOS WidgetKit widgets in React Native/Expo projects using Swift and the `@bittingz/expo-widgets` plugin.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Configuration Setup](#configuration-setup)
5. [Native Module Bridge](#native-module-bridge)
6. [Data Sharing Architecture](#data-sharing-architecture)
7. [Deep Link Integration](#deep-link-integration)
8. [Widget UI Implementation](#widget-ui-implementation)
9. [Common Errors & Solutions](#common-errors--solutions)
10. [Testing Strategies](#testing-strategies)
11. [Implementation Checklist](#implementation-checklist)

---

## Introduction

### What are iOS WidgetKit Widgets?

WidgetKit widgets are glanceable, read-only views that appear on the iOS Home Screen, Lock Screen, and Today View. They provide users with timely, relevant information from your app without requiring them to open it.

### Why Use Widgets in React Native/Expo Apps?

- **User Engagement**: Keep users connected to your app's core functionality
- **Quick Actions**: Enable one-tap interactions via deep links
- **At-a-Glance Information**: Display key data without app launches
- **Platform Parity**: Match native iOS app capabilities

### Placeholder Naming Convention

This guide uses generic placeholder names. Replace them with your project-specific values:

| Placeholder | Purpose | Example |
|-------------|---------|---------|
| `YourAppName` | Main app name | MyAwesomeApp |
| `YourWidget` | Widget name | StatusWidget |
| `your.bundle.id` | Bundle identifier | com.example.myapp |
| `group.your.bundle.id.widgets` | App Group ID | group.com.example.myapp.widgets |
| `yourscheme://` | Deep link scheme | myapp:// |

---

## Prerequisites

Before starting, ensure you have:

- **Expo SDK 50+** (with prebuild/bare workflow support)
- **iOS 14+** target (WidgetKit minimum requirement)
- **Apple Developer Account** (for App Groups capability)
- **Xcode 14+** installed
- **CocoaPods** for iOS dependency management

---

## Project Structure

```
your-project/
├── widgets/
│   └── ios/
│       ├── Module.swift              # Native module bridge (Expo Modules)
│       └── YourWidget.swift          # Widget UI implementation
├── services/
│   └── widgetService.ts              # Sync orchestration
├── utils/
│   └── sharedData.ts                 # Native bridge interface
├── app/
│   └── _layout.tsx                   # Deep link handling (Expo Router)
├── app.json                          # Expo config with plugin settings
└── ios/                              # Generated after prebuild
    ├── YourAppName/
    │   ├── AppDelegate.swift
    │   └── YourAppName.entitlements
    └── YourAppNameWidgetExtension/
        ├── YourWidget.swift
        └── YourAppNameWidgetExtension.entitlements
```

---

## Configuration Setup

### app.json Plugin Configuration

Add the `@bittingz/expo-widgets` plugin to your `app.json`:

```json
{
  "expo": {
    "name": "YourAppName",
    "slug": "your-app-slug",
    "scheme": "yourscheme",
    "ios": {
      "bundleIdentifier": "your.bundle.id"
    },
    "plugins": [
      [
        "@bittingz/expo-widgets",
        {
          "ios": {
            "src": "./widgets/ios",
            "devTeamId": "YOUR_APPLE_TEAM_ID",
            "mode": "production",
            "entitlements": {
              "com.apple.security.application-groups": [
                "group.your.bundle.id.widgets"
              ]
            },
            "xcode": {
              "configOverrides": {
                "SWIFT_VERSION": "5.0"
              }
            }
          }
        }
      ]
    ]
  }
}
```

#### Configuration Options Explained

| Option | Description |
|--------|-------------|
| `src` | Path to your widget Swift source files |
| `devTeamId` | Your Apple Developer Team ID (find in Apple Developer Portal) |
| `mode` | Build mode: `"production"` or `"development"` |
| `entitlements` | Capabilities to add, including App Groups |
| `xcode.configOverrides` | Override Xcode build settings (e.g., Swift version) |

### Swift Version Alignment

**Critical**: All targets (main app and widget extension) must use the same Swift version. The plugin may default to a different version than your project uses. Override with:

```json
"xcode": {
  "configOverrides": {
    "SWIFT_VERSION": "5.0"
  }
}
```

### Entitlements

Both the main app and widget extension need matching App Groups entitlements. The plugin handles this automatically based on your `app.json` configuration.

Example entitlements file (`YourAppName.entitlements`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.your.bundle.id.widgets</string>
    </array>
</dict>
</plist>
```

---

## Native Module Bridge

The native module bridges Swift and JavaScript, enabling the React Native app to communicate with the widget.

### Module.swift - The Critical File

Create `widgets/ios/Module.swift`:

```swift
import ExpoModulesCore
import WidgetKit

public class ExpoWidgetsModule: Module {
    let suiteName = "group.your.bundle.id.widgets"

    public func definition() -> ModuleDefinition {
        Name("YourWidgetName")

        // Update widget data in shared UserDefaults
        Function("updateWidgetData") { (data: [String: Any]) -> Void in
            guard let userDefaults = UserDefaults(suiteName: self.suiteName) else {
                return
            }

            userDefaults.set(data["value"] as? Int ?? 0, forKey: "value")
            userDefaults.set(data["goal"] as? Int ?? 100, forKey: "goal")
            userDefaults.set(data["percentage"] as? Double ?? 0, forKey: "percentage")
            userDefaults.set(data["lastUpdated"] as? String ?? "", forKey: "lastUpdated")
            userDefaults.set(data["dateKey"] as? String ?? "", forKey: "dateKey")

            userDefaults.synchronize()
        }

        // Read widget data from shared UserDefaults
        Function("readWidgetData") { () -> [String: Any]? in
            guard let userDefaults = UserDefaults(suiteName: self.suiteName) else {
                return nil
            }

            return [
                "value": userDefaults.integer(forKey: "value"),
                "goal": userDefaults.integer(forKey: "goal"),
                "percentage": userDefaults.double(forKey: "percentage"),
                "lastUpdated": userDefaults.string(forKey: "lastUpdated") ?? "",
                "dateKey": userDefaults.string(forKey: "dateKey") ?? ""
            ]
        }

        // Reload all widget timelines
        Function("reloadWidget") { () -> Void in
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }
}
```

### Class Naming Rule (Critical)

**The class name MUST be `ExpoWidgetsModule`** for the `@bittingz/expo-widgets` plugin to find it. The plugin's `expo-module.config.json` expects this exact class name.

However, the `Name("YourWidgetName")` declaration can be anything - this is how JavaScript will reference the module:

```typescript
// JavaScript side
const YourWidgetModule = NativeModules.YourWidgetName;
```

| Component | Value | Purpose |
|-----------|-------|---------|
| Swift class name | `ExpoWidgetsModule` | **Must be exact** - plugin requirement |
| `Name()` parameter | `"YourWidgetName"` | JavaScript module reference |
| Suite name | `"group.your.bundle.id.widgets"` | App Group ID for data sharing |

### Function Definitions

| Function | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `updateWidgetData` | Write data to shared storage | Dictionary of values | Void |
| `readWidgetData` | Read data from shared storage | None | Dictionary or nil |
| `reloadWidget` | Trigger widget timeline refresh | None | Void |

---

## Data Sharing Architecture

### Overview

Data flows between the React Native app and iOS widget through App Groups and UserDefaults:

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Native   │  ────>  │   App Groups     │  ────>  │  iOS Widget     │
│      App        │  <────  │  (UserDefaults)  │  <────  │  Extension      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### TypeScript Interface

Create `utils/sharedData.ts`:

```typescript
import { Platform, NativeModules } from "react-native";

// App Group identifier - MUST match app.json and Module.swift
export const APP_GROUP_ID = "group.your.bundle.id.widgets";

// Widget data interface
export interface WidgetData {
  value: number;
  goal: number;
  percentage: number;
  lastUpdated: string;
  dateKey: string;
}

// Default values
export const DEFAULT_WIDGET_DATA: WidgetData = {
  value: 0,
  goal: 100,
  percentage: 0,
  lastUpdated: new Date().toISOString(),
  dateKey: "",
};

/**
 * Write widget data to shared storage
 */
export async function writeWidgetData(data: WidgetData): Promise<boolean> {
  try {
    const WidgetModule = NativeModules.YourWidgetName;

    if (!WidgetModule) {
      console.warn("Widget native module not available");
      return false;
    }

    if (Platform.OS === "ios") {
      await WidgetModule.updateWidgetData({
        value: data.value,
        goal: data.goal,
        percentage: data.percentage,
        lastUpdated: data.lastUpdated,
        dateKey: data.dateKey,
      });
    }

    return true;
  } catch (error) {
    console.error("writeWidgetData error:", error);
    return false;
  }
}

/**
 * Read widget data from shared storage
 */
export async function readWidgetData(): Promise<WidgetData | null> {
  try {
    const WidgetModule = NativeModules.YourWidgetName;

    if (!WidgetModule) {
      console.warn("Widget native module not available");
      return null;
    }

    if (Platform.OS === "ios") {
      const data = await WidgetModule.readWidgetData();
      if (data) {
        return {
          value: data.value || 0,
          goal: data.goal || 100,
          percentage: data.percentage || 0,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          dateKey: data.dateKey || "",
        };
      }
    }

    return null;
  } catch (error) {
    console.error("readWidgetData error:", error);
    return null;
  }
}

/**
 * Request widget refresh
 */
export async function refreshWidget(): Promise<boolean> {
  try {
    const WidgetModule = NativeModules.YourWidgetName;

    if (!WidgetModule) {
      console.warn("Widget native module not available");
      return false;
    }

    if (Platform.OS === "ios") {
      await WidgetModule.reloadWidget();
    }

    return true;
  } catch (error) {
    console.error("refreshWidget error:", error);
    return false;
  }
}
```

### Widget Service

Create `services/widgetService.ts` to orchestrate sync:

```typescript
import { writeWidgetData, readWidgetData, refreshWidget, WidgetData } from "@/utils/sharedData";

/**
 * Sync current app state to widget
 */
export async function syncToWidget(): Promise<void> {
  try {
    // Get data from your app stores
    const widgetData: WidgetData = {
      value: getCurrentValue(),      // Your app's current value
      goal: getGoal(),               // Your app's goal
      percentage: calculatePercentage(),
      lastUpdated: new Date().toISOString(),
      dateKey: getTodayKey(),
    };

    const success = await writeWidgetData(widgetData);
    if (success) {
      await refreshWidget();
    }
  } catch (error) {
    console.error("syncToWidget error:", error);
  }
}

/**
 * Sync widget changes back to app
 */
export async function syncFromWidget(): Promise<boolean> {
  try {
    const widgetData = await readWidgetData();
    if (!widgetData || widgetData.dateKey !== getTodayKey()) {
      return false;
    }

    const currentValue = getCurrentValue();
    if (widgetData.value > currentValue) {
      // User added data via widget - update app state
      await updateAppState(widgetData.value);
      return true;
    }

    return false;
  } catch (error) {
    console.error("syncFromWidget error:", error);
    return false;
  }
}

/**
 * Handle widget deep link action
 */
export async function handleWidgetAction(amount: number): Promise<void> {
  try {
    if (amount <= 0 || amount > 10000) {
      console.error("Invalid amount from widget");
      return;
    }

    const currentValue = getCurrentValue();
    const newValue = currentValue + amount;
    await updateAppState(newValue);
    await syncToWidget();
  } catch (error) {
    console.error("handleWidgetAction error:", error);
  }
}

/**
 * Initialize widget on app start
 */
export async function initializeWidgetData(): Promise<void> {
  try {
    await syncFromWidget();
    await syncToWidget();
  } catch (error) {
    console.error("initializeWidgetData error:", error);
  }
}
```

---

## Deep Link Integration

Deep links enable widget actions (like tapping a button) to trigger app functionality.

### URL Scheme Registration

Configure in `app.json`:

```json
{
  "expo": {
    "scheme": "yourscheme"
  }
}
```

### Deep Link Format

```
yourscheme://?action=add&amount=50
```

### React Native Handler (Expo Router)

In your root layout (`app/_layout.tsx`):

```typescript
import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import { AppState } from "react-native";
import {
  initializeWidgetData,
  handleWidgetAction,
  syncFromWidget,
} from "@/services/widgetService";

export default function RootLayout() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Handle app state changes
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // Sync widget changes when app comes to foreground
        syncFromWidget();
      }
      appState.current = nextAppState;
    });

    // Deep link handler
    const handleDeepLink = async (event: { url: string }) => {
      console.log("[DeepLink] Received URL:", event.url);
      const parsed = Linking.parse(event.url);
      const { queryParams } = parsed;

      if (queryParams?.action === "add" && queryParams?.amount) {
        const amount = parseInt(queryParams.amount as string, 10);
        if (!isNaN(amount) && amount > 0) {
          await handleWidgetAction(amount);
        }
      }
    };

    // Listen for deep links while app is running
    const linkingSubscription = Linking.addEventListener("url", handleDeepLink);

    // Initialize app
    const initializeApp = async () => {
      // Load stores first
      await loadAppStores();

      // Initialize widget after stores are ready
      await initializeWidgetData();

      // Handle deep link that opened the app
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleDeepLink({ url: initialUrl });
      }
    };

    initializeApp();

    return () => {
      subscription.remove();
      linkingSubscription.remove();
    };
  }, []);

  // ... rest of layout
}
```

### Widget Action URL in SwiftUI

In your widget view, use `Link` for interactive elements:

```swift
Link(destination: URL(string: "yourscheme://?action=add&amount=50")!) {
    VStack {
        Image(systemName: "plus")
        Text("+50")
    }
}
```

---

## Widget UI Implementation

### YourWidget.swift

Create `widgets/ios/YourWidget.swift`:

```swift
import WidgetKit
import SwiftUI

// MARK: - Timeline Entry
struct YourEntry: TimelineEntry {
    let date: Date
    let value: Int
    let goal: Int
    let percentage: Double
}

// MARK: - Timeline Provider
struct YourProvider: TimelineProvider {
    let suiteName = "group.your.bundle.id.widgets"

    func placeholder(in context: Context) -> YourEntry {
        YourEntry(
            date: Date(),
            value: 50,
            goal: 100,
            percentage: 50
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (YourEntry) -> Void) {
        completion(readData())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<YourEntry>) -> Void) {
        let entry = readData()
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func readData() -> YourEntry {
        let userDefaults = UserDefaults(suiteName: suiteName)

        let goal = userDefaults?.integer(forKey: "goal") ?? 0

        return YourEntry(
            date: Date(),
            value: userDefaults?.integer(forKey: "value") ?? 0,
            goal: goal > 0 ? goal : 100,
            percentage: userDefaults?.double(forKey: "percentage") ?? 0
        )
    }
}

// MARK: - Small Widget View
struct SmallWidgetView: View {
    var entry: YourEntry

    var body: some View {
        VStack(spacing: 6) {
            ZStack {
                Circle()
                    .stroke(Color.blue.opacity(0.2), lineWidth: 6)
                    .frame(width: 50, height: 50)
                Circle()
                    .trim(from: 0, to: min(CGFloat(entry.percentage / 100), 1.0))
                    .stroke(Color.blue, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .frame(width: 50, height: 50)
                    .rotationEffect(.degrees(-90))

                Image(systemName: "star.fill")
                    .foregroundColor(.blue)
                    .font(.system(size: 16))
            }

            Text("\(entry.value)")
                .font(.system(size: 14, weight: .bold))

            Text("\(Int(entry.percentage))%")
                .font(.system(size: 12))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(8)
    }
}

// MARK: - Medium Widget View
struct MediumWidgetView: View {
    var entry: YourEntry

    var body: some View {
        HStack(spacing: 16) {
            // Left: Progress
            SmallWidgetView(entry: entry)

            // Right: Quick Action
            Link(destination: URL(string: "yourscheme://?action=add&amount=10")!) {
                VStack(spacing: 4) {
                    ZStack {
                        Circle()
                            .fill(Color.blue.opacity(0.15))
                            .frame(width: 44, height: 44)

                        Image(systemName: "plus")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundColor(.blue)
                    }
                    Text("+10")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.blue)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(16)
    }
}

// MARK: - Widget Entry View
struct YourWidgetEntryView: View {
    var entry: YourEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Widget Configuration
struct YourWidget: Widget {
    let kind: String = "YourWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: YourProvider()) { entry in
            if #available(iOS 17.0, *) {
                YourWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                YourWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("Your Widget")
        .description("Track your progress")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Widget Bundle
@main
struct YourWidgetBundle: WidgetBundle {
    var body: some Widget {
        YourWidget()
    }
}

// MARK: - Preview
#if DEBUG
struct YourWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            YourWidgetEntryView(entry: YourEntry(
                date: Date(),
                value: 50,
                goal: 100,
                percentage: 50
            ))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            .previewDisplayName("Small")

            YourWidgetEntryView(entry: YourEntry(
                date: Date(),
                value: 50,
                goal: 100,
                percentage: 50
            ))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
            .previewDisplayName("Medium")
        }
    }
}
#endif
```

### Timeline Provider Best Practices

| Method | Purpose | Recommendation |
|--------|---------|----------------|
| `placeholder` | Design preview in widget gallery | Use representative sample data |
| `getSnapshot` | Quick display when adding widget | Return current data immediately |
| `getTimeline` | Actual widget display | Fetch data, set refresh policy |

### Refresh Policy Options

| Policy | Use Case |
|--------|----------|
| `.after(date)` | Periodic updates (every 15-30 minutes typical) |
| `.atEnd` | Refresh when timeline entries exhausted |
| `.never` | No automatic refresh (app-triggered only) |

---

## Common Errors & Solutions

### Build Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ExpoWidgetsModule` not found | Swift class name doesn't match plugin expectations | **Use exactly `ExpoWidgetsModule` as class name** |
| Swift version mismatch | Plugin hardcodes different Swift version | Add `xcode.configOverrides.SWIFT_VERSION` to app.json |
| App Group access fails | Inconsistent App Group IDs | Verify same ID in app.json, Module.swift, and widget Swift files |
| Symbol not found | Missing framework linkage | Ensure WidgetKit framework is linked in Xcode |

### Runtime Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Native module undefined | Module not properly registered | Rebuild with `npx expo prebuild --clean` |
| Deep link not received | Missing URL scheme | Configure `scheme` in app.json and run prebuild |
| Widget shows stale data | Timeline not refreshing | Call `WidgetCenter.shared.reloadAllTimelines()` after data changes |
| UserDefaults returns nil | App Group not configured correctly | Check entitlements in both app and extension |

### Debugging Tips

1. **Check Xcode Console**: Filter by your widget extension name
2. **Verify App Groups**: In Xcode, check both targets have matching App Group capabilities
3. **Test UserDefaults**: Add logging in `readData()` to verify values
4. **Simulator vs Device**: Some widget behaviors differ; test on device for accuracy

---

## Testing Strategies

### Mocking Native Modules

```typescript
// In your test file
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  NativeModules: {
    YourWidgetName: {
      updateWidgetData: jest.fn().mockResolvedValue(undefined),
      readWidgetData: jest.fn().mockResolvedValue(null),
      reloadWidget: jest.fn().mockResolvedValue(undefined),
    },
  },
}));
```

### Widget Service Unit Tests

```typescript
import { writeWidgetData, readWidgetData, refreshWidget } from '@/utils/sharedData';

jest.mock('@/utils/sharedData');

describe('widgetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (writeWidgetData as jest.Mock).mockResolvedValue(true);
    (refreshWidget as jest.Mock).mockResolvedValue(true);
  });

  it('should sync data to widget', async () => {
    await syncToWidget();

    expect(writeWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({
        value: expect.any(Number),
        goal: expect.any(Number),
      })
    );
    expect(refreshWidget).toHaveBeenCalled();
  });

  it('should not refresh when write fails', async () => {
    (writeWidgetData as jest.Mock).mockResolvedValue(false);

    await syncToWidget();

    expect(refreshWidget).not.toHaveBeenCalled();
  });
});
```

### Integration Testing Approach

1. **Mock Native Module**: Use Jest mocks for `NativeModules`
2. **Test Data Flow**: Verify data transformations between app and widget format
3. **Test Error Handling**: Ensure graceful degradation when native module unavailable
4. **Test Deep Links**: Mock `expo-linking` and verify action handlers

---

## Implementation Checklist

### Pre-Implementation

- [ ] Verify Expo SDK version is 50+
- [ ] Install `@bittingz/expo-widgets` package
- [ ] Obtain Apple Developer Team ID
- [ ] Decide on App Group ID naming convention

### Configuration

- [ ] Configure `app.json` with widget plugin settings
- [ ] Set matching Swift version in `xcode.configOverrides`
- [ ] Define App Group ID in entitlements configuration
- [ ] Configure URL scheme for deep links

### Native Module

- [ ] Create `widgets/ios/Module.swift`
- [ ] **Use `ExpoWidgetsModule` as class name** (critical)
- [ ] Set `Name()` to desired JavaScript module name
- [ ] Implement `updateWidgetData` function
- [ ] Implement `readWidgetData` function
- [ ] Implement `reloadWidget` function
- [ ] Verify `suiteName` matches App Group ID

### Widget UI

- [ ] Create `widgets/ios/YourWidget.swift`
- [ ] Implement `TimelineEntry` struct
- [ ] Implement `TimelineProvider`
- [ ] Create widget views for supported sizes
- [ ] Add `@main` WidgetBundle
- [ ] Set `suiteName` matching App Group ID

### JavaScript Integration

- [ ] Create `utils/sharedData.ts` with native bridge functions
- [ ] Create `services/widgetService.ts` for sync orchestration
- [ ] Handle module unavailable gracefully
- [ ] Add deep link handler in root layout

### Build & Test

- [ ] Run `npm install`
- [ ] Run `npx expo prebuild --clean`
- [ ] Run `cd ios && pod install`
- [ ] Build and run on iOS simulator or device
- [ ] Verify widget appears in widget gallery
- [ ] Test data sync from app to widget
- [ ] Test deep link actions from widget
- [ ] Test foreground/background transitions

### Deployment

- [ ] Test on physical device
- [ ] Verify App Store Connect configuration
- [ ] Check entitlements in distribution profile
- [ ] Test TestFlight build

---

## Additional Resources

- [Apple WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [App Groups Documentation](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups)
- [@bittingz/expo-widgets Package](https://www.npmjs.com/package/@bittingz/expo-widgets)
