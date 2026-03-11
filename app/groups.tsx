import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FlagIcon } from '../components/FlagIcon';
import { fetchFixture } from '../lib/fixtureApi';
import { t } from '../lib/i18n';
import type { Match } from '../lib/types';

type GroupItem = {
  name: string;
  rows: TeamStats[];
};

type MatchResult = 'W' | 'D' | 'L';

type TeamStats = {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  lastResults: MatchResult[];
};

type TeamStatsMutable = Omit<TeamStats, 'goalDifference' | 'lastResults'> & {
  history: Array<{ date: number; result: MatchResult }>;
};

function normalizeGroupName(stage?: string): string | null {
  if (!stage) return null;
  const clean = stage.trim();
  const groupMatch = clean.match(/group\s*[a-z0-9]+/i);
  if (groupMatch) return groupMatch[0].replace(/\s+/g, ' ').toUpperCase();
  return null;
}

function isPlayedMatch(match: Match): boolean {
  return typeof match.homeGoals === 'number' && typeof match.awayGoals === 'number';
}

function getMatchTime(dateText: string): number {
  const parsed = new Date(dateText).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function ensureTeam(map: Map<string, TeamStatsMutable>, teamName: string): TeamStatsMutable {
  const existing = map.get(teamName);
  if (existing) return existing;
  const created: TeamStatsMutable = {
    team: teamName,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    history: [],
  };
  map.set(teamName, created);
  return created;
}

function buildGroups(matches: Match[]): GroupItem[] {
  const groupsMap = new Map<string, Map<string, TeamStatsMutable>>();

  for (const match of matches) {
    const groupName = normalizeGroupName(match.stage);
    if (!groupName) continue;
    const teamsMap = groupsMap.get(groupName) ?? new Map<string, TeamStatsMutable>();
    groupsMap.set(groupName, teamsMap);

    const home = ensureTeam(teamsMap, match.homeTeam);
    const away = ensureTeam(teamsMap, match.awayTeam);

    if (!isPlayedMatch(match)) continue;

    const homeGoals = match.homeGoals as number;
    const awayGoals = match.awayGoals as number;
    const matchTime = getMatchTime(match.date);

    home.played += 1;
    away.played += 1;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
      home.history.push({ date: matchTime, result: 'W' });
      away.history.push({ date: matchTime, result: 'L' });
    } else if (homeGoals < awayGoals) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
      home.history.push({ date: matchTime, result: 'L' });
      away.history.push({ date: matchTime, result: 'W' });
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
      home.history.push({ date: matchTime, result: 'D' });
      away.history.push({ date: matchTime, result: 'D' });
    }
  }

  return [...groupsMap.entries()]
    .map(([name, teamsMap]) => {
      const rows: TeamStats[] = [...teamsMap.values()]
        .map((team) => {
          const lastResults = [...team.history]
            .sort((a, b) => b.date - a.date)
            .slice(0, 5)
            .map((entry) => entry.result);

          return {
            team: team.team,
            played: team.played,
            won: team.won,
            drawn: team.drawn,
            lost: team.lost,
            goalsFor: team.goalsFor,
            goalsAgainst: team.goalsAgainst,
            goalDifference: team.goalsFor - team.goalsAgainst,
            points: team.points,
            lastResults,
          };
        })
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
          return a.team.localeCompare(b.team);
        });

      return { name, rows };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function formatLastResults(results: MatchResult[]): string {
  if (!results.length) return '-';
  return results.join('');
}

export default function GroupsScreen() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const matches = await fetchFixture(isRefresh);
      setGroups(buildGroups(matches));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('groupsErrorFallback'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>{t('groupsLoading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>{t('groupsErrorTitle')}</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => void loadGroups(true)}>
          <Text style={styles.retryButtonText}>{t('retry')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('groupsTitle')}</Text>
      <Text style={styles.subtitle}>{t('groupsSubtitle')}</Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.name}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadGroups(true)} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.groupName}>{item.name}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableWrap}>
              <View>
                <View style={styles.headerRow}>
                  <Text style={[styles.cell, styles.teamCell, styles.headerCell]}>Team</Text>
                  <Text style={[styles.cell, styles.numberCell, styles.headerCell]}>P</Text>
                  <Text style={[styles.cell, styles.numberCell, styles.headerCell]}>W</Text>
                  <Text style={[styles.cell, styles.numberCell, styles.headerCell]}>D</Text>
                  <Text style={[styles.cell, styles.numberCell, styles.headerCell]}>L</Text>
                  <Text style={[styles.cell, styles.numberCell, styles.headerCell]}>GF</Text>
                  <Text style={[styles.cell, styles.numberCell, styles.headerCell]}>GA</Text>
                  <Text style={[styles.cell, styles.numberCell, styles.headerCell]}>GD</Text>
                  <Text style={[styles.cell, styles.numberCell, styles.headerCell]}>Pts</Text>
                  <Text style={[styles.cell, styles.formCell, styles.headerCell]}>Last 5</Text>
                </View>

                {item.rows.map((row, rowIndex) => (
                  <View
                    key={`${item.name}-${row.team}`}
                    style={[styles.dataRow, rowIndex === item.rows.length - 1 && styles.lastDataRow]}
                  >
                    <View style={[styles.cell, styles.teamCell, styles.teamContent]}>
                      <FlagIcon teamName={row.team} size={16} />
                      <Text style={styles.teamText}>{row.team}</Text>
                    </View>
                    <Text style={[styles.cell, styles.numberCell]}>{row.played}</Text>
                    <Text style={[styles.cell, styles.numberCell]}>{row.won}</Text>
                    <Text style={[styles.cell, styles.numberCell]}>{row.drawn}</Text>
                    <Text style={[styles.cell, styles.numberCell]}>{row.lost}</Text>
                    <Text style={[styles.cell, styles.numberCell]}>{row.goalsFor}</Text>
                    <Text style={[styles.cell, styles.numberCell]}>{row.goalsAgainst}</Text>
                    <Text style={[styles.cell, styles.numberCell]}>{row.goalDifference}</Text>
                    <Text style={[styles.cell, styles.numberCell, styles.pointsText]}>{row.points}</Text>
                    <Text style={[styles.cell, styles.formCell]}>{formatLastResults(row.lastResults)}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('groupsEmpty')}</Text>
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
  groupName: {
    color: '#0d6efd',
    fontSize: 16,
    fontWeight: '700',
  },
  tableWrap: {
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#eef4ff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2fa',
    backgroundColor: '#ffffff',
  },
  lastDataRow: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    color: '#10213a',
    fontSize: 12,
  },
  headerCell: {
    fontWeight: '700',
    color: '#0d2d66',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  teamCell: {
    width: 150,
    justifyContent: 'center',
  },
  numberCell: {
    width: 42,
    textAlign: 'center',
  },
  formCell: {
    width: 70,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  teamContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamText: {
    fontSize: 12,
    color: '#10213a',
    fontWeight: '600',
    flexShrink: 1,
  },
  pointsText: {
    fontWeight: '700',
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
