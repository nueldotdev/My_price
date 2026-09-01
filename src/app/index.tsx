import Cards from "@/components/cards";
import { Colors } from "@/constants/theme";
import { PriceCheck, deleteCheck, getChecks } from "@/lib/db";
import { Link, router, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import bold from "expo-symbols/androidWeights/bold";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

const colors = Colors.light;

const getDateKey = (recordedAt: number): string => {
  const date = new Date(recordedAt);

  return [date.getFullYear(), date.getMonth(), date.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");
};

const formatSectionDate = (recordedAt: number): string =>
  new Date(recordedAt).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export default function Index() {
  const [checks, setChecks] = useState<PriceCheck[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const refreshChecks = useCallback(() => {
    getChecks()
      .then(setChecks)
      .catch(() => setChecks([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshChecks();
    }, [refreshChecks]),
  );
  const sections = Object.values(
    checks.reduce<Record<string, PriceCheck[]>>((groups, item) => {
      const dateKey = getDateKey(item.createdAt);
      groups[dateKey] ??= [];
      groups[dateKey].push(item);
      return groups;
    }, {}),
  )
    .map((data) => ({
      title: formatSectionDate(data[0].createdAt),
      dateKey: getDateKey(data[0].createdAt),
      data,
    }))
    .sort((first, second) => second.dateKey.localeCompare(first.dateKey));

  const isSelectionMode = selectedIds.length > 0;

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedIds.length) {
      return;
    }

    Alert.alert(
      "Delete selected summaries?",
      `This will remove ${selectedIds.length} saved summary${selectedIds.length > 1 ? "ies" : ""}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await Promise.all(selectedIds.map((id) => deleteCheck(id)));
            setSelectedIds([]);
            refreshChecks();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.eyebrow}>PRICE CHECKS</Text>
          <Text style={styles.heading}>Your products</Text>
        </View>
        {isSelectionMode ? (
          <Pressable onPress={handleDeleteSelected} style={styles.deleteButton}>
            <SymbolView
              name={{ ios: "trash", android: "delete" }}
              size={20}
              tintColor={colors.accent}
              weight={{ ios: "bold", android: bold }}
            />
            {/* <Text style={styles.deleteButtonText}>Delete</Text> */}
          </Pressable>
        ) : null}
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Cards
            card={{
              id: item.id,
              recordedAt: new Date(item.createdAt).toISOString(),
              img: item.imageUri ? { uri: item.imageUri } : undefined,
              original_price: item.pricePaid,
              suggested_price: (item.marketLow + item.marketHigh) / 2,
              title: item.productName,
              summary: item.reasoning,
              verdict: item.verdict,
            }}
            style={styles.card}
            isSelected={selectedIds.includes(item.id)}
            onLongPress={() => toggleSelection(item.id)}
            onPress={() => {
              if (isSelectionMode) {
                toggleSelection(item.id);
                return;
              }

              router.push({
                pathname: "/product/[id]",
                params: { id: item.id },
              });
            }}
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
          <SymbolView
            name={{ ios: "plus", android: "add" }}
            size={30}
            tintColor={colors.text}
            weight={{ ios: "bold", android: bold }}
          />
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
    paddingBottom: 100,
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
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: colors.backgroundElement,
    borderBottomWidth: 1,
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
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 50,
    right: 20,
    boxShadow: `3px 3px 0px black`,
    borderWidth: 1,
    paddingTop: 3,
    paddingLeft: 5,
  },
  addButtonText: {
    color: colors.text,
    fontWeight: "bold",
  },
  addButtonIcon: {
    color: colors.text,
    fontSize: 50,
    fontWeight: "700",
    lineHeight: 30,
  },
  deleteButton: {
    backgroundColor: "transparent",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // borderWidth: 1,
    color: colors.accent,
    // borderColor: colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  deleteButtonIcon: {
    color: "#3D5AFE",
    fontSize: 16,
    lineHeight: 16,
  },
  deleteButtonText: {
    color: colors.accent,
    fontWeight: "bold",
  },
});
