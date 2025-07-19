import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// router
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// fonts, styles
import { TamaguiProvider, YStack } from 'tamagui';
import { tamaguiConfig } from '../tamagui.config';
import { useFonts, Inter_400Regular, Inter_900Black } from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@/services/query-provider';
import { useInitiateAuth } from '@/features/auth/hooks';
import { useGetRequisitionDataFromUrl } from '@/features/integrations';

if (Platform.OS === 'web') {
    require('../tamagui-web.css');
}

SplashScreen.preventAutoHideAsync();

// Configure deep linking
const linking = {
    prefixes: ['budgettracker://', 'https://budgettracker.app'],
    config: {
        screens: {
            '(app)': {
                screens: {
                    accounts: 'accounts',
                },
            },
        },
    },
};

export default function App() {
    const [loaded] = useFonts({
        Inter_400Regular,
        Inter_900Black,
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <QueryClientProvider>
            <RootLayout />
        </QueryClientProvider>
    );
}

function RootLayout() {
    const colorScheme = useColorScheme();
    useInitiateAuth();
    useGetRequisitionDataFromUrl();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider>
                <TamaguiProvider
                    config={tamaguiConfig}
                    defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
                    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                        <Slot />
                    </ThemeProvider>
                </TamaguiProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
