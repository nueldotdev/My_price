import Cards from "@/components/cards";
import { cardList } from "@/constants/demo-data";
import { card } from "@/constants/prop";
import { Colors } from "@/constants/theme";
import { Link, router } from "expo-router";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";

const colors = Colors.light;

const getDateKey = (recordedAt: string): string => {
  const date = new Date(recordedAt);

  return [date.getFullYear(), date.getMonth(), date.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");
};

const formatSectionDate = (recordedAt: string): string =>
  new Date(recordedAt).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const sections = Object.values(
  cardList.reduce<Record<string, card[]>>((groups, item) => {
    const dateKey = getDateKey(item.recordedAt);
    groups[dateKey] ??= [];
    groups[dateKey].push(item);
    return groups;
  }, {}),
)
  .map((data) => ({
    title: formatSectionDate(data[0].recordedAt),
    dateKey: getDateKey(data[0].recordedAt),
    data: data.sort(
      (first, second) =>
        new Date(second.recordedAt).getTime() -
        new Date(first.recordedAt).getTime(),
    ),
  }))
  .sort((first, second) => second.dateKey.localeCompare(first.dateKey));

export default function Index() {
  // const scheme = useColorScheme();
  // const isDarkMode = scheme === "dark";
  // const colors = Colors[scheme === 'unspecified' ? 'dark' : scheme];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.eyebrow}>PRICE CHECKS</Text>
          <Text style={styles.heading}>Your products</Text>
        </View>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Cards
            card={item}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/product/[id]",
                params: { id: String(item.id) },
              })
            }
          />
        )}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator
      />
      <Link href="/upload" asChild>
          <Pressable style={styles.addButton} accessibilityRole="button">
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // flexDirection: 'column'
    // 
  },
  scrollView: {
    flex: 1,
  },
  content: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingBottom: 100
  },
  sectionHeader: {
    marginTop: 30,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  card: {
    width: "100%",
    backgroundColor: colors.backgroundElement,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: colors.backgroundElement,
    borderBottomWidth: 1
  },
  eyebrow: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: colors.backgroundElement,
    borderRadius: 7,
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: "absolute",
    bottom: 50,
    right: 20,
    boxShadow: `3px 3px 0px black`,
    borderWidth: 1
  },
  addButtonText: {
    color: colors.text,
    fontWeight: "bold",
  },
});
