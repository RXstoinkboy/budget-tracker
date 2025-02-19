import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { SheetProps, YStack, Paragraph, XStack } from 'tamagui';
import { TransactionDto } from '../api/types';
import { useDeleteTransaction } from '../api/query';

type DeleteConfirmationSheetProps = SheetProps & {
    transaction: TransactionDto | null;
};

export const DeleteConfirmationSheet = ({
    open,
    onOpenChange,
    transaction,
}: DeleteConfirmationSheetProps) => {
    const deleteTransaction = useDeleteTransaction();

    const onDelete = () => {
        if (transaction) {
            deleteTransaction.mutate(transaction.id);
            onOpenChange?.(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <YStack p="$4">
                <Paragraph>
                    Are you sure you want to delete {transaction?.name} transaction?
                </Paragraph>
                <XStack gap="$2">
                    <Button danger onPress={onDelete}>
                        Delete
                    </Button>
                    <Button variant="outlined" onPress={() => onOpenChange?.(false)}>
                        Cancel
                    </Button>
                </XStack>
            </YStack>
        </Sheet>
    );
};
