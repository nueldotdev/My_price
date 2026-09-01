import { Colors } from "@/constants/theme";
import { saveCheck } from "@/lib/db";
import {
  analyzePrice,
  extractProductInfoFromLink,
  normalizePriceInput,
} from "@/lib/gemini";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import bold from "expo-symbols/androidWeights/bold";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const colors = Colors.light;

export default function UploadProduct() {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Allow photo access to choose an item image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Allow camera access to photograph an item.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const analyzeLink = async () => {
    if (!link.trim()) {
      Alert.alert(
        "Enter a valid link",
        "Include the full link, such as https://example.com/item.",
      );
      return;
    }

    try {
      const parsedUrl = new URL(link.trim());
      const extracted = await extractProductInfoFromLink(parsedUrl.toString());

      setDescription(
        extracted.description ||
          `${extracted.productName} from ${parsedUrl.hostname.replace("www.", "")}`,
      );
      if (extracted.price) {
        setPrice(normalizePriceInput(extracted.price));
      }

      Alert.alert(
        "Link analyzed",
        "The item details were filled into the form.",
      );
    } catch (error) {
      Alert.alert(
        "Could not extract details",
        error instanceof Error
          ? error.message
          : "Try a different link or enter the details manually.",
      );
    }
  };

  const cacheImageForStorage = async (uri: string): Promise<string> => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 900 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );

    const destination = `${FileSystem.Paths.cache.uri}price-check-${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: manipulated.uri, to: destination });
    return destination;
  };

  const submitProduct = async () => {
    if (!description.trim() && !link.trim() && !imageUri) {
      Alert.alert(
        "Add some information",
        "Add a description, link, or photo before submitting.",
      );
      return;
    }

    if (imageUri && !description.trim() && !link.trim()) {
      Alert.alert(
        "Add some details",
        "Gemini needs a description or link to analyze this item.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await analyzePrice({ description, link, price });
      const storedImageUri = imageUri
        ? await cacheImageForStorage(imageUri)
        : undefined;

      await saveCheck({
        ...result,
        source: imageUri ? "image" : result.source,
        imageUri: storedImageUri || result.imageUri,
      });

      Alert.alert("Analysis complete", "Your price check has been saved.", [
        { text: "View checks", onPress: () => router.replace("/") },
      ]);
    } catch (error) {
      Alert.alert(
        "Could not analyze item",
        error instanceof Error ? error.message : "Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.main}>
          <Text style={styles.eyebrow}>NEW PRICE CHECK</Text>
          <Text style={styles.title}>Add an item</Text>
          <Text style={styles.intro}>
            Give us what you know. We will use it to build a price summary.
          </Text>

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What are you thinking of buying?"
            placeholderTextColor={colors.textTertiary}
            multiline
            style={[styles.input, styles.multiline]}
          />

          <Text style={styles.label}>Listed price</Text>
          <TextInput
            value={price}
            onChangeText={(nextValue) =>
              setPrice(normalizePriceInput(nextValue))
            }
            placeholder="₦0.00"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Item link</Text>
          <KeyboardAvoidingView style={styles.linkRow}>
            <TextInput
              value={link}
              onChangeText={setLink}
              placeholder="https://..."
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              keyboardType="url"
              style={[styles.input, styles.linkInput]}
            />
            <Pressable
              onPress={analyzeLink}
              style={[styles.smallButton, styles.shadow]}
            >
              <SymbolView
                name={{ ios: "magnifyingglass", android: "search" }}
                size={14}
                tintColor="#ffffff"
                weight={{ ios: "bold", android: bold }}
              />
              <Text style={styles.smallButtonText}>Analyze</Text>
            </Pressable>
          </KeyboardAvoidingView>

          <Text style={styles.label}>Photo</Text>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : null}
          <View style={styles.photoRow}>
            <Pressable
              onPress={takePhoto}
              style={[styles.outlineButton, styles.shadow]}
            >
              <SymbolView
                name={{ ios: "camera.fill", android: "photo_camera" }}
                size={16}
                tintColor={colors.accent}
                weight={{ ios: "bold", android: bold }}
              />
              <Text style={styles.outlineButtonText}>Take photo</Text>
            </Pressable>
            <Pressable
              onPress={chooseImage}
              style={[styles.outlineButton, styles.shadow]}
            >
              <SymbolView
                name={{
                  ios: "photo.on.rectangle.angled",
                  android: "photo_library",
                }}
                size={16}
                tintColor={colors.accent}
                weight={{ ios: "bold", android: bold }}
              />
              <Text style={styles.outlineButtonText}>Choose photo</Text>
            </Pressable>
          </View>

          <Pressable
            disabled={isSubmitting}
            onPress={submitProduct}
            style={[
              styles.submitButton,
              styles.shadow,
              isSubmitting && styles.disabledButton,
            ]}
          >
            <SymbolView
              name={{
                ios: isSubmitting ? "hourglass" : "checkmark.circle.fill",
                android: isSubmitting ? "hourglass_top" : "check_circle",
              }}
              size={18}
              tintColor="#ffffff"
              weight={{ ios: "bold", android: bold }}
            />
            <Text style={styles.submitText}>
              {isSubmitting ? "Analyzing..." : "Analyze and save"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 30, paddingBottom: 48 },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backIcon: { color: colors.accent, fontSize: 18, fontWeight: "bold" },
  backText: { color: colors.accent, fontSize: 16, fontWeight: "bold" },
  eyebrow: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
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
  title: { color: colors.text, fontSize: 30, fontWeight: "bold", marginTop: 6 },
  intro: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 28,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 7,
    marginTop: 16,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.backgroundElement,
    color: colors.text,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
  },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  linkInput: { flex: 1 },
  smallButton: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  smallButtonIcon: { color: "#ffffff", fontSize: 14, fontWeight: "bold" },
  smallButtonText: { color: "#ffffff", fontWeight: "bold", fontSize: 12 },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
  },
  photoRow: { flexDirection: "row", gap: 10 },
  outlineButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 6,
    paddingVertical: 13,
  },
  outlineButtonIcon: { color: colors.accent, fontSize: 16 },
  outlineButtonText: { color: colors.accent, fontWeight: "bold" },
  submitButton: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingVertical: 15,
    marginTop: 30,
  },
  submitIcon: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
  submitText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  disabledButton: { opacity: 0.6 },
  shadow: {
    borderWidth: 2,
    boxShadow: `4px 4px 0px black`,
  },
});
