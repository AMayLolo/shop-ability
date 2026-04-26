import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import AppScreen from '@/components/AppScreen';
import BigButton from '@/components/BigButton';
import SectionCard from '@/components/SectionCard';
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
  const autoCaptureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSubmittedBarcodeRef = useRef<string | null>(null);
  const hasVisionExtraction = isVisionExtractionConfigured();

  useEffect(() => {
    return () => {
      if (autoCaptureTimeoutRef.current) {
        clearTimeout(autoCaptureTimeoutRef.current);
      }
    };
  }, []);

  const completeScan = ({
    itemName,
    price,
    category,
    barcode,
  }: {
    itemName: string;
    price: number;
    category: CartCategory;
    barcode?: string;
  }) => {
    addCartItem({
      name: itemName,
      price,
      quantity: 1,
      category,
      priority: defaultPriority,
      barcode,
      source: 'scanner',
    });

    const successMessage = `${itemName} added to cart at ${formatCurrency(price)}.`;
    setSaveMessage(successMessage);
    announce(successMessage);
    router.replace('/explore');
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (isProcessing) {
      return;
    }

    setLiveBarcode(result.data);

    if (lastSubmittedBarcodeRef.current === result.data || autoCaptureTimeoutRef.current) {
      return;
    }

    autoCaptureTimeoutRef.current = setTimeout(() => {
      autoCaptureTimeoutRef.current = null;
      void handleCapture(result.data);
    }, 450);
  };

  const handleCapture = async (barcodeOverride?: string) => {
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
      const activeBarcode = barcodeOverride ?? liveBarcode;

      const resolvedCandidate = buildPriceCandidate({
        liveBarcode: activeBarcode,
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

        if (resolvedName && resolvedPrice) {
          lastSubmittedBarcodeRef.current = activeBarcode ?? resolvedCandidate.normalizedBarcode;
          completeScan({
            itemName: resolvedName,
            price: Number(resolvedPrice),
            category: resolvedCandidate.category ?? 'pantry',
            barcode: resolvedCandidate.normalizedBarcode,
          });
          return;
        }

        announce(
          resolvedPrice
            ? `${resolvedName || 'Item'} detected at ${formatCurrency(Number(resolvedPrice))}. Review and add to cart.`
            : `${resolvedName || 'Item'} detected. Price still needs review.`,
        );
      } else {
        announce('No item could be extracted. Please line up the price label and try again.');
      }
    } catch {
      setCandidate(null);
      const message = 'The camera could not finish scanning this item. Try again with the label centered.';
      setSaveMessage(message);
      announce(message);
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

    lastSubmittedBarcodeRef.current = candidate?.normalizedBarcode ?? null;
    const successMessage = `${trimmedName} added to cart at ${formatCurrency(parsedPrice)}.`;
    setSaveMessage(successMessage);
    announce(successMessage);
    router.replace('/explore');
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
        <SectionCard
          kicker="Scanner"
          title="Camera access is required"
          body="Turn on the camera so the app can read barcodes and price labels.">
          <BigButton
            label="Enable camera"
            caption="Allow camera access"
            onPress={() => {
              void requestPermission();
            }}
          />
        </SectionCard>
      </SafeAreaView>
    );
  }

  return (
    <AppScreen>
      <SectionCard
        kicker="Scanner"
        title="Point, scan, and review"
        body="Aim at the barcode or shelf label. When a price is found, the app can send the item straight to your cart."
      />

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
              if (autoCaptureTimeoutRef.current) {
                clearTimeout(autoCaptureTimeoutRef.current);
                autoCaptureTimeoutRef.current = null;
              }
              setLiveBarcode(undefined);
              setCandidate(null);
              setManualName('');
              setManualPrice('');
              setSaveMessage('');
              lastSubmittedBarcodeRef.current = null;
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
          label={isProcessing ? 'Reading price...' : 'Take picture'}
          caption="Scan this item now"
          onPress={() => {
            void handleCapture();
          }}
        />

        {!hasVisionExtraction ? (
          <View style={[styles.saveBanner, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.saveText, { color: colors.text }]}>
              Price-reading is not connected in this build yet. Barcode matches can still auto-add with saved prices.
            </Text>
          </View>
        ) : null}

        <SectionCard kicker="Scanner status" title={liveBarcode ?? 'Point at item or price'}>
          <Text style={[styles.statusBody, { color: colors.icon }]}>
            {liveBarcode ? 'Barcode found. Hold steady while the app reads the price.' : 'Center the barcode or price tag inside the frame.'}
          </Text>
        </SectionCard>

        {candidate ? (
          <SectionCard kicker="Best match" title={candidate.title}>
            <Text style={[styles.resultBody, { color: colors.icon }]}>
              {candidate.extractedPriceText ? `Price seen: ${candidate.extractedPriceText}` : 'Check the price below'}
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
              <Text style={[styles.reviewTitle, { color: colors.text }]}>Check</Text>
              <TextInput
                accessibilityLabel="Item name"
                value={manualName}
                onChangeText={setManualName}
                placeholder="Item name"
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
                placeholder="Price"
                placeholderTextColor={colors.icon}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceMuted },
                ]}
              />
              <Text style={[styles.reviewHint, { color: colors.icon }]}>
                {manualPrice
                  ? `Ready to add at ${formatCurrency(Number(manualPrice) || 0)}`
                  : 'Fix the price if needed.'}
              </Text>
            </View>

            <BigButton label="Add to cart" caption="Save item" onPress={addScannedItemToCart} />

            {saveMessage ? (
              <View style={[styles.saveBanner, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.saveText, { color: colors.text }]}>{saveMessage}</Text>
              </View>
            ) : null}

            {candidate.reviewNotes.length ? (
              <View style={styles.noteStack}>
                {candidate.reviewNotes.slice(0, 2).map((note) => (
                  <Text key={note} style={[styles.noteText, { color: colors.icon }]}>
                    • {note}
                  </Text>
                ))}
              </View>
            ) : null}
          </SectionCard>
        ) : null}

        <BigButton label="Go back" caption="Return home" variant="secondary" onPress={() => router.back()} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
  statusBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
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
  noteStack: {
    gap: 6,
  },
  noteText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
  },
});
