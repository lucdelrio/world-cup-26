import { Image, StyleSheet, Text, View } from 'react-native';

import { getTeamFlagImageUrl } from '../lib/teamFlags';

type FlagIconProps = {
  teamName: string;
  size?: number;
};

export function FlagIcon({ teamName, size = 18 }: FlagIconProps) {
  const uri = getTeamFlagImageUrl(teamName);

  if (!uri) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={styles.fallbackText}>?</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: 2 }}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#d7e1ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 11,
    color: '#44536b',
    fontWeight: '700',
    lineHeight: 12,
  },
});
