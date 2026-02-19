import { useState } from "react";
import {
    AppShell,
    Group,
    Burger,
    Menu,
    Avatar,
    Text,
    UnstyledButton,
} from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

function Header() {
    const [opened, setOpened] = useState(false);

    return (
        <AppShell
            header={{ height: 60 }}
            padding="md"
        >
            <AppShell.Header
                style={{
                    backgroundColor: "#0072CE",
                    borderBottom: "1px solid #005FA3",
                }}
            >
                <Group h="100%" px="md" justify="space-between">
                    <Menu shadow="md" width={180}>
                        <Menu.Target>
                            <Burger
                                opened={opened}
                                onClick={() => setOpened((o) => !o)}
                                size="sm"
                                color="white"
                            />
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconLogout size={16} />}
                                color="red"
                            >
                                Выйти
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>

                    <UnstyledButton>
                        <Group gap="sm">
                            <Text c="white" fw={500}>
                                Имя
                            </Text>
                            <Avatar radius="xl" color="white">
                                ИМ
                            </Avatar>
                        </Group>
                    </UnstyledButton>
                </Group>
            </AppShell.Header>

            <AppShell.Main>
            </AppShell.Main>
        </AppShell>
    );
}

export { Header }