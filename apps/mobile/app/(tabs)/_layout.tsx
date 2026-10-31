import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/components/AppContext';
import { colors, font } from '@/theme';

const tabs = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'discover', label: 'Discover', icon: 'search-outline', iconActive: 'search' },
  { name: 'activity', label: 'Activity', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'saved', label: 'Saved', icon: 'heart-outline', iconActive: 'heart' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
] as const;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderTopColor: colors.border,
          height: 64 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabel: ({ focused, children }) => (
          <Text style={{ color: focused ? colors.forest : colors.faint, fontSize: 9, fontFamily: focused ? font.bodyBold : font.bodyMedium, marginBottom: 5 }}>
            {children}
          </Text>
        ),
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ focused, color }) => (
              <View>
                <Ionicons name={focused ? (tab.iconActive as never) : (tab.icon as never)} size={22} color={color} />
                {tab.name === 'profile' && unreadCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -3,
                      right: -7,
                      backgroundColor: colors.red,
                      minWidth: 15,
                      height: 15,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 3,
                    }}
                  >
                    <Text style={{ color: colors.white, fontSize: 8, fontFamily: font.bodyBold }}>{unreadCount}</Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
