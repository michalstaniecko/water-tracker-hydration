import WidgetKit
import SwiftUI

// MARK: - Timeline Entry
struct HydrationEntry: TimelineEntry {
    let date: Date
    let todayWater: Int
    let dailyGoal: Int
    let percentage: Double
    let streak: Int
    let glassCapacity: Int
}

// MARK: - Timeline Provider
struct HydrationProvider: TimelineProvider {
    let suiteName = "group.website.ihumbak.hydration.expowidgets"

    func placeholder(in context: Context) -> HydrationEntry {
        HydrationEntry(
            date: Date(),
            todayWater: 1500,
            dailyGoal: 2000,
            percentage: 75,
            streak: 5,
            glassCapacity: 250
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (HydrationEntry) -> Void) {
        completion(readData())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HydrationEntry>) -> Void) {
        let entry = readData()
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func readData() -> HydrationEntry {
        let userDefaults = UserDefaults(suiteName: suiteName)

        // integer(forKey:) returns 0 if key doesn't exist, so we need explicit check
        let glassCapacity = userDefaults?.integer(forKey: "glassCapacity") ?? 0
        let dailyGoal = userDefaults?.integer(forKey: "dailyGoal") ?? 0

        return HydrationEntry(
            date: Date(),
            todayWater: userDefaults?.integer(forKey: "todayWater") ?? 0,
            dailyGoal: dailyGoal > 0 ? dailyGoal : 2000,
            percentage: userDefaults?.double(forKey: "percentage") ?? 0,
            streak: userDefaults?.integer(forKey: "streak") ?? 0,
            glassCapacity: glassCapacity > 0 ? glassCapacity : 250
        )
    }
}

// MARK: - Progress Ring View
struct ProgressRingView: View {
    var progress: Double
    var lineWidth: CGFloat = 8

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.blue.opacity(0.2), lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: min(CGFloat(progress), 1.0))
                .stroke(
                    Color.blue,
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.3), value: progress)
        }
    }
}

// MARK: - Small Widget View
struct SmallWidgetView: View {
    var entry: HydrationEntry

    var body: some View {
        VStack(spacing: 6) {
            ZStack {
                ProgressRingView(progress: entry.percentage / 100, lineWidth: 6)
                    .frame(width: 50, height: 50)

                Image(systemName: "drop.fill")
                    .foregroundColor(.blue)
                    .font(.system(size: 16))
            }

            Text("\(entry.todayWater)ml")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.primary)

            Text("\(Int(entry.percentage))%")
                .font(.system(size: 12))
                .foregroundColor(.secondary)

            if entry.streak > 0 {
                HStack(spacing: 2) {
                    Image(systemName: "flame.fill")
                        .foregroundColor(.orange)
                        .font(.system(size: 10))
                    Text("\(entry.streak)")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.orange)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(8)
    }
}

// MARK: - Medium Widget View
struct MediumWidgetView: View {
    var entry: HydrationEntry

    var body: some View {
        HStack(spacing: 16) {
            // Left: Progress Ring
            VStack(spacing: 4) {
                ZStack {
                    ProgressRingView(progress: entry.percentage / 100, lineWidth: 8)
                        .frame(width: 65, height: 65)

                    VStack(spacing: 0) {
                        Image(systemName: "drop.fill")
                            .foregroundColor(.blue)
                            .font(.system(size: 18))
                    }
                }
                Text("\(Int(entry.percentage))%")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
            }

            // Center: Stats
            VStack(alignment: .leading, spacing: 4) {
                Text("\(entry.todayWater)ml")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.primary)

                Text("of \(entry.dailyGoal)ml")
                    .font(.system(size: 13))
                    .foregroundColor(.secondary)

                if entry.streak > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "flame.fill")
                            .foregroundColor(.orange)
                            .font(.system(size: 12))
                        Text("\(entry.streak) day streak")
                            .font(.system(size: 12))
                            .foregroundColor(.orange)
                    }
                    .padding(.top, 2)
                }
            }

            Spacer()

            // Right: Quick Add Button (default 250ml)
            Link(destination: URL(string: "hydration://?action=addwater&amount=250")!) {
                VStack(spacing: 4) {
                    ZStack {
                        Circle()
                            .fill(Color.blue.opacity(0.15))
                            .frame(width: 44, height: 44)

                        Image(systemName: "plus")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundColor(.blue)
                    }

                    Text("+250ml")
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
struct HydrationWidgetEntryView: View {
    var entry: HydrationEntry
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
struct HydrationWidget: Widget {
    let kind: String = "HydrationWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HydrationProvider()) { entry in
            if #available(iOS 17.0, *) {
                HydrationWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                HydrationWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("Water Tracker")
        .description("Track your daily hydration progress")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Widget Bundle
@main
struct HydrationWidgetBundle: WidgetBundle {
    var body: some Widget {
        HydrationWidget()
    }
}

// MARK: - Preview
#if DEBUG
struct HydrationWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            HydrationWidgetEntryView(entry: HydrationEntry(
                date: Date(),
                todayWater: 1500,
                dailyGoal: 2000,
                percentage: 75,
                streak: 5,
                glassCapacity: 250
            ))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            .previewDisplayName("Small")

            HydrationWidgetEntryView(entry: HydrationEntry(
                date: Date(),
                todayWater: 1500,
                dailyGoal: 2000,
                percentage: 75,
                streak: 5,
                glassCapacity: 250
            ))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
            .previewDisplayName("Medium")
        }
    }
}
#endif
