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

if (Platform.OS === 'web') {
    require('../tamagui-web.css');
}

SplashScreen.preventAutoHideAsync();

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

    return (
        <TamaguiProvider
            config={tamaguiConfig}
            defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <YStack flex={1} bg="$background">
                        <Slot />
                    </YStack>
                    {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" /> */}
                    <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                </GestureHandlerRootView>
            </ThemeProvider>
        </TamaguiProvider>
    );
}
