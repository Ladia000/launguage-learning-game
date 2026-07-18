import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Animated, Easing,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useFonts, Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import { Figtree_400Regular, Figtree_600SemiBold } from '@expo-google-fonts/figtree';

export default function EntryScreen() {
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    Caprasimo_400Regular,
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  const headingFont = fontsLoaded ? 'Caprasimo_400Regular' : undefined;
  const bodyFont = fontsLoaded ? 'Figtree_400Regular' : undefined;

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  const handleStart = () => {
    router.replace('/onboarding');
  };

  return (
    <View style={styles.root}>
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      <SafeAreaView style={styles.safeArea}>
        {/* Navigation bar */}
        <View style={styles.navBar}>
          <View style={styles.logoGroup}>
            <View style={styles.logoBadge}>
              <Text style={[styles.logoBadgeText, { fontFamily: headingFont }]}>你</Text>
            </View>
            <Text style={[styles.logoText, { fontFamily: headingFont }]}>Nǐ Hǎo</Text>
          </View>
          {router.canGoBack() && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>‹ {t('common.back')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main content */}
        <View style={styles.content}>
          <View style={styles.bubbleCard}>
            <Text style={[styles.bubbleHanzi, { fontFamily: headingFont }]}>你好</Text>
            <Text style={[styles.bubblePinyin, { fontFamily: bodyFont }]}>nǐ hǎo</Text>
            <Text style={[styles.bubblePill, { fontFamily: bodyFont }]}>
              {t('entry.meansHello')}
            </Text>
            <View style={styles.bubbleTail} />
          </View>

          <Animated.View
            style={[styles.mascot, { transform: [{ translateY: floatAnim }] }]}
          >
            <View style={styles.earLeft} />
            <View style={styles.earRight} />
            <View style={styles.earInnerLeft} />
            <View style={styles.earInnerRight} />
            <View style={styles.face} />
            <View style={styles.cheekShadow} />
            <View style={styles.eyeLeft} />
            <View style={styles.eyeRight} />
            <View style={styles.eyeHighlightLeft} />
            <View style={styles.eyeHighlightRight} />
            <View style={styles.nose} />
            <View style={styles.mouth} />
            <View style={styles.whiskerLeftTop} />
            <View style={styles.whiskerLeftBottom} />
            <View style={styles.whiskerRightTop} />
            <View style={styles.whiskerRightBottom} />
            <View style={styles.hand} />
          </Animated.View>

          <Text style={[styles.headline, { fontFamily: headingFont }]}>
            {t('entry.headline')}
          </Text>
          <Text style={[styles.subtitle, { fontFamily: bodyFont }]}>
            {t('entry.subtitle')}
          </Text>

          <TouchableOpacity style={styles.ctaButton} onPress={handleStart} activeOpacity={0.85}>
            <Text style={[styles.ctaText, { fontFamily: headingFont }]}>
              {t('entry.cta')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5EAD8',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  decorCircle1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFF2EB',
    opacity: 0.7,
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#F0FAE1',
    opacity: 0.8,
  },
  decorCircle3: {
    position: 'absolute',
    top: '38%',
    left: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E1EECC',
    opacity: 0.6,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backButtonText: {
    color: '#201E1D',
    fontSize: 15,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#5B53C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  logoText: {
    marginLeft: 9,
    fontSize: 18,
    color: '#201E1D',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bubbleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(32,30,29,0.16)',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#2E2B25',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  bubbleHanzi: {
    fontSize: 40,
    lineHeight: 44,
    color: '#201E1D',
  },
  bubblePinyin: {
    fontSize: 13,
    color: 'rgba(32,30,29,0.55)',
    marginTop: 2,
  },
  bubblePill: {
    backgroundColor: '#F0FAE1',
    color: '#3D472B',
    borderRadius: 999,
    fontSize: 11,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 6,
    overflow: 'hidden',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(32,30,29,0.16)',
    transform: [{ rotate: '45deg' }],
  },
  mascot: {
    width: 168,
    height: 180,
    position: 'relative',
    marginBottom: 24,
  },
  earLeft: {
    position: 'absolute',
    top: 0,
    left: 22,
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 46,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#A89E9A',
    transform: [{ rotate: '-18deg' }],
  },
  earRight: {
    position: 'absolute',
    top: 0,
    right: 22,
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 46,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#A89E9A',
    transform: [{ rotate: '18deg' }],
  },
  earInnerLeft: {
    position: 'absolute',
    top: 8,
    left: 29,
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F3C9CB',
    transform: [{ rotate: '-18deg' }],
  },
  earInnerRight: {
    position: 'absolute',
    top: 8,
    right: 29,
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F3C9CB',
    transform: [{ rotate: '18deg' }],
  },
  face: {
    position: 'absolute',
    top: 22,
    left: 6,
    width: 156,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FAF7F2',
    shadowColor: '#2E2B25',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cheekShadow: {
    position: 'absolute',
    top: 30,
    left: 6,
    width: 78,
    height: 96,
    borderRadius: 45,
    backgroundColor: '#A89E9A',
    opacity: 0.9,
  },
  eyeLeft: {
    position: 'absolute',
    top: 78,
    left: 52,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#5B53C9',
  },
  eyeRight: {
    position: 'absolute',
    top: 78,
    right: 52,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#5B53C9',
  },
  eyeHighlightLeft: {
    position: 'absolute',
    top: 80,
    left: 56,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  eyeHighlightRight: {
    position: 'absolute',
    top: 80,
    right: 56,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  nose: {
    position: 'absolute',
    top: 100,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F3A6AB',
  },
  mouth: {
    position: 'absolute',
    top: 112,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 10,
    borderLeftWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderColor: '#B7ADA8',
  },
  whiskerLeftTop: {
    position: 'absolute',
    width: 34,
    height: 1.5,
    backgroundColor: '#CFC7C2',
    top: 98,
    left: 14,
    transform: [{ rotate: '-6deg' }],
  },
  whiskerLeftBottom: {
    position: 'absolute',
    width: 34,
    height: 1.5,
    backgroundColor: '#CFC7C2',
    top: 106,
    left: 14,
  },
  whiskerRightTop: {
    position: 'absolute',
    width: 34,
    height: 1.5,
    backgroundColor: '#CFC7C2',
    top: 98,
    right: 14,
    transform: [{ rotate: '6deg' }],
  },
  whiskerRightBottom: {
    position: 'absolute',
    width: 34,
    height: 1.5,
    backgroundColor: '#CFC7C2',
    top: 106,
    right: 14,
  },
  hand: {
    position: 'absolute',
    top: 96,
    right: -2,
    width: 28,
    height: 13,
    borderRadius: 8,
    backgroundColor: '#A89E9A',
  },
  headline: {
    fontSize: 34,
    lineHeight: 38,
    color: '#201E1D',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(32,30,29,0.55)',
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#C67139',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 40,
    shadowColor: '#2E2B25',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaText: {
    fontSize: 16,
    color: '#F5EAD8',
  },
});
