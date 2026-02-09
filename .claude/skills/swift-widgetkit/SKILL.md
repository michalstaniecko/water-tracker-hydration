---
name: swift-widgetkit
description: Expert Swift guidance for iOS WidgetKit widgets with Expo/React Native integration. Use when writing Swift code for widgets, native modules, or app-widget data sharing.
---

# Swift WidgetKit + Expo Development

Expert guidance for iOS widget development with React Native/Expo integration.

## Code Style Conventions

### Organization
- Use `// MARK: -` comments to section code (Timeline Entry, Provider, Views, Configuration)
- Group related functionality: data structures first, then providers, then views
- Keep widget views in a single file unless complexity requires splitting

### Naming
- PascalCase for types: `HydrationEntry`, `HydrationProvider`, `ProgressRingView`
- camelCase for properties and functions: `todayWater`, `readData()`
- Descriptive names matching data domain (e.g., `glassCapacity` not `capacity`)

### Structure
- Prefer immutable `struct` over `class` for data and views
- Use `let` for constants, `var` only when mutation needed
- Keep functions focused and small

## WidgetKit Patterns

### Timeline Entry
Define a struct conforming to `TimelineEntry` with all display data:
```swift
struct AppEntry: TimelineEntry {
    let date: Date
    let value: Int
    let percentage: Double
}
```

### Timeline Provider
Implement three required methods:
```swift
struct AppProvider: TimelineProvider {
    func placeholder(in context: Context) -> AppEntry {
        // Return sample data for design previews
    }

    func getSnapshot(in context: Context, completion: @escaping (AppEntry) -> Void) {
        // Return current data immediately
        completion(readData())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<AppEntry>) -> Void) {
        let entry = readData()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }
}
```

### Refresh Policy
- Use `.after(date)` for periodic updates (15 minutes typical)
- Call `WidgetCenter.shared.reloadAllTimelines()` when app data changes

## SwiftUI Widget Views

### Widget Family Support
Use `@Environment(\.widgetFamily)` for size-specific layouts:
```swift
struct AppWidgetEntryView: View {
    var entry: AppEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallView(entry: entry)
        case .systemMedium:
            MediumView(entry: entry)
        default:
            SmallView(entry: entry)
        }
    }
}
```

### iOS Version Compatibility
Handle iOS 17+ container backgrounds:
```swift
if #available(iOS 17.0, *) {
    EntryView(entry: entry)
        .containerBackground(.fill.tertiary, for: .widget)
} else {
    EntryView(entry: entry)
        .padding()
        .background()
}
```

### Interactive Elements
Use `Link` for deep linking actions:
```swift
Link(destination: URL(string: "myapp://?action=add&value=\(entry.value)")!) {
    // Button content
}
```

## Expo Native Module Integration

### Module Definition
```swift
import ExpoModulesCore
import WidgetKit

public class AppWidgetModule: Module {
    let suiteName = "group.com.example.app"

    /// Safely converts a JS bridge value to Int.
    /// JavaScript numbers arrive as Double via Expo Modules Core;
    /// `Double as? Int` always returns nil in Swift.
    private func toInt(_ value: Any?, defaultValue: Int = 0) -> Int {
        if let intVal = value as? Int { return intVal }
        if let doubleVal = value as? Double { return Int(doubleVal) }
        if let nsNum = value as? NSNumber { return nsNum.intValue }
        return defaultValue
    }

    public func definition() -> ModuleDefinition {
        Name("AppWidget")

        Function("updateWidgetData") { (data: [String: Any]) -> Void in
            guard let userDefaults = UserDefaults(suiteName: self.suiteName) else { return }
            userDefaults.set(self.toInt(data["value"]), forKey: "value")
            userDefaults.set(data["percentage"] as? Double ?? 0, forKey: "percentage")
            userDefaults.synchronize()
        }

        Function("reloadWidget") { () -> Void in
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }
}
```

### Key Points
- Use `[String: Any]` for dictionary data from JavaScript
- Call `userDefaults.synchronize()` to ensure immediate persistence
- Wrap iOS 14+ APIs in `#available` checks

### Critical: JS-to-Swift Bridge Pitfalls

#### Module Access — Use `expo`, NOT `react-native`
Expo Modules Core maintains its own module registry, completely separate from React Native's `NativeModules`. Using the wrong import will silently return `undefined` — the module appears to work (no crashes) but never actually communicates with Swift.

- **ALWAYS** use `requireOptionalNativeModule("ModuleName")` from `expo`
- **NEVER** use `NativeModules` from `react-native` to access Expo modules

#### JS Numbers Arrive as `Double` in Swift
JavaScript only has one number type (`Number` = IEEE 754 double). When these cross the Expo Modules Core bridge, Swift receives them as `Double`, not `Int`. A direct cast `value as? Int` will silently return `nil`.

**Always use a `toInt()` helper** (shown in the Module Definition above) that handles `Int`, `Double`, and `NSNumber` cases. Keep `Double` for fractional values like percentages.

#### Module-Level Resolution
Call `requireOptionalNativeModule()` once at the top of your TypeScript file, not inside each function. The module reference is static and resolving it once avoids repeated lookups:
```typescript
const WidgetModule = requireOptionalNativeModule("AppWidget");
// Then use WidgetModule in all functions
```

### TypeScript Bridge File Pattern

The correct pattern for accessing an Expo native module from TypeScript:

```typescript
// CORRECT — uses Expo's module registry
import { requireOptionalNativeModule } from "expo";
const WidgetModule = requireOptionalNativeModule("AppWidget");

export async function updateWidget(data: WidgetData): Promise<boolean> {
  if (!WidgetModule) return false;
  await WidgetModule.updateWidgetData(data);
  return true;
}
```

**DO NOT** use this pattern — it accesses a completely separate registry and will always be `undefined` for Expo modules:
```typescript
// WRONG — NativeModules does NOT contain Expo modules!
import { NativeModules } from "react-native";
const WidgetModule = NativeModules.AppWidget; // undefined in production
```

## App Groups Data Sharing

### Setup
1. Enable App Groups in Xcode for both app and widget extension
2. Use matching suite name: `group.com.example.app`

### Reading/Writing
```swift
let suiteName = "group.com.example.app"

// Write
if let defaults = UserDefaults(suiteName: suiteName) {
    defaults.set(100, forKey: "value")
    defaults.synchronize()
}

// Read
if let defaults = UserDefaults(suiteName: suiteName) {
    let value = defaults.integer(forKey: "value")
}
```

## Widget Configuration

### Static Configuration
```swift
struct AppWidget: Widget {
    let kind: String = "AppWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AppProvider()) { entry in
            // View building with iOS version handling
        }
        .configurationDisplayName("App Name")
        .description("Widget description")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct AppWidgetBundle: WidgetBundle {
    var body: some Widget {
        AppWidget()
    }
}
```

## Preview Support

```swift
#if DEBUG
struct AppWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            AppWidgetEntryView(entry: sampleEntry)
                .previewContext(WidgetPreviewContext(family: .systemSmall))
            AppWidgetEntryView(entry: sampleEntry)
                .previewContext(WidgetPreviewContext(family: .systemMedium))
        }
    }
}
#endif
```

## Testing Native Module Bridge

`requireOptionalNativeModule()` resolves at **module load time** (top-level `const`), not per-function call. Standard `jest.mock()` factories are hoisted but cannot reliably reference other variables in this project's Babel setup.

### Required Pattern: `jest.isolateModules` + `jest.doMock`

```typescript
// Helper to load module with a custom native module mock
function loadWithMock(mockModule: any) {
  let result: typeof import('../sharedData');
  jest.isolateModules(() => {
    jest.doMock('expo', () => ({
      requireOptionalNativeModule: (name: string) => {
        if (name === 'AppWidget') return mockModule;
        return null;
      },
    }));
    result = require('../sharedData');
  });
  return result!;
}

describe('widgetBridge', () => {
  let mockUpdate: jest.Mock;
  let writeData: typeof import('../sharedData').writeWidgetData;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mod = loadWithMock({ updateWidgetData: mockUpdate });
    writeData = mod.writeWidgetData;
  });

  it('should call native module', async () => {
    await writeData(testData);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should handle missing module', async () => {
    const mod = loadWithMock(null);
    const result = await mod.writeWidgetData(testData);
    expect(result).toBe(false);
  });
});
```

### Why This Pattern is Necessary
1. `jest.mock('expo', ...)` factory is hoisted above all `const` declarations — referencing `jest.fn()` variables inside it fails
2. `jest.doMock` is NOT hoisted, so it respects execution order
3. `jest.isolateModules` gives a fresh module registry per call, so each test can provide different mock behavior (e.g., `null` module vs working module)
4. Mock `expo` directly, not `expo-modules-core` — jest-expo's setup already mocks `expo-modules-core` and they conflict
