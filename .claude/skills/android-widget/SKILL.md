---
name: android-widget
description: Expert Kotlin/Android guidance for Android AppWidget development with Expo/React Native integration. Use when writing Kotlin code for widgets, native modules, SharedPreferences data sharing, or AndroidManifest configuration.
---

# Android AppWidget + Expo Development

Expert guidance for Android widget development with React Native/Expo integration.

## Directory Structure

The `@bittingz/expo-widgets` plugin expects a `src/` prefix inside the widget directory. Files placed directly in `widgets/android/main/...` or `widgets/android/res/...` (without `src/`) will NOT be found during build.

```
widgets/android/src/
  main/
    java/website/ihumbak/hydration/   ← Kotlin files (Module, Widget Provider)
    res/
      drawable/                        ← Shape drawables (backgrounds, progress ring)
      drawable-night/                  ← Dark mode drawables
      layout/                          ← Widget layout XML (RemoteViews)
      values/                          ← Colors, strings (light mode)
      values-night/                    ← Colors (dark mode overrides)
      xml/                             ← Widget info XML (appwidget-provider)
```

## Code Style Conventions

### Organization
- Use `// region` / `// endregion` comments to section code (Constants, Lifecycle, Widget Update, Helpers)
- Group constants in a `companion object` at the bottom of the class
- Keep widget provider, native module, and layout XML in separate files

### Naming
- PascalCase for classes: `HydrationWidget`, `HydrationWidgetModule`
- camelCase for functions and properties: `updateAppWidget`, `todayWater`
- SCREAMING_SNAKE_CASE for constants: `PREFS_NAME`, `DATA_KEY`, `ACTION_REFRESH`
- Descriptive names matching data domain (e.g., `glassCapacity` not `capacity`)

### Kotlin Idioms
- Prefer `val` over `var` — use `var` only when mutation is required
- Use `apply {}` scope function for intent/builder configuration
- Use `companion object` for static constants and utility functions
- Prefer `optInt()`/`optDouble()` over `getInt()`/`getDouble()` for safe JSON parsing with defaults

## AppWidgetProvider Patterns

### Lifecycle Methods
`AppWidgetProvider` receives system broadcasts. Override `onUpdate` for periodic updates and `onReceive` for custom actions:

```kotlin
class HydrationWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, HydrationWidget::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            onUpdate(context, appWidgetManager, appWidgetIds)
        }
    }

    companion object {
        const val PREFS_NAME = "website.ihumbak.hydration.widget"
        const val DATA_KEY = "widget_data"
        const val ACTION_REFRESH = "website.ihumbak.hydration.ACTION_REFRESH"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val jsonString = prefs.getString(DATA_KEY, null)

            var todayWater = 0
            var dailyGoal = 2000
            var percentage = 0f
            var streak = 0
            var glassCapacity = 250

            if (jsonString != null) {
                try {
                    val json = JSONObject(jsonString)
                    todayWater = json.optInt("todayWater", 0)
                    dailyGoal = json.optInt("dailyGoal", 2000)
                    percentage = json.optDouble("percentage", 0.0).toFloat()
                    streak = json.optInt("streak", 0)
                    glassCapacity = json.optInt("glassCapacity", 250)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            val views = RemoteViews(context.packageName, R.layout.hydration_widget)
            // ... update views ...
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun refreshAllWidgets(context: Context) {
            val intent = Intent(context, HydrationWidget::class.java).apply {
                action = ACTION_REFRESH
            }
            context.sendBroadcast(intent)
        }
    }
}
```

### Key Points
- `onUpdate` is called by the system on the period set in `updatePeriodMillis`
- Custom refresh uses a broadcast with `ACTION_REFRESH`, handled in `onReceive`
- `refreshAllWidgets()` sends a broadcast that triggers all widget instances to update
- Always call `super.onReceive()` before handling custom actions

## Widget Layout (XML RemoteViews)

### Supported Views
RemoteViews only supports a limited subset of Android views:
- **Layouts:** `LinearLayout`, `FrameLayout`, `RelativeLayout`, `GridLayout`
- **Views:** `TextView`, `ImageView`, `ProgressBar`, `Button`, `Chronometer`, `ViewFlipper`
- **NOT supported:** `RecyclerView`, `ConstraintLayout`, custom views, `EditText`

### Layout Pattern
```xml
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_container"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="horizontal"
    android:padding="16dp"
    android:background="@drawable/widget_background"
    android:gravity="center_vertical">

    <!-- Progress ring using ProgressBar with custom drawable -->
    <FrameLayout
        android:layout_width="70dp"
        android:layout_height="70dp">
        <ProgressBar
            android:id="@+id/progress_ring"
            style="@android:style/Widget.ProgressBar.Horizontal"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:max="100"
            android:progress="0"
            android:progressDrawable="@drawable/circular_progress"
            android:indeterminate="false" />
    </FrameLayout>

    <!-- Text views for data display -->
    <TextView
        android:id="@+id/water_amount"
        android:textSize="22sp"
        android:textStyle="bold"
        android:textColor="@color/widget_text_primary" />
</LinearLayout>
```

### Important Notes
- Use `@drawable/widget_background` (shape XML) for rounded corners, not `android:clipToOutline`
- Circular progress ring is a `ProgressBar` with a custom `layer-list` drawable (`ring` shape)
- **Pitfall: `android:tint` is deprecated** — causes lint warnings and may not work on all API levels. Use `app:tint` from AndroidX instead. This requires adding the `app` namespace to the root layout element:

```xml
<!-- WRONG — deprecated, lint warning -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android">
    <ImageView android:tint="@color/widget_accent" />
</LinearLayout>

<!-- CORRECT — add app namespace, use app:tint -->
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto">
    <ImageView app:tint="@color/widget_accent" />
</LinearLayout>
```

- Click handlers use `PendingIntent` set via `views.setOnClickPendingIntent(R.id.view, pendingIntent)`
- Deep links use `Intent(Intent.ACTION_VIEW)` with `Uri.parse("hydration://...")`

### PendingIntent Pattern
```kotlin
val addWaterIntent = Intent(Intent.ACTION_VIEW).apply {
    data = Uri.parse("hydration://?action=addwater&amount=$glassCapacity")
    flags = Intent.FLAG_ACTIVITY_NEW_TASK
}
val pendingIntent = PendingIntent.getActivity(
    context, 0, addWaterIntent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
)
views.setOnClickPendingIntent(R.id.add_water_button, pendingIntent)
```
- Always use `FLAG_IMMUTABLE` (required API 31+)
- Use unique request codes (second param) when multiple PendingIntents exist

## Expo Native Module Integration (Kotlin)

### Module Definition
The native module extends `Module()` from `expo.modules.kotlin.modules` and uses the Expo module DSL:

```kotlin
package website.ihumbak.hydration

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject

class HydrationWidgetModule : Module() {

    override fun definition() = ModuleDefinition {

        Name("HydrationWidget")

        AsyncFunction("updateWidgetData") { prefsName: String, jsonString: String ->
            appContext.reactContext?.let { context ->
                val prefs = context.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
                prefs.edit().putString("widget_data", jsonString).apply()
            }
        }

        AsyncFunction("readWidgetData") { prefsName: String ->
            appContext.reactContext?.let { context ->
                val prefs = context.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
                prefs.getString("widget_data", null)
            }
        }

        AsyncFunction("refreshWidget") {
            appContext.reactContext?.let { context ->
                HydrationWidget.refreshAllWidgets(context)
            }
        }
    }
}
```

### Key Points
- Access Android `Context` via `appContext.reactContext`
- Use `AsyncFunction` for operations that should not block the JS thread
- Use `Function` (synchronous) only for lightweight, non-blocking operations
- The module name in `Name("HydrationWidget")` must match the JS-side `requireOptionalNativeModule("HydrationWidget")` call exactly

### Pitfall: `AsyncFunction` Lambda Return Type
The Expo Modules Kotlin DSL infers the `AsyncFunction` lambda return type as `Any?`. Using `return@AsyncFunction` (bare return, no value) returns `Unit`, which causes a compile error:

```
e: Module.kt: Return type mismatch: expected 'kotlin.Any?', actual 'kotlin.Unit'
```

**Fix:** Use `?.let { }` instead of early-return guards. When the receiver is `null`, `?.let` returns `null` (compatible with `Any?`):

```kotlin
// WRONG — returns Unit, compile error
AsyncFunction("doSomething") {
    val context = appContext.reactContext ?: return@AsyncFunction  // Unit!
    // ...
}

// CORRECT — returns null when reactContext is null
AsyncFunction("doSomething") {
    appContext.reactContext?.let { context ->
        // ...
    }
}
```

Reference: `expo-localization`'s `LocalizationModule.kt` uses this `?.let` pattern.

## Critical: JS-to-Kotlin Bridge Pitfalls

### Module Access — Use `expo`, NOT `react-native`
Expo Modules Core maintains its own module registry, completely separate from React Native's `NativeModules`. Using the wrong import will silently return `undefined`.

- **ALWAYS** use `requireOptionalNativeModule("HydrationWidget")` from `expo`
- **NEVER** use `NativeModules` from `react-native` to access Expo modules

```typescript
// CORRECT
import { requireOptionalNativeModule } from "expo";
const HydrationWidgetModule = requireOptionalNativeModule("HydrationWidget");

// WRONG — NativeModules does NOT contain Expo modules!
import { NativeModules } from "react-native";
const module = NativeModules.HydrationWidget; // undefined
```

### Module Registration is NOT Automatic on Android
Unlike iOS where the `@bittingz/expo-widgets` plugin handles registration, Android requires an `expo-module.config.json` in the module's package to register with Expo's module loader. The `@bittingz/expo-widgets` plugin generates this configuration. Verify the plugin config in `app.json`:

```json
["@bittingz/expo-widgets", {
  "android": {
    "src": "./widgets/android",
    "widgets": [{
      "name": "HydrationWidget",
      "resourceName": "@xml/hydration_widget_info"
    }]
  }
}]
```

### SharedPreferences Name Must Match Exactly
The prefs name used in Kotlin widget code and the JS bridge must be identical:
- Kotlin widget: `const val PREFS_NAME = "website.ihumbak.hydration.widget"`
- TypeScript: `export const SHARED_PREFS_NAME = "website.ihumbak.hydration.widget"`
- The JS side passes `SHARED_PREFS_NAME` as a parameter to the native module

### JSON Serialization: Android vs iOS
Android and iOS use fundamentally different data sharing strategies:

| | iOS | Android |
|---|---|---|
| Storage | `UserDefaults` (App Groups) | `SharedPreferences` |
| Format | Individual typed keys | Single JSON string |
| JS call | `updateWidgetData(dataObject)` | `updateWidgetData(prefsName, jsonString)` |
| Parsing | Direct key access (`defaults.integer(forKey:)`) | `JSONObject(jsonString).optInt("key", default)` |

The JS bridge handles this divergence:
```typescript
if (Platform.OS === "ios") {
    await HydrationWidgetModule.updateWidgetData(data);
} else if (Platform.OS === "android") {
    await HydrationWidgetModule.updateWidgetData(SHARED_PREFS_NAME, JSON.stringify(data));
}
```

### Safe JSON Parsing
Always use `opt*` methods with defaults, never `get*` methods that throw:
```kotlin
val json = JSONObject(jsonString)
todayWater = json.optInt("todayWater", 0)        // returns 0 if missing
dailyGoal = json.optInt("dailyGoal", 2000)        // returns 2000 if missing
percentage = json.optDouble("percentage", 0.0)     // returns 0.0 if missing
```

### Module-Level Resolution
Call `requireOptionalNativeModule()` once at the top of your TypeScript file:
```typescript
const HydrationWidgetModule = requireOptionalNativeModule("HydrationWidget");
// Then use HydrationWidgetModule in all functions
```

## SharedPreferences Data Sharing

### Data Flow
```
JS App State -> widgetService.syncToWidget()
             -> sharedData.writeWidgetData()
             -> Native Module (Kotlin)
             -> SharedPreferences.edit().putString("widget_data", json).apply()
             -> HydrationWidget.refreshAllWidgets() sends ACTION_REFRESH broadcast
             -> onReceive() -> onUpdate() reads SharedPreferences -> RemoteViews update
```

### Reading/Writing SharedPreferences
```kotlin
// Write (in native module)
val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
prefs.edit().putString("widget_data", jsonString).apply()

// Read (in widget provider)
val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
val jsonString = prefs.getString(DATA_KEY, null)
```

### `apply()` vs `commit()`
- Use `apply()` (async, non-blocking) for writes from the native module — the widget refresh broadcast gives SharedPreferences time to flush
- Use `commit()` only if you need a synchronous guarantee (rare)
- Both are safe for cross-process reads; `apply()` is preferred for performance

### Key Constants
```kotlin
const val PREFS_NAME = "website.ihumbak.hydration.widget"
const val DATA_KEY = "widget_data"
```

## AndroidManifest Configuration

The `@bittingz/expo-widgets` plugin generates the AndroidManifest entries, but understanding them is essential for debugging:

### Widget Receiver
```xml
<receiver
    android:name=".HydrationWidget"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <intent-filter>
        <action android:name="website.ihumbak.hydration.ACTION_REFRESH" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/hydration_widget_info" />
</receiver>
```

### Deep Link Intent Filter
For the app to handle widget deep links (`hydration://` scheme):
```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="hydration" />
</intent-filter>
```

### Key Points
- The receiver must be `android:exported="true"` to receive system broadcasts
- Two intent filters: one for system `APPWIDGET_UPDATE`, one for custom `ACTION_REFRESH`
- `<meta-data>` points to the widget configuration XML (`@xml/hydration_widget_info`)
- The `@bittingz/expo-widgets` plugin handles manifest generation — manual edits are overwritten on `npx expo prebuild`

### Config Plugin for Missing Manifest Entries

`@bittingz/expo-widgets` does NOT generate all required manifest entries. A custom Expo config plugin (`plugins/withAndroidWidgetManifest.js`) is needed to add:

1. **`ACTION_REFRESH` intent filter** on the widget receiver — without this, `refreshAllWidgets()` broadcasts are silently ignored
2. **`android:exported="true"`** on the receiver — required for receiving system broadcasts
3. **Deep link intent filter** on `MainActivity` — needed for widget tap-to-open actions

The plugin must be registered in `app.json` **after** the widgets plugin:

```json
"plugins": [
    ["@bittingz/expo-widgets", {
        "android": {
            "src": "./widgets/android",
            "widgets": [{ "name": "HydrationWidget", "resourceName": "@xml/hydration_widget_info" }]
        }
    }],
    "./plugins/withAndroidWidgetManifest"
]
```

The config plugin uses `withAndroidManifest` from `expo/config-plugins` to modify the merged manifest before build. It runs on every `npx expo prebuild`, so changes persist across rebuilds.

## Dark Mode Support

### Resource Qualifiers
Android uses resource directory qualifiers for automatic dark mode switching:

```
res/values/colors.xml          # Light mode colors
res/values-night/colors.xml    # Dark mode colors
res/drawable/widget_background.xml       # Light background
res/drawable-night/widget_background.xml # Dark background
```

### Color Resources
```xml
<!-- res/values/colors.xml -->
<resources>
    <color name="widget_background">#FFFFFF</color>
    <color name="widget_text_primary">#1E40AF</color>
    <color name="widget_text_secondary">#6B7280</color>
    <color name="widget_accent">#3B82F6</color>
    <color name="widget_streak">#F97316</color>
    <color name="widget_progress_bg">#E5E7EB</color>
    <color name="widget_button_bg">#EBF5FF</color>
</resources>

<!-- res/values-night/colors.xml -->
<resources>
    <color name="widget_background">#1F2937</color>
    <color name="widget_text_primary">#93C5FD</color>
    <color name="widget_text_secondary">#9CA3AF</color>
    <color name="widget_accent">#60A5FA</color>
    <color name="widget_streak">#FB923C</color>
    <color name="widget_progress_bg">#374151</color>
    <color name="widget_button_bg">#1E3A5F</color>
</resources>
```

### Applying to Layout
Replace all hardcoded hex colors with `@color/` references:
```xml
<!-- Before (no dark mode) -->
<TextView android:textColor="#1E40AF" />
<shape><solid android:color="#FFFFFF" /></shape>

<!-- After (dark mode aware) -->
<TextView android:textColor="@color/widget_text_primary" />
<shape><solid android:color="@color/widget_background" /></shape>
```

The system automatically selects the correct resource directory based on the device's dark mode setting. No code changes needed in the widget provider.

## Widget Configuration XML

The `res/xml/hydration_widget_info.xml` defines widget metadata:

```xml
<appwidget-provider
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:initialLayout="@layout/hydration_widget"
    android:minWidth="250dp"
    android:minHeight="80dp"
    android:minResizeWidth="180dp"
    android:minResizeHeight="80dp"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:updatePeriodMillis="1800000"
    android:description="@string/widget_description"
    android:targetCellWidth="4"
    android:targetCellHeight="1" />
```

### Attributes
| Attribute | Value | Notes |
|---|---|---|
| `initialLayout` | `@layout/hydration_widget` | Layout shown before first update |
| `updatePeriodMillis` | `1800000` (30 min) | Minimum is 30 minutes; use `0` to disable periodic updates and rely only on broadcast refresh |
| `minWidth` / `minHeight` | `250dp` / `80dp` | Minimum size for pre-Android 12 devices |
| `targetCellWidth` / `targetCellHeight` | `4` / `1` | Grid cells on Android 12+ (preferred over min dimensions) |
| `resizeMode` | `horizontal\|vertical` | Allow user to resize in both directions |
| `widgetCategory` | `home_screen` | Can also include `keyguard` for lock screen widgets |
| `description` | `@string/widget_description` | Shown in widget picker |

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
        if (name === 'HydrationWidget') return mockModule;
        return null;
      },
    }));
    result = require('../sharedData');
  });
  return result!;
}
```

### Android-Specific Test Cases

```typescript
describe('Android widget bridge', () => {
  let mockUpdateWidgetData: jest.Mock;
  let mockReadWidgetData: jest.Mock;
  let mockRefreshWidgetNative: jest.Mock;
  let writeWidgetData: typeof import('../sharedData').writeWidgetData;
  let readWidgetData: typeof import('../sharedData').readWidgetData;
  let refreshWidget: typeof import('../sharedData').refreshWidget;
  let SHARED_PREFS_NAME: string;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
    mockUpdateWidgetData = jest.fn().mockResolvedValue(undefined);
    mockReadWidgetData = jest.fn();
    mockRefreshWidgetNative = jest.fn().mockResolvedValue(undefined);

    const mod = loadWithMock({
      updateWidgetData: mockUpdateWidgetData,
      readWidgetData: mockReadWidgetData,
      refreshWidget: mockRefreshWidgetNative,
    });
    writeWidgetData = mod.writeWidgetData;
    readWidgetData = mod.readWidgetData;
    refreshWidget = mod.refreshWidget;
    SHARED_PREFS_NAME = mod.SHARED_PREFS_NAME;
  });

  it('passes SHARED_PREFS_NAME and JSON string to updateWidgetData', async () => {
    await writeWidgetData(mockWidgetData);
    expect(mockUpdateWidgetData).toHaveBeenCalledWith(
      SHARED_PREFS_NAME,
      JSON.stringify(mockWidgetData)
    );
  });

  it('calls refreshWidget (not reloadWidget) on Android', async () => {
    await refreshWidget();
    expect(mockRefreshWidgetNative).toHaveBeenCalled();
  });

  it('parses JSON string from readWidgetData', async () => {
    mockReadWidgetData.mockResolvedValue(JSON.stringify(mockWidgetData));
    const result = await readWidgetData();
    expect(result).toEqual(mockWidgetData);
  });

  it('handles invalid JSON gracefully', async () => {
    mockReadWidgetData.mockResolvedValue('not valid json');
    const result = await readWidgetData();
    expect(result).toBeNull();
  });
});
```

### Why This Pattern is Necessary
1. `jest.mock('expo', ...)` factory is hoisted above all `const` declarations — referencing `jest.fn()` variables inside it fails
2. `jest.doMock` is NOT hoisted, so it respects execution order
3. `jest.isolateModules` gives a fresh module registry per call, so each test can provide different mock behavior (e.g., `null` module vs working module)
4. Mock `expo` directly, not `expo-modules-core` — jest-expo's setup already mocks `expo-modules-core` and they conflict
