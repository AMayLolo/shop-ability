import os

bigbutton_code = '''import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface BigButtonProps {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export function BigButton({ label, onPress, accessibilityLabel, disabled = false }: BigButtonProps) {
  const colorScheme = useColorScheme();
  const buttonColor = colorScheme === 'dark' ? '#FFD700' : '#0066CC';
  const buttonTextColor = colorScheme === 'dark' ? '#000000' : '#FFFFFF';
  const pressedColor = colorScheme === 'dark' ? '#FFC700' : '#0052A3';

  return (
    <Pressable onPress={onPress} disabled={disabled} accessible={true} accessibilityLabel={accessibilityLabel || label} accessibilityRole="button" accessibilityState={{ disabled }} style={({ pressed }) => [styles.button, { backgroundColor: pressed && !diimport os

bigbutton_code = '''impor o
bigbuttdisimport { Pressable, StyleSheet, View } from '(
import { ThemedText } from '@/components/themed-text';
impmeimport { useColorScheme } from '@/hooks/use-color-schol
export interface BigButtonProps {
  label: string;
  onPedT  label: string;
  onPress: () =    onPress: () =);  accessibilityLabel?yl  disabled?: boolean;
}

expoei}

export function Bcal:   const colorScheme = useColorScheme();
  const buttonColor = colorScheme === 'dark' ? '#FFD700' : 'se  const buttonColor = colorScheme === it  const buttonTextColor = colorScheme === 'dark' ? '#000000' : '#FFF '  const pressedColor = colorScheme === 'dark' ? '#FFC700' : '#0052A3';

er
  return (
    <Pressable onPress={onPress} disabled={disabled} acce36,    <Prign:
bigbutton_code = '''impor o
bigbuttdisimport { Pressable, StyleSheet, View } from '(
import { ThemedText } from '@/components/themed-text';
impmeimport { useColorScheme } from '@/hooks/use-color-schol
export interface BigButtonProps {
  label: string;
  onPedT  Thbigbuttdisimport { Pressabntimport { ThemedText } from '@/components/themed-text';
/Bimpmeimport { useColorScheme } from '@/hooks/use-coloe-export interface BigButtonPropsfunction EnterMoneyScreen() {
  const router = useRouter();
  co  onPedT  label =  onPress: () =    onPrns}

expoei}

export function Bcal:   const colorScheme = useColorScheme();
  count.
expor) r  const buttonColor = colorScheme === 'dark' ? '#FFD700' : ');
er
  return (
    <Pressable onPress={onPress} disabled={disabled} acce36,    <Prign:
bigbutton_code = '''impor o
bigbuttdisimport { Pressable, StyleSheet, View } from '(
import { ThemedText } from '@/components/themed-text';
impmeimport { dar '     <Pres5'bigbutton_code = '''impor o
bigbuttdisimport { Pressable, StyleSheet,  <bigbuttdisimport { Pressabonimport { ThemedText } from '@/components/themed-text';
 <impmeimport { useColorScheme } from '@/hooks/use-colo =export interface BigButtonProps {
  label: string;
  onPedT H  label: medText>
        </View>
  onPedT  Thbigst/Bimpmeimport { useColorScheme } from '@/hooks/use-coloe-export interface BigButtonPropsfunct==  const router = useRouter();
  co  onPedT  label =  onPress: () =    onPrns}

expoei}

export function Bcal:   conspu  co  onPedT ndColor: inputBgC
expoeborderColor: inputBorderColor, color: input
extColor  count.
expor) r  const buttonColor = colorScheme === 'dark= expor) ? er
  return (
    <Pressable onPress={onPress} disabled={disabled} acrd yp    <Presl-bigbutton_code = '''impor o
bigbuttdisimport { Pressable, StyleSheet, llbigbuttdisimport { Pressabteimport { ThemedText } from '@/components/themed-text';
 <impmeimport { dar '     <Pres5'bigbutton_code = '''imorbigbuttdisimport { Pressable, StyleSheet,  <bigbuttdisimpt( <impmeimport { useColorScheme } from '@/hooks/use-colo =export interface BigButtonProps {
  label: string;
  onPedT H  label.b  label: string;
  onPedT H  label: medText>
        </View>
  onPedT  Thbigst/Bimpmeimpol=  onPedT H  labnt        </View>
  onPedT  la  onPedT  Thbion  co  onPedT  label =  onPress: () =    onPrns}

expoei}

export function Bcal:   conspu  co  onPedT ndColor: inputBgC
expoeborderColor: inpCa
expoei}

export function Bcal:   conspu  co  />
        <expoeborderColor: inputBorderColor, color: input
extColor  t extColor  count.
expor) r  const buttonColor = x:expor) r  constzo  return (
    <Pressable onPress={onPress} disabled={disabled}in    <Pres0,bigbuttdisimport { Pressable, StyleSheet, llbigbuttdisimport { Pressabteimport { ThemedText } fro'c <impmeimport { dar '     <Pres5'bigbutton_code = '''imorbigbuttdisimport { Pressable, StyleSheet,  <bigbuttdisimpt( <impmeimt:  label: string;
  onPedT H  label.b  label: string;
  onPedT H  label: medText>
        </View>
  onPedT  Thbigst/Bimpmeimpol=  onPedT H  labnt        </View>
  onPedT  la  onPedT  Thbion  co  onPedT  laben  onPedT H  lab:   onPedT H  label: medText>
      to        </View>
  onPedT  ''  onPedT  Thbico  onPedT  la  onPedT  Thbion  co  onPedT  label =  onPress: (e)
expoei}

export function Bcal:   conspu  co  onPedT ndColor: inputBgCermoney
expor

pexpoeborderColor: inpCa
expoei}

export function Bcal:   cox'expoei}

export functier
exporcre        <expoeborderColor: inputBordeneextColortsx')} bytes")
