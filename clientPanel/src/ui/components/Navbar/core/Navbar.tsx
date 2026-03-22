import {
    Group,
    Button,
    Menu,
    Avatar,
    UnstyledButton, ActionIcon, Tooltip,
} from "@mantine/core";
import {
    IconPlus,
    IconCreditCard,
    IconUser,
    IconLogout,
} from "@tabler/icons-react";
import { Link } from "react-router-dom"
import {LINK_PATHS} from "../../../../shared/constants/LINK_PATHS.ts";
import {useNavbar} from "../../../../useCases/components/Navbar/useNavbar.ts";
import {COLOR_SCHEME_ICON} from "../../../../shared/constants/COLOR_SCHEME_ICON.ts";



const Navbar = () => {

    const { logout, setColorScheme, colorScheme } = useNavbar()

    return (
        <Group gap="md">
            <Link to={LINK_PATHS.MAIN}>
                <Button
                    variant="subtle"
                >
                    Мои счета
                </Button>
            </Link>

            <Link to={LINK_PATHS.OPEN_ACCOUNT}>
                <Button
                    variant="outline"
                    leftSection={<IconPlus size={16} />}
                >
                    Открыть счет
                </Button>
            </Link>

            <Link
                to={LINK_PATHS.OPEN_CREDIT}
            >
                <Button
                    leftSection={<IconCreditCard size={16} />}
                >
                    Оформить кредит
                </Button>
            </Link>

            <Menu width={220} position="bottom-end" shadow="md">
                <Menu.Target>
                    <UnstyledButton>
                        <Avatar radius="xl" color="blue">
                            ИП
                        </Avatar>
                    </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                    <Link to={LINK_PATHS.PROFILE}>
                        <Menu.Item
                            leftSection={<IconUser size={14} />}
                        >
                            Мой профиль
                        </Menu.Item>
                    </Link>

                    <Menu.Divider my="xs" />

                    <Menu.Item
                        color="red"
                        leftSection={<IconLogout size={14} />}
                        onClick={logout}
                    >
                        Выйти
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>

            <Tooltip
                label={colorScheme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                position="bottom"
            >
                <Menu position="bottom-end">
                    <Menu.Target>
                        <ActionIcon variant="light" size="lg" aria-label="Сменить тему">
                            {COLOR_SCHEME_ICON[colorScheme]}
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item onClick={() => setColorScheme({ colorScheme: 'light' })}>☀️ Светлая</Menu.Item>
                        <Menu.Item onClick={() => setColorScheme({ colorScheme: 'dark' })}>🌙 Тёмная</Menu.Item>
                        <Menu.Item onClick={() => setColorScheme({ colorScheme: 'auto' })}>💻 Системная</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Tooltip>

        </Group>
    )
}

export { Navbar }