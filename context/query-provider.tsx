import { PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { DevToolsBubble } from 'react-native-react-query-devtools';
import * as Clipboard from 'expo-clipboard';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
        },
    },
});

const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
});

// Define your copy function based on your platform
const onCopy = async (text: string) => {
    try {
        await Clipboard.setStringAsync(text);
        return true;
    } catch {
        return false;
    }
};

export function QueryClientProvider({ children }: PropsWithChildren) {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: asyncStoragePersister }}>
            {children}
            <DevToolsBubble onCopy={onCopy} />
        </PersistQueryClientProvider>
    );
}
