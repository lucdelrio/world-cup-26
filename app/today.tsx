import { StyleSheet, Text, View } from 'react-native';

import { t } from '../lib/i18n';

export default function TodayScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('todayTitle')}</Text>
      <Text style={styles.description}>{t('todayDescription')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10213a',
  },
  description: {
    marginTop: 10,
    fontSize: 16,
    color: '#44536b',
  },
});
