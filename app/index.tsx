import React from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView
} from 'react-native';
import { router, Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/useSettingsStore';
import { useWordStore } from '../store/useWordStore';
import { useMistakeStore } from '../store/useMistakeStore';
import { useWriteStore } from '../store/useWriteStore';
import { useDeviceType } from '../hooks/useDeviceType';
import { Colors, fontSize, spacing, radius } from '../constants/typography';

interface ModeCard {
  key: 'learn' | 'test' | 'review' | 'write';
  icon: string;
  path: string;
  color: string;
}

const MODES: ModeCard[] = [
  { key: 'learn',  icon: '📖', path: '/learn',  color: '#534AB7' },
  { key: 'test',   icon: '✏️', path: '/test',   color: '#1D9E75' },
  { key: 'review', icon: '🔁', path: '/review', color: '#E24B4A' },
  { key: 'write',  icon: '✏️', path: '/write',  color: '#1D9E75' },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const { isOnboardingDone } = useSettingsStore();
  const { knownCount, totalCount } = useWordStore();
  const { unmastered } = useMistakeStore();
  const { getTodayCount } = useWriteStore();
  const { isTablet } = useDeviceType();

  if (!isOnboardingDone) {
    return <Redirect href="/entry" />;
  }

  const known = knownCount();
  const total = totalCount();
  const progress = total > 0 ? known / total : 0;
  const todayWriteCount = getTodayCount();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('home.title')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.coffeeButton}
              onPress={() => router.push('/entry')}
            >
              <Text style={styles.coffeeButtonText}>{t('home.coffeeBreak')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressText}>
            {t('home.progress', { known, total })}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          {todayWriteCount > 0 && (
            <Text style={styles.todayWriteText}>
              {t('home.todayWrite', { count: todayWriteCount })}
            </Text>
          )}
        </View>

        {/* Mode cards */}
        <View style={[styles.modesContainer, isTablet && styles.modesGrid]}>
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode.key}
              style={[styles.modeCard, { borderLeftColor: mode.color }, isTablet && styles.modeCardTablet]}
              onPress={() => router.push(mode.path as '/')}
              activeOpacity={0.85}
            >
              <View style={styles.modeCardInner}>
                <Text style={styles.modeIcon}>{mode.icon}</Text>
                <View style={styles.modeText}>
                  <Text style={styles.modeName}>{t(`home.${mode.key}`)}</Text>
                  <Text style={styles.modeDesc}>{t(`home.${mode.key}Desc`)}</Text>
                </View>
                {mode.key === 'review' && unmastered > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unmastered}</Text>
                  </View>
                )}
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  title: { fontSize: fontSize.h1, fontWeight: '800', color: Colors.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coffeeButton: {
    backgroundColor: '#C67139', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  coffeeButtonText: { color: '#F5EAD8', fontSize: fontSize.small, fontWeight: '600' },
  settingsButton: { padding: 8 },
  settingsIcon: { fontSize: 24 },
  progressCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: Colors.card, borderRadius: radius.card,
    padding: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  progressText: { fontSize: fontSize.body, color: Colors.textSub, marginBottom: 10 },
  progressTrack: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  todayWriteText: { fontSize: fontSize.small, color: Colors.textSub, marginTop: 8 },
  modesContainer: { paddingHorizontal: spacing.lg, gap: 12 },
  modesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  modeCard: {
    backgroundColor: Colors.card, borderRadius: radius.card,
    borderLeftWidth: 4, paddingVertical: 18, paddingHorizontal: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  modeCardTablet: { width: '31%' },
  modeCardInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modeIcon: { fontSize: 32 },
  modeText: { flex: 1 },
  modeName: { fontSize: fontSize.h2, fontWeight: '700', color: Colors.text },
  modeDesc: { fontSize: fontSize.small, color: Colors.textSub, marginTop: 2 },
  badge: {
    backgroundColor: Colors.wrong, borderRadius: radius.badge,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeText: { color: '#fff', fontSize: fontSize.small, fontWeight: '700' },
  arrow: { fontSize: 22, color: Colors.textMuted, fontWeight: '300' },
});
