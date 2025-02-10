import type { ReactNode } from 'react';
import { Label as TamaguiLabel, LabelProps as TamaguiLabelProps } from 'tamagui';

export type LabelProps = TamaguiLabelProps & {
    children: ReactNode;
    htmlFor: string;
};

export const Label = ({ children, ...props }) => {
    return <TamaguiLabel {...props}>{children}</TamaguiLabel>;
};
