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
        disabled: {
            true: {
                bg: '$color2',
                color: '$color4',
            },
        },
        danger: {
            true: {
                bg: '$red10',
                color: '$red12',
            },
        },
    } as const,
});
