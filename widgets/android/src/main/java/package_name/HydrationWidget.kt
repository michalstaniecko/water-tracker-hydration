package website.ihumbak.hydration

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.View
import android.widget.RemoteViews
import org.json.JSONObject
import kotlin.math.roundToInt

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

            // Update text views
            views.setTextViewText(R.id.water_amount, "${todayWater}ml")
            views.setTextViewText(R.id.water_percentage, "${percentage.roundToInt()}%")
            views.setTextViewText(R.id.daily_goal, "of ${dailyGoal}ml")
            views.setTextViewText(R.id.add_water_text, "+${glassCapacity}ml")

            // Update progress bar
            views.setProgressBar(R.id.progress_ring, 100, percentage.roundToInt(), false)

            // Show/hide streak
            if (streak > 0) {
                views.setViewVisibility(R.id.streak_container, View.VISIBLE)
                views.setTextViewText(R.id.streak_text, "$streak day streak")
            } else {
                views.setViewVisibility(R.id.streak_container, View.GONE)
            }

            // Set up add water button with deep link
            val addWaterIntent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("hydration://?action=addwater&amount=$glassCapacity")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            val addWaterPendingIntent = PendingIntent.getActivity(
                context,
                appWidgetId,
                addWaterIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.add_water_button, addWaterPendingIntent)

            // Set up widget tap to open app
            val openAppIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED
            }
            if (openAppIntent != null) {
                val openAppPendingIntent = PendingIntent.getActivity(
                    context,
                    1,
                    openAppIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_container, openAppPendingIntent)
            }

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
