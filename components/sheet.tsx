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
            unmountChildrenWhenHidden
            zIndex={100_000}
            animation="quicker">
            <TamaguiSheet.Overlay
                animation="quick"
                bg="$shadow2"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
            />

            <TamaguiSheet.Handle bg={'$color3'} />
            <TamaguiSheet.Frame bg={'$color3'}>{children}</TamaguiSheet.Frame>
        </TamaguiSheet>
    );
};
