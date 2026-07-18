import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function CoffeeBreakButton({ style }: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => router.push('/entry')}
      accessibilityLabel={t('home.coffeeBreak')}
    >
      <Text style={styles.icon}>☕</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C67139',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
});
