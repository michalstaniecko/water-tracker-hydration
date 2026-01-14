import ExpoModulesCore
import WidgetKit

public class HydrationWidgetModule: Module {
    let suiteName = "group.website.ihumbak.hydration"

    public func definition() -> ModuleDefinition {
        Name("HydrationWidget")

        // Update widget data in shared UserDefaults
        Function("updateWidgetData") { (data: [String: Any]) -> Void in
            guard let userDefaults = UserDefaults(suiteName: self.suiteName) else {
                return
            }

            userDefaults.set(data["todayWater"] as? Int ?? 0, forKey: "todayWater")
            userDefaults.set(data["dailyGoal"] as? Int ?? 2000, forKey: "dailyGoal")
            userDefaults.set(data["percentage"] as? Double ?? 0, forKey: "percentage")
            userDefaults.set(data["streak"] as? Int ?? 0, forKey: "streak")
            userDefaults.set(data["glassCapacity"] as? Int ?? 250, forKey: "glassCapacity")
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
