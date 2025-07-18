import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
    name: "budget-tracker",
    slug: "budget-tracker",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: ["budgettracker", "exp"],
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
        supportsTablet: true,
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.png",
            backgroundColor: "#ffffff",
        },
        package: "com.anonymous.budgettracker",
    },
    web: {
        bundler: "metro",
        output: "single",
        // output: 'static', // INFO: this is default config
        favicon: "./assets/images/favicon.png",
    },
    plugins: [
        "expo-router",
        "expo-font",
        [
            "expo-splash-screen",
            {
                image: "./assets/images/images/splash.png",
                resizeMode: "contain",
                backgroundColor: "#25292e",
            },
        ],
    ],
    experiments: {
        typedRoutes: true,
    },
};

export default config;
