import { Airplay } from '@tamagui/lucide-icons';
import { View, Button, Heading, styled } from 'tamagui';

export default function About() {
    return (
        <PageWrapper>
            <Heading size={'$10'} color={'violet'}>
                Tab One
            </Heading>

            <Button icon={Airplay} mt={10}>
                Button
            </Button>
        </PageWrapper>
    );
}

const PageWrapper = styled(View, {
    width: '100%',
    height: '100%',
    bg: '$background',
    borderBottomColor: 'red',
    borderBottomWidth: 1,
    items: 'center',
    content: 'center',
    flex: 1,
    display: 'flex',
});
