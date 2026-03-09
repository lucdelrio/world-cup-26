import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '../lib/i18n';

type MenuItem = {
  label: string;
  route: '/today' | '/fixture' | '/predictions';
};

const menu: MenuItem[] = [
  { label: t('menuToday'), route: '/today' },
  { label: t('menuFixture'), route: '/fixture' },
  { label: t('menuPredictions'), route: '/predictions' },
];

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('homeTitle')}</Text>
      <Text style={styles.subtitle}>{t('homeSubtitle')}</Text>

      <View style={styles.menu}>
        {menu.map((item) => (
          <Pressable
            key={item.route}
            style={styles.button}
            onPress={() => router.push(item.route)}
          >
            <Text style={styles.buttonText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f7fb',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10213a',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#44536b',
    textAlign: 'center',
  },
  menu: {
    marginTop: 28,
    gap: 12,
  },
  button: {
    borderRadius: 12,
    backgroundColor: '#0d6efd',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
