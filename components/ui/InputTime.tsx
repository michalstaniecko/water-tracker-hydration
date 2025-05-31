import DatePicker from "react-native-date-picker";
import { Pressable, Text, View } from "react-native";
import { useState, useCallback } from "react";
import { convertDateToFormat } from "@/utils/date";
import { Label } from "@/components/ui/Label";
import dayjs from "@/plugins/dayjs";

type MinuteInterval = 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;

type Props = {
  value?: string;
  onChange?: (time: string) => void;
  format?: string;
  label?: string;
  minuteInterval?: MinuteInterval;
  confirmText?: string;
  cancelText?: string;
};

export default function InputTime({
  value: initValue = "00:00",
  onChange,
  format = "HH:mm",
  label = "Select Time",
  minuteInterval = 10,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: Props) {
  const [selectedTime, setSelectedTime] = useState<Date>(() => {
    let parsedValue = initValue;
    if (!parsedValue?.toString().includes(":")) {
      parsedValue = `00:00`;
    }
    return dayjs(parsedValue, format).toDate();
  });
  const [open, setOpen] = useState(false);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const handleConfirm = useCallback(
    (date: Date) => {
      setSelectedTime(date);
      setOpen(false);
      onChange?.(convertDateToFormat(date, format));
    },
    [format, onChange],
  );

  const dateToDisplay = useCallback(convertDateToFormat, []);

  return (
    <View>
      <Pressable onPress={() => setOpen(true)}>
        <Label>{label}</Label>
        <Text className={"leading-[32px] py-0 border-b-2 font-normal"}>
          {dateToDisplay(selectedTime, format)}
        </Text>
      </Pressable>
      <DatePicker
        title={label}
        confirmText={confirmText}
        cancelText={cancelText}
        date={selectedTime}
        modal={true}
        open={open}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        minuteInterval={minuteInterval}
        mode={"time"}
      />
    </View>
  );
}
