import { View, Text, Pressable, ScrollView, Switch, Alert } from "react-native";
import { useSetupStore, QuickAction } from "@/stores/setup";
import { useTranslation } from "react-i18next";
import Input from "@/components/ui/Input";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useState } from "react";
import { sanitizePositiveNumber } from "@/utils/validation";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { logError } from "@/utils/errorLogging";
import {
  MAX_QUICK_ACTIONS,
  MAX_QUICK_ACTION_AMOUNT,
  DEFAULT_QUICK_ACTION_AMOUNT,
} from "@/constants/app";

export default function QuickActionsSettings() {
  const { t } = useTranslation("setup");
  const { quickActions, updateQuickAction, setQuickActions } = useSetupStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const isAtMaxActions = quickActions.length >= MAX_QUICK_ACTIONS;

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await updateQuickAction(id, { enabled });
    } catch (error) {
      logError(error, {
        operation: "handleToggle",
        component: "QuickActionsSettings",
        data: { id, enabled },
      });
    }
  };

  const handleStartEdit = (action: QuickAction) => {
    setEditingId(action.id);
    setEditValue(action.amount.toString());
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const sanitized = sanitizePositiveNumber(editValue, "250");
      const amount = Math.min(parseInt(sanitized, 10), MAX_QUICK_ACTION_AMOUNT);
      await updateQuickAction(id, { amount });
      setEditingId(null);
      setEditValue("");
    } catch (error) {
      logError(error, {
        operation: "handleSaveEdit",
        component: "QuickActionsSettings",
        data: { id, editValue },
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleAddAction = async () => {
    if (isAtMaxActions) return;

    try {
      const newId = `custom-${Date.now()}`;
      const newAction: QuickAction = {
        id: newId,
        amount: DEFAULT_QUICK_ACTION_AMOUNT,
        labelKey: "quickActionCustom",
        enabled: true,
      };
      await setQuickActions([...quickActions, newAction]);
    } catch (error) {
      logError(error, {
        operation: "handleAddAction",
        component: "QuickActionsSettings",
      });
    }
  };

  const handleRemoveAction = (id: string) => {
    Alert.alert(t("confirmDelete"), t("confirmDeleteQuickAction"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            const filtered = quickActions.filter((action) => action.id !== id);
            await setQuickActions(filtered);
          } catch (error) {
            logError(error, {
              operation: "handleRemoveAction",
              component: "QuickActionsSettings",
              data: { id },
            });
          }
        },
      },
    ]);
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
                    accessibilityRole="button"
                    accessibilityLabel={t("saveQuickActionAccessibilityLabel", {
                      ns: "translation",
                    })}
                  >
                    <FontAwesome name="check" size={16} color="#ffffff" />
                  </Pressable>
                  <Pressable
                    onPress={handleCancelEdit}
                    className="bg-gray-400 p-2 rounded"
                    accessibilityRole="button"
                    accessibilityLabel={t("cancelEditAccessibilityLabel", {
                      ns: "translation",
                    })}
                  >
                    <FontAwesome name="times" size={16} color="#ffffff" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => handleStartEdit(action)}
                  accessibilityRole="button"
                  accessibilityLabel={t("editQuickActionAccessibilityLabel", {
                    ns: "translation",
                    amount: action.amount,
                  })}
                  accessibilityHint={t("editQuickActionAccessibilityHint", {
                    ns: "translation",
                  })}
                >
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
                  accessibilityRole="button"
                  accessibilityLabel={t("deleteQuickActionAccessibilityLabel", {
                    ns: "translation",
                    amount: action.amount,
                  })}
                >
                  <FontAwesome name="trash" size={18} color="#ef4444" />
                </Pressable>
              )}
              <Switch
                value={action.enabled}
                onValueChange={(value) => handleToggle(action.id, value)}
                trackColor={{ false: "#cdd3dc", true: "#2680eb" }}
                thumbColor={action.enabled ? "#ffffff" : "#eef1f5"}
              />
            </View>
          </View>
        ))}

        <Pressable
          onPress={handleAddAction}
          disabled={isAtMaxActions}
          className={`bg-blue-500 rounded-lg p-4 flex-row items-center justify-center gap-2 active:opacity-70 ${
            isAtMaxActions ? "opacity-50" : ""
          }`}
          accessibilityRole="button"
          accessibilityLabel={t("addQuickActionAccessibilityLabel", {
            ns: "translation",
          })}
          accessibilityState={{ disabled: isAtMaxActions }}
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
