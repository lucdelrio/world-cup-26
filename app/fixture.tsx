import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { fetchFixture, getFixtureSource } from '../lib/fixtureApi';
import { t } from '../lib/i18n';
import type { Match } from '../lib/types';

function formatDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function scoreLabel(match: Match): string {
  if (match.homeGoals == null || match.awayGoals == null) return '-';
  return `${match.homeGoals} - ${match.awayGoals}`;
}

export default function FixtureScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const source = useMemo(() => getFixtureSource(), []);

  const loadFixture = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await fetchFixture(isRefresh);
      setMatches(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('fixtureErrorFallback'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadFixture();
  }, [loadFixture]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>{t('fixtureLoading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>{t('fixtureErrorTitle')}</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => void loadFixture(true)}>
          <Text style={styles.retryButtonText}>{t('retry')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('fixtureTitle')}</Text>
      <Text style={styles.subtitle}>
        {source === 'api-football' ? t('fixtureSourceApi') : t('fixtureSourceJson')}
      </Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadFixture(true)} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.stage}>{item.stage || t('defaultStage')}</Text>
            <Text style={styles.teams}>{item.homeTeam} {t('versus')} {item.awayTeam}</Text>
            <Text style={styles.meta}>{formatDate(item.date)}</Text>
            {item.venue ? <Text style={styles.meta}>{item.venue}</Text> : null}
            <Text style={styles.score}>{t('resultLabel')}: {scoreLabel(item)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('emptyFixture')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#f5f7fb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f7fb',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#10213a',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 12,
    color: '#44536b',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d7e1ef',
    padding: 12,
  },
  stage: {
    color: '#0d6efd',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  teams: {
    marginTop: 4,
    fontSize: 16,
    color: '#10213a',
    fontWeight: '600',
  },
  meta: {
    marginTop: 4,
    color: '#44536b',
    fontSize: 14,
  },
  score: {
    marginTop: 6,
    color: '#1a2b45',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    color: '#44536b',
    fontSize: 15,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8a1f2e',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 8,
    color: '#44536b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: '#0d6efd',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#44536b',
    fontSize: 15,
  },
});
