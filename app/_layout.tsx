import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { getGoogleMobileAdsModule, isGoogleMobileAdsAvailable } from '../lib/ads';

export default function RootLayout() {
  useEffect(() => {
    const initAds = async () => {
      if (!isGoogleMobileAdsAvailable()) {
        return;
      }

      if (Platform.OS === 'ios') {
        const permission = await getTrackingPermissionsAsync();
        if (permission.status === 'undetermined') {
          await requestTrackingPermissionsAsync();
        }
      }

      const adsModule = getGoogleMobileAdsModule();
      const mobileAdsFactory = adsModule?.default;
      if (!mobileAdsFactory) {
        return;
      }
      await mobileAdsFactory().initialize();
    };

    void initAds();
  }, []);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#0d6efd',
        tabBarInactiveTintColor: '#7a8ba3',
        tabBarStyle: { height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: 'today-outline',
            fixture: 'calendar-outline',
            groups: 'grid-outline',
            predictions: 'analytics-outline',
          };
          const iconName = iconMap[route.name] ?? 'ellipse-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="fixture" options={{ title: 'Fixture' }} />
      <Tabs.Screen name="groups" options={{ title: 'Groups' }} />
      <Tabs.Screen name="predictions" options={{ title: 'Predictions' }} />
      <Tabs.Screen name="today" options={{ href: null }} />
    </Tabs>
  );
}
