import { TextInput, KeyboardTypeOptions } from "react-native";
import { Keyboard } from "react-native";
import { useState } from "react";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  className?: string;
};

export default function Input({
  value: initValue,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  className,
}: Props) {
  const [value, setValue] = useState(initValue.toString());
  function changeHandler(text: string) {
    setValue(text);
    onChangeText?.(text);
  }
  return (
    <TextInput
      style={{
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        paddingLeft: 8,
      }}
      className={className}
      value={value}
      onChangeText={changeHandler}
      placeholder={placeholder}
      onSubmitEditing={Keyboard.dismiss}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
    />
  );
}
