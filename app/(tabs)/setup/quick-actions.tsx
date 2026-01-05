import { View, Text, Pressable, ScrollView, Switch } from "react-native";
import { useSetupStore, QuickAction } from "@/stores/setup";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useState } from "react";
import { sanitizePositiveNumber } from "@/utils/validation";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function QuickActionsSettings() {
  const { t } = useTranslation("setup");
  const { quickActions, updateQuickAction, setQuickActions } = useSetupStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleToggle = async (id: string, enabled: boolean) => {
    await updateQuickAction(id, { enabled });
  };

  const handleStartEdit = (action: QuickAction) => {
    setEditingId(action.id);
    setEditValue(action.amount.toString());
  };

  const handleSaveEdit = async (id: string) => {
    const sanitized = sanitizePositiveNumber(editValue, "250");
    const amount = parseInt(sanitized, 10);
    await updateQuickAction(id, { amount });
    setEditingId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleAddAction = async () => {
    const newId = `custom-${Date.now()}`;
    const newAction: QuickAction = {
      id: newId,
      amount: 200,
      labelKey: "quickActionCustom",
      enabled: true,
    };
    await setQuickActions([...quickActions, newAction]);
  };

  const handleRemoveAction = async (id: string) => {
    const filtered = quickActions.filter((action) => action.id !== id);
    await setQuickActions(filtered);
  };

  return (
    <ErrorBoundary componentName="Quick Actions Settings">
      <ScrollView contentContainerClassName="p-5 gap-4">
        <Text className="text-gray-600 text-sm mb-2">
          {t("quickActionsDescription")}
        </Text>

        {quickActions.map((action) => (
          <View
            key={action.id}
            className="bg-gray-50 rounded-lg p-4 flex-row items-center justify-between"
          >
            <View className="flex-1">
              {editingId === action.id ? (
                <View className="flex-row items-center gap-2">
                  <Input
                    value={editValue}
                    onChangeText={setEditValue}
                    keyboardType="numeric"
                    placeholder="0"
                    className="flex-1"
                  />
                  <Pressable
                    onPress={() => handleSaveEdit(action.id)}
                    className="bg-green-500 p-2 rounded"
                  >
                    <FontAwesome name="check" size={16} color="#ffffff" />
                  </Pressable>
                  <Pressable
                    onPress={handleCancelEdit}
                    className="bg-gray-400 p-2 rounded"
                  >
                    <FontAwesome name="times" size={16} color="#ffffff" />
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => handleStartEdit(action)}>
                  <Text className="text-lg font-semibold text-gray-900">
                    {action.amount}ml
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {t(action.labelKey, { ns: "translation" })}
                  </Text>
                </Pressable>
              )}
            </View>

            <View className="flex-row items-center gap-3">
              {action.id.startsWith("custom-") && (
                <Pressable
                  onPress={() => handleRemoveAction(action.id)}
                  className="p-2"
                >
                  <FontAwesome name="trash" size={18} color="#ef4444" />
                </Pressable>
              )}
              <Switch
                value={action.enabled}
                onValueChange={(value) => handleToggle(action.id, value)}
                trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                thumbColor={action.enabled ? "#ffffff" : "#f4f4f5"}
              />
            </View>
          </View>
        ))}

        <Pressable
          onPress={handleAddAction}
          className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center gap-2 active:opacity-70"
        >
          <FontAwesome name="plus" size={16} color="#ffffff" />
          <Text className="text-white font-semibold">
            {t("addQuickAction")}
          </Text>
        </Pressable>
      </ScrollView>
    </ErrorBoundary>
  );
}
