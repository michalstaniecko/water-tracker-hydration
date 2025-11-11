import {
  Modal as RNModal,
  TouchableWithoutFeedback,
  View,
  Text,
} from "react-native";
import Button from "@/components/ui/Button";

type ModalProps = {
  visible?: boolean;
  children: React.ReactNode;
  onDismiss?: (visible: boolean) => void;
  closeText?: string;
};
export default function Modal({
  children,
  visible = false,
  onDismiss,
  closeText = "Close",
}: ModalProps) {
  const handleClose = () => {
    onDismiss?.(false);
  };

  return (
    <RNModal animationType={"fade"} transparent={true} visible={visible}>
      <View className={" bg-gray-700/75 flex-1 justify-center p-5"}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className={"absolute top-0 left-0 right-0 bottom-0"} />
        </TouchableWithoutFeedback>
        <View className={"gap-3"}>
          <View className={"bg-white p-5 rounded-lg shadow-sm"}>
            {children}
          </View>
          <View>
            <Button text={closeText} onPress={handleClose} />
          </View>
        </View>
      </View>
    </RNModal>
  );
}

export const ModalHeader = ({ title }: { title: string }) => {
  return (
    <View className={"mb-3"}>
      <Text
        className={"uppercase text-sm font-semibold text-gray-800 text-center"}
      >
        {title}
      </Text>
    </View>
  );
};
