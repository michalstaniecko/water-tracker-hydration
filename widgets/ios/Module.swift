import ExpoModulesCore
import WidgetKit

public class ExpoWidgetsModule: Module {
    let suiteName = "group.website.ihumbak.hydration.expowidgets"

    /// Safely converts a JS bridge value to Int.
    /// JavaScript numbers arrive as Double via Expo Modules Core; `Double as? Int` always returns nil in Swift.
    private func toInt(_ value: Any?, defaultValue: Int = 0) -> Int {
        if let intVal = value as? Int { return intVal }
        if let doubleVal = value as? Double { return Int(doubleVal) }
        if let nsNum = value as? NSNumber { return nsNum.intValue }
        return defaultValue
    }

    public func definition() -> ModuleDefinition {
        Name("HydrationWidget")

        // Update widget data in shared UserDefaults
        Function("updateWidgetData") { (data: [String: Any]) -> Void in
            guard let userDefaults = UserDefaults(suiteName: self.suiteName) else {
                return
            }

            #if DEBUG
            print("[HydrationWidget] updateWidgetData received: \(data)")
            print("[HydrationWidget] todayWater type: \(type(of: data["todayWater"])), value: \(self.toInt(data["todayWater"]))")
            #endif

            userDefaults.set(self.toInt(data["todayWater"], defaultValue: 0), forKey: "todayWater")
            userDefaults.set(self.toInt(data["dailyGoal"], defaultValue: 2000), forKey: "dailyGoal")
            userDefaults.set(data["percentage"] as? Double ?? 0, forKey: "percentage")
            userDefaults.set(self.toInt(data["streak"], defaultValue: 0), forKey: "streak")
            userDefaults.set(self.toInt(data["glassCapacity"], defaultValue: 250), forKey: "glassCapacity")
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
                "todayWater": userDefaults.integer(forKey: "todayWater"),
                "dailyGoal": userDefaults.integer(forKey: "dailyGoal"),
                "percentage": userDefaults.double(forKey: "percentage"),
                "streak": userDefaults.integer(forKey: "streak"),
                "glassCapacity": userDefaults.integer(forKey: "glassCapacity"),
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
