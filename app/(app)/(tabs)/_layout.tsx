import { useAuthSession } from '@/features/auth/query';
import {
    ChartSpline,
    ClipboardList,
    FolderSync,
    ListCheck,
    MoreHorizontal,
} from '@tamagui/lucide-icons';
import { Redirect, Tabs } from 'expo-router';
import { GetThemeValueForKey, Spinner } from 'tamagui';

export default function TabLayout() {
    const session = useAuthSession();

    if (session.isLoading) {
        return <Spinner size="large" />;
    }

    if (!session?.data?.user) {
        return <Redirect href="/sign-in" />;
    }

    return (
        <Tabs
            screenOptions={{
                // tabBarActiveTintColor: theme.backgroundFocus.get(),
                // headerShown: false,
                animation: 'shift',
                tabBarHideOnKeyboard: true,
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
