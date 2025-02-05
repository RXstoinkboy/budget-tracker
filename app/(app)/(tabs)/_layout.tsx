import {
    ChartSpline,
    ClipboardList,
    FolderSync,
    ListCheck,
    MoreHorizontal,
} from '@tamagui/lucide-icons';
import { Tabs } from 'expo-router';
import { GetThemeValueForKey } from 'tamagui';

export default function TabLayout() {
    // const theme = useTheme();
    return (
        <Tabs
            screenOptions={{
                // tabBarActiveTintColor: theme.backgroundFocus.get(),
                // headerShown: false,
                animation: 'shift',
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => (
                        <ChartSpline size={'$1'} color={color as GetThemeValueForKey<'color'>} />
                    ),
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: 'Transactions',
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <ListCheck size={'$1'} color={color as GetThemeValueForKey<'color'>} />
                    ),
                }}
            />
            <Tabs.Screen
                name="budget"
                options={{
                    title: 'Budget',
                    tabBarIcon: ({ color }) => (
                        <ClipboardList size={'$1'} color={color as GetThemeValueForKey<'color'>} />
                    ),
                }}
            />
            <Tabs.Screen
                name="accounts"
                options={{
                    title: 'Accounts',
                    tabBarIcon: ({ color }) => (
                        <FolderSync size={'$1'} color={color as GetThemeValueForKey<'color'>} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <MoreHorizontal size={'$1'} color={color as GetThemeValueForKey<'color'>} />
                    ),
                }}
            />
        </Tabs>
    );
}
