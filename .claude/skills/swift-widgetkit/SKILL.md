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

    public func definition() -> ModuleDefinition {
        Name("AppWidget")

        Function("updateWidgetData") { (data: [String: Any]) -> Void in
            guard let userDefaults = UserDefaults(suiteName: self.suiteName) else { return }
            userDefaults.set(data["value"] as? Int ?? 0, forKey: "value")
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
