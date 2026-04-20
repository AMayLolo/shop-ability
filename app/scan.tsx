import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import BigButton from '@/components/BigButton';
import { AppTheme, Colors, Fonts } from '@/constants/theme';
import { useAppContext } from '@/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  SUPPORTED_BARCODE_TYPES,
  buildPriceCandidate,
  extractVisionPrice,
  isVisionExtractionConfigured,
  preprocessScanImage,
  scanBarcodesFromImage,
} from '@/services/price-scanner';
import type { CartCategory, CartPriority, PriceScanCandidate } from '@/types';
import { formatCurrency } from '@/utils/tax';

const defaultPriority: CartPriority = 'core';

function announce(message: string) {
  AccessibilityInfo.announceForAccessibility(message);
}

export default function ScanScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { addCartItem } = useAppContext();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [isTorchEnabled, setIsTorchEnabled] = useState(false);
  const [liveBarcode, setLiveBarcode] = useState<string | undefined>();
  const [candidate, setCandidate] = useState<PriceScanCandidate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualCategory, setManualCategory] = useState<CartCategory>('pantry');
  const [saveMessage, setSaveMessage] = useState('');

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (isProcessing) {
      return;
    }

    setLiveBarcode(result.data);
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setSaveMessage('');

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: true,
        skipProcessing: Platform.OS === 'android',
      });

      if (!photo?.uri) {
        setCandidate(null);
        announce('No image was captured. Please try again.');
        return;
      }

      const processedImage = await preprocessScanImage(photo.uri);
      const imageBarcodes = await scanBarcodesFromImage(processedImage.uri);
      const visionExtraction = await extractVisionPrice(processedImage.base64 ?? photo.base64 ?? null);

      const resolvedCandidate = buildPriceCandidate({
        liveBarcode,
        captureBarcode: imageBarcodes[0]?.data,
        imageUri: processedImage.uri,
        visionExtraction,
      });

      setCandidate(resolvedCandidate);

      if (resolvedCandidate) {
        const resolvedName =
          resolvedCandidate.title === 'Unknown product' ? '' : resolvedCandidate.title;
        const resolvedPrice =
          typeof resolvedCandidate.estimatedPrice === 'number'
            ? resolvedCandidate.estimatedPrice.toFixed(2)
            : '';

        setManualName(resolvedName);
        setManualPrice(resolvedPrice);
        setManualCategory(resolvedCandidate.category ?? 'pantry');

        announce(
          resolvedPrice
            ? `${resolvedName || 'Item'} detected at ${formatCurrency(Number(resolvedPrice))}. Review and add to cart.`
            : `${resolvedName || 'Item'} detected. Price still needs review.`,
        );
      } else {
        announce('No item could be extracted. Please line up the price label and try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const addScannedItemToCart = () => {
    const trimmedName = manualName.trim();
    const parsedPrice = Number.parseFloat(manualPrice);

    if (!trimmedName || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      const message = 'Please review the item name and price before adding it to the cart.';
      setSaveMessage(message);
      announce(message);
      return;
    }

    addCartItem({
      name: trimmedName,
      price: parsedPrice,
      quantity: 1,
      category: manualCategory,
      priority: defaultPriority,
      barcode: candidate?.normalizedBarcode,
      source: 'scanner',
    });

    const successMessage = `${trimmedName} added to cart at ${formatCurrency(parsedPrice)}.`;
    setSaveMessage(successMessage);
    announce(successMessage);
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tintStrong} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <View style={[styles.permissionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera access is required</Text>
          <Text style={[styles.permissionBody, { color: colors.icon }]}>
            This scanner uses a live barcode pass, a captured-image verification pass, and optional
            vision extraction so users can get pricing with fewer manual steps.
          </Text>
          <BigButton
            label="Enable camera"
            caption="Allow access to scan products and shelf labels"
            onPress={() => {
              void requestPermission();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.kicker, { color: colors.tintStrong }]}>Accessible scan flow</Text>
          <Text style={[styles.title, { color: colors.text }]}>Scan fast, verify once, add straight to cart.</Text>
          <Text style={[styles.body, { color: colors.icon }]}>
            This flow combines barcode evidence and image-based price extraction. The result is kept
            intentionally simple so someone under time pressure or cognitive load can confirm the
            price quickly and move on.
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isVisionExtractionConfigured() ? colors.accentSoft : colors.surfaceMuted,
                borderColor: isVisionExtractionConfigured() ? colors.accent : colors.border,
              },
            ]}>
            <Text style={[styles.statusText, { color: colors.text }]}>
              {isVisionExtractionConfigured()
                ? 'Backend price proxy is enabled'
                : 'Needs EXPO_PUBLIC_PRICE_PROXY_URL'}
            </Text>
          </View>
        </View>

        <View style={[styles.cameraShell, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            enableTorch={isTorchEnabled}
            barcodeScannerSettings={{ barcodeTypes: SUPPORTED_BARCODE_TYPES }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View style={styles.overlay}>
            <View style={[styles.finder, { borderColor: colors.tintStrong }]} />
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsTorchEnabled((current) => !current)}
            style={[
              styles.controlChip,
              {
                backgroundColor: isTorchEnabled ? colors.tintStrong : colors.surfaceMuted,
                borderColor: isTorchEnabled ? colors.tintStrong : colors.border,
              },
            ]}>
            <Text style={[styles.controlText, { color: isTorchEnabled ? '#FFF8F1' : colors.text }]}>
              {isTorchEnabled ? 'Torch on' : 'Torch off'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setLiveBarcode(undefined);
              setCandidate(null);
              setManualName('');
              setManualPrice('');
              setSaveMessage('');
            }}
            style={[
              styles.controlChip,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[styles.controlText, { color: colors.text }]}>Reset result</Text>
          </Pressable>
        </View>

        <BigButton
          label={isProcessing ? 'Reading the price...' : 'Capture and read price'}
          caption="Take one clear photo of the label or package"
          onPress={() => {
            void handleCapture();
          }}
        />

        <View style={[styles.metaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.metaLabel, { color: colors.icon }]}>Live barcode</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {liveBarcode ?? 'Point the camera at a barcode or shelf label'}
          </Text>
        </View>

        {candidate ? (
          <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.resultKicker, { color: colors.tintStrong }]}>Best match</Text>
            <Text style={[styles.resultTitle, { color: colors.text }]}>{candidate.title}</Text>
            <Text style={[styles.resultBody, { color: colors.icon }]}>
              Confidence {Math.round(candidate.confidence * 100)}%
              {candidate.extractedPriceText ? ` · Saw ${candidate.extractedPriceText}` : ''}
            </Text>

            {candidate.extractionSummary ? (
              <View style={[styles.summaryBanner, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.summaryText, { color: colors.text }]}>{candidate.extractionSummary}</Text>
              </View>
            ) : null}

            {candidate.imageUri ? (
              <Image source={{ uri: candidate.imageUri }} style={styles.previewImage} contentFit="cover" />
            ) : null}

            <View style={styles.reviewSection}>
              <Text style={[styles.reviewTitle, { color: colors.text }]}>Quick review</Text>
              <TextInput
                accessibilityLabel="Item name"
                value={manualName}
                onChangeText={setManualName}
                placeholder="Product name"
                placeholderTextColor={colors.icon}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceMuted },
                ]}
              />
              <TextInput
                accessibilityLabel="Item price"
                value={manualPrice}
                onChangeText={setManualPrice}
                keyboardType="decimal-pad"
                placeholder="Shelf price"
                placeholderTextColor={colors.icon}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceMuted },
                ]}
              />
              <View style={styles.categoryRow}>
                {(['produce', 'protein', 'pantry', 'household'] as CartCategory[]).map((category) => (
                  <Pressable
                    key={category}
                    accessibilityRole="button"
                    onPress={() => setManualCategory(category)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: manualCategory === category ? colors.tintStrong : colors.surfaceMuted,
                        borderColor: manualCategory === category ? colors.tintStrong : colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.categoryText,
                        { color: manualCategory === category ? '#FFF8F1' : colors.text },
                      ]}>
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={[styles.reviewHint, { color: colors.icon }]}>
                {manualPrice
                  ? `Ready to add at ${formatCurrency(Number(manualPrice) || 0)}`
                  : 'If the price is wrong or blank, correct it here before adding.'}
              </Text>
            </View>

            <BigButton
              label="Add item to cart"
              caption="Save this scan into the live shopping list"
              onPress={addScannedItemToCart}
            />

            {saveMessage ? (
              <View style={[styles.saveBanner, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.saveText, { color: colors.text }]}>{saveMessage}</Text>
              </View>
            ) : null}

            <View style={styles.signalStack}>
              {candidate.signals.map((signal) => (
                <View
                  key={`${signal.source}-${signal.detail}`}
                  style={[styles.signalRow, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[styles.signalSource, { color: colors.text }]}>{signal.source}</Text>
                  <Text style={[styles.signalDetail, { color: colors.icon }]}>
                    {Math.round(signal.confidence * 100)}% · {signal.detail}
                  </Text>
                </View>
              ))}
            </View>

            {candidate.reviewNotes.length ? (
              <View style={styles.noteStack}>
                {candidate.reviewNotes.map((note) => (
                  <Text key={note} style={[styles.noteText, { color: colors.icon }]}>
                    • {note}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        <BigButton
          label="Close scanner"
          caption="Return to the dashboard"
          variant="secondary"
          onPress={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 40,
  },
  permissionCard: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    gap: 14,
    maxWidth: 520,
    padding: 22,
  },
  permissionTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
    fontWeight: '700',
  },
  permissionBody: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  header: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    gap: 10,
    padding: 20,
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    lineHeight: 36,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  statusBadge: {
    borderRadius: AppTheme.radius.pill,
    borderWidth: 1,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  cameraShell: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    height: 300,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  finder: {
    borderRadius: AppTheme.radius.md,
    borderWidth: 2,
    height: 140,
    width: '78%',
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  controlChip: {
    borderRadius: AppTheme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  controlText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  metaCard: {
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  metaLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '700',
  },
  resultCard: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    gap: 14,
    padding: 20,
  },
  resultKicker: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  resultTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 26,
    fontWeight: '700',
  },
  resultBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryBanner: {
    borderRadius: AppTheme.radius.md,
    padding: 14,
  },
  summaryText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  previewImage: {
    borderRadius: AppTheme.radius.md,
    height: 180,
    overflow: 'hidden',
    width: '100%',
  },
  reviewSection: {
    gap: 10,
  },
  reviewTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    fontFamily: Fonts.sans,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    borderRadius: AppTheme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  reviewHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  saveBanner: {
    borderRadius: AppTheme.radius.md,
    padding: 14,
  },
  saveText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  signalStack: {
    gap: 10,
  },
  signalRow: {
    borderRadius: AppTheme.radius.md,
    gap: 4,
    padding: 14,
  },
  signalSource: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  signalDetail: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  noteStack: {
    gap: 6,
  },
  noteText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
  },
});
