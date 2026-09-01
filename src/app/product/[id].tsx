import { Colors } from "@/constants/theme";
import { getCheckById } from "@/lib/db";
import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import bold from "expo-symbols/androidWeights/bold";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const colors = Colors.light;

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

export default function ProductSummary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] =
    useState<Awaited<ReturnType<typeof getCheckById>>>(null);
  useEffect(() => {
    if (id) getCheckById(id).then(setProduct);
  }, [id]);

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Product not found</Text>
        <Pressable onPress={() => router.replace("/")} style={styles.button}>
          <Text style={styles.buttonText}>Back to products</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
        >
          <SymbolView
            name={{ ios: "arrow.left", android: "arrow_back" }}
            size={18}
            tintColor={colors.accent}
            weight={{ ios: "bold", android: bold }}
          />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.main}>
          {product.imageUri ? (
            <Image source={{ uri: product.imageUri }} style={styles.image} />
          ) : null}
          <Text style={styles.eyebrow}>PRODUCT SUMMARY</Text>
          <Text style={styles.title}>{product.productName}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors[`${product.verdict}Bg`] },
            ]}
          >
            <Text style={styles.badgeText}>
              {product.verdict === "goodDeal" && "Good Deal"}
              {product.verdict === "fair" && "Fair"}
              {product.verdict === "overpriced" && "Overpriced"}
              {product.verdict === "suspicious" && "Suspicious"}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.label}>Listed price</Text>
              <Text style={styles.price}>{formatNaira(product.pricePaid)}</Text>
            </View>
            <View>
              <Text style={styles.label}>Market average</Text>
              <Text style={styles.price}>
                {formatNaira(product.marketLow)} -{" "}
                {formatNaira(product.marketHigh)}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Summary</Text>
          <Text style={styles.summary}>{product.reasoning}</Text>

          <Text style={styles.recorded}>
            Recorded {new Date(product.createdAt).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 40 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 0,
    backgroundColor: colors.backgroundElement,
    borderBottomWidth: 1,
  },
  main: {
    padding: 24,
    borderRadius: 10,
    backgroundColor: colors.backgroundElement,
    borderWidth: 2,
    boxShadow: `4px 4px 0px black`,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.accent,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backIcon: { color: colors.accent, fontSize: 18, fontWeight: "bold" },
  backText: { color: colors.accent, fontSize: 16, fontWeight: "bold" },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 2,
    boxShadow: `1px 2px 0px black`,
  },
  eyebrow: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 6,
    marginBottom: 14,
    flexShrink: 1,
    maxWidth: "100%",
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    boxShadow: `1px 2px 0px black`,
    maxWidth: "100%",
  },
  badgeText: { color: colors.text, fontSize: 13, fontWeight: "bold" },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 36,
    rowGap: 16,
    marginTop: 28,
    marginBottom: 28,
  },
  label: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
  price: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "bold",
    flexShrink: 1,
    maxWidth: "100%",
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 8,
  },
  summary: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    flexShrink: 1,
    maxWidth: "100%",
  },
  detail: { color: colors.textSecondary, fontSize: 15, lineHeight: 24 },
  recorded: { color: colors.textTertiary, fontSize: 12, marginTop: 28 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 16,
  },
  buttonText: { color: "#ffffff", fontWeight: "bold" },
});
