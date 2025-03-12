import {
    Carrot,
    House,
    ShoppingCart,
    Car,
    PiggyBank,
    Circle,
    CircleHelp,
    CircleDollarSign,
} from '@tamagui/lucide-icons';

export const icons = [
    {
        name: 'carrot',
        icon: (color: any) => <Carrot color={color} />,
    },
    {
        name: 'house',
        icon: (color: any) => <House color={color} />,
    },
    {
        name: 'shopping-cart',
        icon: (color: any) => <ShoppingCart color={color} />,
    },
    {
        name: 'car',
        icon: (color: any) => <Car color={color} />,
    },
    {
        name: 'piggy-bank',
        icon: (color: any) => <PiggyBank color={color} />,
    },
    {
        name: 'help',
        icon: (color: any) => <CircleHelp color={color} />,
    },
    {
        name: 'circle',
        icon: (color: any) => <Circle color={color} />,
    },
    {
        name: 'circle-dollar',
        icon: (color: any) => <CircleDollarSign color={color} />,
    },
];
