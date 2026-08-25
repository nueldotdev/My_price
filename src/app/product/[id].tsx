import { cardList } from "@/constants/demo-data";
import { Colors } from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const colors = Colors.light;

export default function ProductSummary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = cardList.find((item) => String(item.id) === id);

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
        <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>
      </View>

      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.main}>
          {product.img && <Image source={product.img} style={styles.image} />}
          <Text style={styles.eyebrow}>PRODUCT SUMMARY</Text>
          <Text style={styles.title}>{product.title}</Text>
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
              <Text style={styles.price}>${product.original_price}</Text>
            </View>
            <View>
              <Text style={styles.label}>Market average</Text>
              <Text style={styles.price}>${product.suggested_price}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Summary</Text>
          <Text style={styles.summary}>{product.summary}</Text>

          {product.details && product.details.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Details</Text>
              {product.details.map((detail) => (
                <Text key={detail} style={styles.detail}>
                  • {detail}
                </Text>
              ))}
            </>
          )}

          <Text style={styles.recorded}>
            Recorded {new Date(product.recordedAt).toLocaleString()}
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
    borderBottomWidth: 1
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
  backButton: { alignSelf: "flex-start", marginBottom: 24 },
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
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    boxShadow: `1px 2px 0px black`,
  },
  badgeText: { color: colors.text, fontSize: 13, fontWeight: "bold" },
  priceRow: { flexDirection: "row", gap: 36, marginTop: 28, marginBottom: 28 },
  label: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
  price: { color: colors.text, fontSize: 22, fontWeight: "bold" },
  sectionLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 8,
  },
  summary: { color: colors.text, fontSize: 16, lineHeight: 24 },
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
