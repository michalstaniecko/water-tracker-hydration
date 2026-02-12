package website.ihumbak.hydration

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class HydrationWidgetModule : Module() {

    private val context
        get() = requireNotNull(appContext.reactContext) {
            "React context is not available"
        }

    override fun definition() = ModuleDefinition {

        Name("HydrationWidget")

        AsyncFunction("updateWidgetData") { prefsName: String, jsonString: String ->
            val prefs = context.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
            prefs.edit().putString("widget_data", jsonString).commit()
        }

        AsyncFunction("readWidgetData") { prefsName: String ->
            val prefs = context.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
            prefs.getString("widget_data", null)
        }

        AsyncFunction("refreshWidget") {
            val intent = Intent("website.ihumbak.hydration.ACTION_REFRESH").apply {
                component = ComponentName(
                    context.packageName,
                    "website.ihumbak.hydration.HydrationWidget"
                )
            }
            context.sendBroadcast(intent)
        }
    }
}
