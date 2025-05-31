import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Input from "@/components/ui/Input";
import { SetupOptions, useSetupStore } from "@/stores/setup";
import { useTranslation } from "react-i18next";
import { ModalPicker } from "@/components/ui/ModalPicker";
import { languages } from "@/config/languages";
import InputTime from "@/components/ui/InputTime";

export default function Setup() {
  const { t } = useTranslation("setup");
  const setupStore = useSetupStore();

  const mappedLanguages = languages.map((lang) => ({
    label: t(`${lang.label}`, { ns: "languages" }),
    value: lang.code,
  }));

  const handleChangeLanguage = (languageCode: string) => {
    setupStore.setOption(SetupOptions.LANGUAGE_CODE, languageCode);
  };

  const handleStartTimeChange = (time: string) => {
    setupStore.setOption(SetupOptions.DAY, {
      startHour: time,
      endHour: setupStore.day.endHour,
    });
  };

  const handleEndTimeChange = (time: string) => {
    setupStore.setOption(SetupOptions.DAY, {
      startHour: setupStore.day.startHour,
      endHour: time,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerClassName={"gap-5 flex-1 p-5"}>
        <View className={"gap-1"}>
          <Input
            label={t("glassCapacityInMl")}
            keyboardType={"numeric"}
            value={setupStore.glassCapacity as unknown as string}
            onChangeText={(text) => {
              setupStore.setGlassCapacity(text);
            }}
            placeholder={"0"}
          />
        </View>
        <View className={"gap-1"}>
          <Input
            label={t("dailyWaterRequirementInMl")}
            keyboardType={"numeric"}
            value={setupStore.minimumWater as unknown as string}
            onChangeText={(text) => {
              setupStore.setMinimumWater(text);
            }}
            placeholder={"0"}
          />
        </View>

        <View className={"flex-row justify-between"}>
          <View className={"w-[48%]"}>
            <InputTime
              value={setupStore.day.startHour}
              label={t("startOfTheDay")}
              onChange={handleStartTimeChange}
              confirmText={t("confirm", { ns: "translation" })}
              cancelText={t("cancel", { ns: "translation" })}
            />
          </View>
          <View className={"w-[48%]"}>
            <InputTime
              value={setupStore.day.endHour}
              label={t("endOfTheDay")}
              onChange={handleEndTimeChange}
              confirmText={t("confirm", { ns: "translation" })}
              cancelText={t("cancel", { ns: "translation" })}
            />
          </View>
        </View>
        <View>
          <ModalPicker
            label={t("selectLanguage")}
            options={mappedLanguages}
            onSelect={handleChangeLanguage}
            value={setupStore[SetupOptions.LANGUAGE_CODE]}
          />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
