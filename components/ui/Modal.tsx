import { Modal as RNModal, TouchableWithoutFeedback, View } from "react-native";
import { useState } from "react";

type ModalProps = {
  visible?: boolean;
  children: React.ReactNode;
  onDismiss?: (visible: boolean) => void;
};
export default function Modal({
  children,
  visible = false,
  onDismiss,
}: ModalProps) {
  const handleClose = () => {
    onDismiss?.(false);
  };

  return (
    <RNModal animationType={"fade"} transparent={true} visible={visible}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View className={"absolute top-0 left-0 right-0 bottom-0 "} />
      </TouchableWithoutFeedback>
      <View className={"flex-1 justify-center"}>
        <View className={"bg-white p-5 rounded-lg"}>{children}</View>
      </View>
    </RNModal>
  );
}
