import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FlagIcon } from '../components/FlagIcon';
import { fetchFixture } from '../lib/fixtureApi';
import { t } from '../lib/i18n';
import type { Match } from '../lib/types';

type Prediction = {
  home: string;
  away: string;
};

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

function sanitizeNumericInput(value: string): string {
  const onlyDigits = value.replace(/[^0-9]/g, '').slice(0, 2);
  if (!onlyDigits) return '';
  const parsed = Number(onlyDigits);
  if (Number.isNaN(parsed)) return '';
  return String(Math.min(19, parsed));
}

export default function PredictionsScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(e instanceof Error ? e.message : t('predictionsErrorFallback'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadFixture();
  }, [loadFixture]);

  const updatePrediction = useCallback(
    (matchId: string, side: 'home' | 'away', value: string) => {
      const clean = sanitizeNumericInput(value);
      setPredictions((prev) => ({
        ...prev,
        [matchId]: {
          home: prev[matchId]?.home ?? '',
          away: prev[matchId]?.away ?? '',
          [side]: clean,
        },
      }));
    },
    []
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>{t('predictionsLoading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>{t('predictionsErrorTitle')}</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('predictionsTitle')}</Text>
      <Text style={styles.subtitle}>{t('predictionsSubtitle')}</Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadFixture(true)} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const current = predictions[item.id] ?? { home: '', away: '' };
          return (
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

              <View style={styles.inputsRow}>
                <View style={styles.inputBlock}>
                  <Text style={styles.inputLabel}>{item.homeTeam}</Text>
                  <TextInput
                    value={current.home}
                    onChangeText={(text) => updatePrediction(item.id, 'home', text)}
                    keyboardType="number-pad"
                    placeholder="0"
                    style={styles.input}
                    maxLength={2}
                  />
                </View>

                <Text style={styles.vs}>-</Text>

                <View style={styles.inputBlock}>
                  <Text style={styles.inputLabel}>{item.awayTeam}</Text>
                  <TextInput
                    value={current.away}
                    onChangeText={(text) => updatePrediction(item.id, 'away', text)}
                    keyboardType="number-pad"
                    placeholder="0"
                    style={styles.input}
                    maxLength={2}
                  />
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('emptyPredictions')}</Text>
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
  inputsRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  inputBlock: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#44536b',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#c9d7ea',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    color: '#10213a',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  vs: {
    fontSize: 20,
    color: '#44536b',
    fontWeight: '700',
    marginTop: 18,
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#44536b',
    fontSize: 15,
  },
});
