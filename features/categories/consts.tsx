import { SelectOption } from '@/components/select-field';
import { CircleHelp } from '@tamagui/lucide-icons';

export const EMPTY_CATEGORY: SelectOption = {
    name: 'Uncategorized',
    value: null,
    left: <CircleHelp />,
};
