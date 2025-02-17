import { useState } from 'react';
import { SheetProps as TamaguiSheetProps, Sheet as TamaguiSheet } from 'tamagui';

export type SheetProps = TamaguiSheetProps;

export const Sheet = ({ open, onOpenChange, children, ...props }: SheetProps) => {
    const [position, setPosition] = useState(0);

    return (
        <TamaguiSheet
            forceRemoveScrollEnabled={open}
            modal
            open={open}
            onOpenChange={onOpenChange}
            dismissOnSnapToBottom
            snapPointsMode="fit"
            position={position}
            onPositionChange={setPosition}
            zIndex={100_000}
            animation="quick">
            <TamaguiSheet.Overlay
                animation="lazy"
                bg="$shadow6"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
            />

            <TamaguiSheet.Handle />
            <TamaguiSheet.Frame>{children}</TamaguiSheet.Frame>
        </TamaguiSheet>
    );
};
