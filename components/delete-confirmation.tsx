import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { SheetProps, YStack, XStack, Paragraph } from 'tamagui';

export type DeleteConfirmationProps = SheetProps & {
    title: string;
    onDelete: () => void;
    onCancel?: () => void;
};

export const DeleteConfirmation = ({
    open,
    onOpenChange,
    title,
    onDelete,
    onCancel,
}: DeleteConfirmationProps) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <YStack p="$4">
                <Paragraph>{title}</Paragraph>
                <XStack gap="$2">
                    <Button danger onPress={onDelete}>
                        Delete
                    </Button>
                    <Button
                        variant="outlined"
                        onPress={() => {
                            onOpenChange?.(false);
                            onCancel?.();
                        }}>
                        Cancel
                    </Button>
                </XStack>
            </YStack>
        </Sheet>
    );
};
