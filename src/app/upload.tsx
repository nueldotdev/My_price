import { Colors } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
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

  const analyzeLink = () => {
    try {
      const hostname = new URL(link).hostname.replace("www.", "");
      setDescription(`Product details from ${hostname} will be analyzed here.`);
    } catch {
      Alert.alert(
        "Enter a valid link",
        "Include the full link, such as https://example.com/item.",
      );
    }
  };

  const submitProduct = () => {
    if (!description.trim() && !link.trim() && !imageUri) {
      Alert.alert(
        "Add some information",
        "Add a description, link, or photo before submitting.",
      );
      return;
    }

    Alert.alert("Item submitted", "Your product is ready to be analyzed.");
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
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
          onChangeText={setPrice}
          placeholder="$0.00"
          placeholderTextColor={colors.textTertiary}
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <Text style={styles.label}>Item link</Text>
        <View style={styles.linkRow}>
          <TextInput
            value={link}
            onChangeText={setLink}
            placeholder="https://..."
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            keyboardType="url"
            style={[styles.input, styles.linkInput]}
          />
          <Pressable onPress={analyzeLink} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>Analyze</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Photo</Text>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : null}
        <View style={styles.photoRow}>
          <Pressable onPress={takePhoto} style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>Take photo</Text>
          </Pressable>
          <Pressable onPress={chooseImage} style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>Choose photo</Text>
          </Pressable>
        </View>

        <Pressable onPress={submitProduct} style={styles.submitButton}>
          <Text style={styles.submitText}>Submit item</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 52, paddingBottom: 48 },
  backButton: { alignSelf: "flex-start", marginBottom: 24 },
  backText: { color: colors.accent, fontSize: 16, fontWeight: "bold" },
  eyebrow: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
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
  },
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
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 6,
    paddingVertical: 13,
  },
  outlineButtonText: { color: colors.accent, fontWeight: "bold" },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingVertical: 15,
    marginTop: 30,
  },
  submitText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
