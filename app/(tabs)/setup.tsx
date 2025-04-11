import { Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import Input from "@/components/ui/Input";
import { useSetupStore } from "@/stores/setup";

export default function Setup() {
  const setupStore = useSetupStore();
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className={"gap-2 flex-1 p-1"}>
        <Text>Setup</Text>
        <View>
          <Text>Glass capacity, in ml.:</Text>
          <Input
            keyboardType={"numeric"}
            value={setupStore.glassCapacity as unknown as string}
            onChangeText={(text) => {
              setupStore.setGlassCapacity(parseInt(text));
            }}
            placeholder={"0"}
          />
        </View>
        <View>
          <Text>Daily water requirement, in ml.:</Text>
          <Input
            keyboardType={"numeric"}
            value={setupStore.minimumWater as unknown as string}
            onChangeText={(text) => {
              setupStore.setGlassCapacity(parseInt(text));
            }}
            placeholder={"0"}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
