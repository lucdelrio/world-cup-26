import { StyleSheet, View } from 'react-native';

import { getBannerAdUnitId, getGoogleMobileAdsModule, isGoogleMobileAdsAvailable } from '../lib/ads';

export function AdBanner() {
  if (!isGoogleMobileAdsAvailable()) {
    return null;
  }

  const adsModule = getGoogleMobileAdsModule();
  const BannerAd = adsModule?.BannerAd as React.ComponentType<{ unitId: string; size: string }> | undefined;
  const BannerAdSize = adsModule?.BannerAdSize;

  if (!BannerAd || !BannerAdSize?.ANCHORED_ADAPTIVE_BANNER) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd unitId={getBannerAdUnitId()} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    alignItems: 'center',
  },
});
