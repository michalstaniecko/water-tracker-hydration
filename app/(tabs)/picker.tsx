import { View, ScrollView } from "react-native";
import PickerWheel from "@/components/ui/PickerWheel";
import Modal from "@/components/ui/Modal";
import { useState } from "react";

const data = Array.from({ length: 19 }, (_, i) => ({
  key: `item-${i}`,
  value: `${50 + i * 25}`,
  label: `${50 + i * 25} ml`,
}));
export default function Picker() {
  const [visible, setVisible] = useState(true);
  return (
    <ScrollView>
      <Modal visible={visible} onDismiss={setVisible}>
        <PickerWheel options={data} />
      </Modal>
    </ScrollView>
  );
}
