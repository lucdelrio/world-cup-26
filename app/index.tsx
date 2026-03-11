import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AdBanner } from '../components/AdBanner';
import { FlagIcon } from '../components/FlagIcon';
import { fetchFixture } from '../lib/fixtureApi';
import { t } from '../lib/i18n';
import type { Match } from '../lib/types';

function isToday(isoDate: string): boolean {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HomePage() {
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodayMatches = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const allMatches = await fetchFixture(isRefresh);
      setTodayMatches(allMatches.filter((match) => isToday(match.date)));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('homeTodayErrorFallback'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadTodayMatches();
  }, [loadTodayMatches]);

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>{t('homeTodayLoading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorTitle}>{t('homeTodayErrorTitle')}</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => void loadTodayMatches(true)}>
          <Text style={styles.retryButtonText}>{t('retry')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('homeTitle')}</Text>
        <Text style={styles.subtitle}>{t('homeTodaySubtitle')}</Text>
      </View>

      <FlatList
        data={todayMatches}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void loadTodayMatches(true)} />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.stage}>{item.stage || t('defaultStage')}</Text>
            <View style={styles.teamsRow}>
              <Text style={styles.teamName}>{item.homeTeam}</Text>
              <FlagIcon teamName={item.homeTeam} />
              <Text style={styles.versus}>{t('versus')}</Text>
              <FlagIcon teamName={item.awayTeam} />
              <Text style={styles.teamName}>{item.awayTeam}</Text>
            </View>
            <Text style={styles.meta}>{formatDate(item.date)}</Text>
            {item.venue ? <Text style={styles.meta}>{item.venue}</Text> : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('homeTodayEmpty')}</Text>
          </View>
        }
        ListFooterComponent={<AdBanner />}
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f7fb',
  },
  headerRow: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10213a',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#44536b',
  },
  listContent: {
    paddingBottom: 20,
    gap: 12,
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
  teamsRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  teamName: {
    fontSize: 15,
    color: '#10213a',
    fontWeight: '600',
  },
  versus: {
    color: '#44536b',
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
    color: '#44536b',
    fontSize: 14,
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
