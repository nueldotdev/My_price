import { card, Prop } from "@/constants/prop";
import { Colors } from "@/constants/theme";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface CardsProps extends Prop {
  card: card;
  onPress?: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
}

const formatNaira = (value?: number): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "₦0";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(value);
};

const colors = Colors.light;

const Cards = ({
  card,
  style,
  onPress,
  onLongPress,
  isSelected = false,
}: CardsProps) => {
  // calculate the difference between market avg and the given price
  const calcDiff = (price?: number, avg?: number): string => {
    if (price === undefined || avg === undefined || avg === 0) {
      return "N/A";
    }

    const difference = Math.round(Math.abs(((price - avg) / avg) * 100));

    if (difference === 0) {
      return "On Par";
    }

    return price > avg
      ? `+${difference}% Above Avg`
      : `+${difference}% Below Avg`;
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        style,
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "flex-start",
        }}
      >
        {card.img && <Image source={card.img} style={styles.image} />}
        <View
          style={{
            marginLeft: 10,
            flex: 1,
            minWidth: 0,
            justifyContent: "space-between",
            flexDirection: "column",
            paddingVertical: 8,
          }}
        >
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {card.title}
            </Text>
            <View
              style={[
                styles.verdictBadge,
                { backgroundColor: colors[`${card.verdict}Bg`] },
              ]}
            >
              <Text style={{ fontSize: 12 }}>
                {card.verdict == "goodDeal" && "Good Deal"}
                {card.verdict == "fair" && "Fair"}
                {card.verdict == "overpriced" && "Overpriced"}
                {card.verdict == "suspicious" && "Suspicious"}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              // marginTop: 4,
            }}
          >
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  columnGap: 5,
                  marginBottom: 5,
                }}
              >
                {/* <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  Price:
                </Text> */}
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.text,
                    fontWeight: "bold",
                  }}
                >
                  {formatNaira(card.original_price)}
                </Text>
                <View
                  style={{
                    alignItems: "flex-end",
                    borderWidth: 1,
                    paddingHorizontal: 5,
                    // paddingVertical: 5,
                    borderRadius: 1,
                    backgroundColor: colors[`${card.verdict}Bg`],
                    boxShadow: `1px 2px 0px black`,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.text }}>
                    {calcDiff(card.original_price, card.suggested_price)}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  columnGap: 2,
                }}
              >
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  Market Avg:
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {" "}
                  {formatNaira(card.suggested_price)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 16,
    borderRadius: 7,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 16,
    borderWidth: 2,
    boxShadow: `4px 4px 0px black`,
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: colors.backgroundSelected,
  },
  pressed: {
    opacity: 0.9,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    columnGap: 8,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: "bold",
  },
  verdictBadge: {
    flexShrink: 0,
    alignItems: "flex-end",
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 3,
    boxShadow: `1px 2px 0px black`,
  },
  image: {
    width: 70,
    height: "100%",
    borderRadius: 10,
    borderWidth: 1,
  },
});

export default Cards;
