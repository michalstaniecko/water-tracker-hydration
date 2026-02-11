package website.ihumbak.hydration

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

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
