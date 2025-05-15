import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Input from "@/components/ui/Input";
import { SetupOptions, useSetupStore } from "@/stores/setup";

export default function Setup() {
  const setupStore = useSetupStore();
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerClassName={"gap-5 flex-1 p-5"}>
        <View className={"gap-1"}>
          <Input
            label={"Glass capacity, in ml."}
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
            label={"Daily water requirement, in ml.:"}
            keyboardType={"numeric"}
            value={setupStore.minimumWater as unknown as string}
            onChangeText={(text) => {
              setupStore.setMinimumWater(text);
            }}
            placeholder={"0"}
          />
        </View>

        <View>
          <View className={"flex-row gap-3"}>
            <View className={"flex-grow"}>
              <Input
                label={"Start of the day"}
                keyboardType={"numeric"}
                value={`${setupStore[SetupOptions.DAY].startHour}`}
                onChangeText={(text) => {
                  setupStore.setOption(SetupOptions.DAY, {
                    startHour: text ? parseInt(text) : "",
                    endHour: setupStore[SetupOptions.DAY].endHour,
                  });
                }}
                onBlur={(value) => {
                  if (!value) {
                    setupStore.setOption(SetupOptions.DAY, {
                      startHour: 0,
                      endHour: setupStore[SetupOptions.DAY].endHour,
                    });
                  }
                }}
                placeholder={"0"}
              />
            </View>
            <View className={"flex-grow"}>
              <Input
                label={"End of the day"}
                keyboardType={"numeric"}
                value={
                  setupStore[SetupOptions.DAY].endHour as unknown as string
                }
                onChangeText={(text) => {
                  setupStore.setOption(SetupOptions.DAY, {
                    startHour: setupStore[SetupOptions.DAY].startHour,
                    endHour: text ? parseInt(text) : "",
                  });
                }}
                onBlur={(value) => {
                  if (!value) {
                    setupStore.setOption(SetupOptions.DAY, {
                      startHour: setupStore[SetupOptions.DAY].startHour,
                      endHour: 24,
                    });
                  }
                }}
                placeholder={"0"}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
