import {
    Group,
    Text,
    Button, Menu, Avatar, UnstyledButton,

} from '@mantine/core';

import {
    IconPlus,
    IconCreditCard, IconUser, IconLogout
} from '@tabler/icons-react';
import Divider = Menu.Divider;

const Navbar = () => {

    return (
        <Group gap="md">

            <Button
                // component={Link}
                to="/"
                variant="subtle"
            >
                Мои счета
            </Button>

            <Button
                // component={Link}
                to="/open-account"
                variant="outline"
                leftSection={<IconPlus size={16} />}
            >
                Открыть счет
            </Button>

            <Button
                // component={Link}
                to="/take-credit"
                leftSection={<IconCreditCard size={16} />}
            >
                Оформить кредит
            </Button>

            <Menu width={220} position="bottom-end" shadow="md">
                <Menu.Target>
                    <UnstyledButton>
                        <Avatar radius="xl" color="blue">
                            ИП
                        </Avatar>
                    </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                    <div style={{ padding: '8px 12px' }}>
                        <Text size="sm" fw={500}>
                            Иван Петров
                        </Text>
                        <Text size="xs" c="dimmed">
                            ivan.petrov@example.com
                        </Text>
                    </div>

                    <Divider my="xs" />

                    <Menu.Item
                        to="/profile"
                        leftSection={<IconUser size={14} />}
                    >
                        Мой профиль
                    </Menu.Item>

                    <Divider my="xs" />

                    <Menu.Item
                        color="red"
                        leftSection={<IconLogout size={14} />}
                    >
                        Выйти
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>

        </Group>
    )
}

export { Navbar }