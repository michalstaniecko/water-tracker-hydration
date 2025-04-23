import {
  Keyboard,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Input from "@/components/ui/Input";
import { SetupOptions, useSetupStore } from "@/stores/setup";

export default function Setup() {
  const setupStore = useSetupStore();
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerClassName={"gap-3 flex-1 p-5"}>
        <View className={"gap-1"}>
          <Text>Glass capacity, in ml.:</Text>
          <Input
            keyboardType={"numeric"}
            value={setupStore.glassCapacity as unknown as string}
            onChangeText={(text) => {
              setupStore.setGlassCapacity(text);
            }}
            placeholder={"0"}
          />
        </View>
        <View className={"gap-1"}>
          <Text>Daily water requirement, in ml.:</Text>
          <Input
            keyboardType={"numeric"}
            value={setupStore.minimumWater as unknown as string}
            onChangeText={(text) => {
              setupStore.setMinimumWater(text);
            }}
            placeholder={"0"}
          />
        </View>

        <View className={"gap-1"}>
          <Text>Start, and end of the day:</Text>
          <View className={"flex-row gap-2 items-center"}>
            <Input
              className={"flex-1"}
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
            <Text>-</Text>
            <Input
              className={"flex-1"}
              keyboardType={"numeric"}
              value={setupStore[SetupOptions.DAY].endHour as unknown as string}
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
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
