import { styled } from 'tamagui';
import { Button as TamaguiButton } from 'tamagui';

export const Button = styled(TamaguiButton, {
    variants: {
        primary: {
            true: {
                bg: '$accentColor',
                color: '$color',
            },
        },
    } as const,
});
