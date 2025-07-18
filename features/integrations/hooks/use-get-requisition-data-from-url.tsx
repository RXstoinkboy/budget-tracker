import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useUpdateRequisitionStatus } from '../api/query';

export function useGetRequisitionDataFromUrl() {
    const updateRequisitionStatus = useUpdateRequisitionStatus();

    useEffect(() => {
        const subscription = Linking.addEventListener('url', ({ url }) => {
            const urlParams = new URL(url).searchParams;
            const requisitionId = urlParams.get('ref');
            const error = urlParams.get('error');
            const details = urlParams.get('details');

            if (error) {
                console.log('Error redirecting from URL', error, details);
                return;
            }

            updateRequisitionStatus.mutate(
                {
                    requisitionId: requisitionId ?? 'dupa',
                    status: error ? 'error' : 'linked',
                },
                {
                    onSuccess: () => {
                        console.log('Requisition status updated', requisitionId);
                    },
                },
            );
        });

        return () => {
            subscription.remove();
        };
    }, []);
}
