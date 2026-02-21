import {
    AppShell,
    Container,
    Group,
    Text
} from '@mantine/core';
import { IconBuildingBank } from '@tabler/icons-react';
import { Navbar } from "../../Navbar";

const Header = ({ children }: { children: React.ReactNode }) => {
    return (
        <AppShell header={{ height: 80 }}>
            <AppShell.Header>
                <Container size="lg" h="100%">
                    <Group h="100%" justify="space-between">
                        <Group
                            // component={Link}
                            to="/"
                            gap="xs"
                            style={{ textDecoration: 'none' }}
                        >
                            <IconBuildingBank size={28} />
                            <Text fw={700} size="lg">
                                БанкПро
                            </Text>
                        </Group>
                        <Navbar/>
                    </Group>
                </Container>
            </AppShell.Header>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}

export { Header }