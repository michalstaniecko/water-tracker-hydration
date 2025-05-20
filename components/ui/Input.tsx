import {
  TextInput,
  Text,
  KeyboardTypeOptions,
  View,
  Pressable,
} from "react-native";
import { Keyboard } from "react-native";
import { RefObject, useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  className?: string;
  onBlur?: (text: string) => void;
  label?: string;
};

export default function Input({
  value: initValue,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  className,
  onBlur,
  label,
}: Props) {
  const [value, setValue] = useState(`${initValue}`);
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<TextInput>(null);

  function changeHandler(text: string) {
    setValue(text);
    onChangeText?.(text);
  }
  function blurHandler() {
    setIsFocused(false);
    onBlur?.(value);
  }

  function focusHandler() {
    setIsFocused(true);
    ref.current?.focus();
  }

  useEffect(() => {
    Keyboard.addListener("keyboardDidHide", blurHandler);

    return () => {
      Keyboard.removeAllListeners("keyboardDidHide");
    };
  }, []);

  useEffect(() => {
    setValue(`${initValue}`);
  }, [initValue]);
  return (
    <View>
      {label && (
        <Text className={`text-sm font-medium ${isFocused && "text-blue-700"}`}>
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        className={`h-[32] py-0 border-b-2 font-medium focus:border-blue-700 ${className}`}
        value={value}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onSubmitEditing={Keyboard.dismiss}
        onChangeText={changeHandler}
        onFocus={focusHandler}
        onBlur={blurHandler}
      />
    </View>
  );
}
