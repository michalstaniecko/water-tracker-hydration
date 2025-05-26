import { View } from "react-native";
import { useEffect, useState } from "react";
import { Picker as PickerUI } from "@react-native-picker/picker";

type OptionProps = {
  label: string;
  value: string;
};

type Props = {
  options: OptionProps[];
  onChange: (value: string) => void;
  value?: string;
};

export default function Picker({ options, onChange, value: initValue }: Props) {
  const [value, setValue] = useState(initValue);

  useEffect(() => {
    setValue(initValue);
  }, [initValue]);

  return (
    <View className="flex-1">
      <PickerUI
        selectedValue={value}
        onValueChange={(itemValue) => {
          setValue(itemValue);
          onChange(itemValue);
        }}
        className="bg-white border border-gray-300 rounded-lg p-2"
      >
        {options.map((option) => (
          <PickerUI.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </PickerUI>
    </View>
  );
}
