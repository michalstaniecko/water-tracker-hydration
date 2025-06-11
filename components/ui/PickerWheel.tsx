import { useEffect, useMemo } from "react";
import {
  Text,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TextInput,
} from "react-native";
import Animated, {
  scrollTo,
  useAnimatedRef,
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  interpolate,
  SharedValue,
  useScrollViewOffset,
  useAnimatedScrollHandler,
  useAnimatedProps,
} from "react-native-reanimated";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";

// TODO: Replace with your own initial value
const ITEM_HEIGHT = 50;
const ITEMS_OFFSET = 2;

type PickerWheelOption = {
  key?: string;
  label: string;
  value: string;
};

type PickerWheelProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  options: PickerWheelOption[];
};

type PickerWheelItemProps = {
  children: string;
  scroll: SharedValue<number>;
  index: number;
};

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const PickerWheelItem = ({ children, scroll, index }: PickerWheelItemProps) => {
  // TODO: Replace with your own initial value
  const inputRange = [
    (index - 4) * ITEM_HEIGHT,
    (index - 3) * ITEM_HEIGHT,
    (index - 2) * ITEM_HEIGHT,
    (index - 1) * ITEM_HEIGHT,
    index * ITEM_HEIGHT,
  ];
  const opacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      scroll.value,
      inputRange,
      [0.2, 0.35, 1, 0.35, 0.2],
      "clamp",
    ),
  }));
  const scale = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scroll.value,
          inputRange,
          [0.8, 0.9, 1, 0.9, 0.8],
          "clamp",
        ),
      },
    ],
  }));
  return (
    <Animated.View style={[scale, opacity, { height: ITEM_HEIGHT }]}>
      <Text style={{ padding: 10, fontSize: 18, textAlign: "center" }}>
        {children}
      </Text>
    </Animated.View>
  );
};

const PickerWheel = ({
  value: initValue,
  onValueChange,
  options: data,
}: PickerWheelProps) => {
  const initialOffset = useMemo<number>(() => {
    if (!initValue || !data.length) return 0;
    const initIndex = data.findIndex((d) => d.value === initValue);
    return initIndex !== -1 ? initIndex * ITEM_HEIGHT : 0;
  }, []);
  const animatedRef = useAnimatedRef<Animated.FlatList<Animated.View>>();
  const scroll = useSharedValue<number>(initialOffset);

  const paddedData = [
    ...Array(ITEMS_OFFSET).fill(null),
    ...data,
    ...Array(ITEMS_OFFSET).fill(null),
  ];

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < data.length) {
      onValueChange?.(data[index].value);
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scroll.value = event.contentOffset.y;
    },
    onMomentumBegin: () => {
      console.log("Momentum began");
    },
    onMomentumEnd: () => {
      console.log("Momentum ended");
    },
  });

  return (
    <Animated.FlatList
      onScroll={scrollHandler}
      ref={animatedRef}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      initialScrollIndex={Math.floor(initialOffset / ITEM_HEIGHT)}
      onMomentumScrollEnd={onMomentumScrollEnd}
      showsVerticalScrollIndicator={false}
      bounces={false}
      decelerationRate={"fast"}
      snapToInterval={ITEM_HEIGHT}
      style={{ height: ITEM_HEIGHT * (ITEMS_OFFSET * 2 + 1) }}
      data={paddedData}
      scrollEventThrottle={16}
      renderItem={({ item, index }) => (
        <PickerWheelItem scroll={scroll} index={index}>
          {item ? (item.label ? item.label : "") : ""}
        </PickerWheelItem>
      )}
    />
  );
};

export default PickerWheel;
