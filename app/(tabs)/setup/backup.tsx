import { ScrollView } from "react-native";
import ErrorBoundary from "@/components/ErrorBoundary";
import BackupSection from "@/components/BackupSection";

export default function BackupSettings() {
  return (
    <ErrorBoundary componentName="Backup Settings">
      <ScrollView contentContainerClassName={"gap-5 flex-1 p-5"}>
        <BackupSection />
      </ScrollView>
    </ErrorBoundary>
  );
}
