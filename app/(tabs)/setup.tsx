import { Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import Input from "@/components/ui/Input";
import { useSetupStore } from "@/stores/setup";

export default function Setup() {
  const setupStore = useSetupStore();
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, padding: 16 }}>
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
      </View>
    </TouchableWithoutFeedback>
  );
}
