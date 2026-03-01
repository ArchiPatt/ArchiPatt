import {
    Group,
    Text,
    Button,
    Menu,
    Avatar,
    UnstyledButton,
} from "@mantine/core";
import {
    IconPlus,
    IconCreditCard,
    IconUser,
    IconLogout,
} from "@tabler/icons-react";
import { Link } from "react-router-dom"
import {LINK_PATHS} from "../../../constants/LINK_PATHS.ts";
import {useNavbar} from "./useNavbar.ts";



const Navbar = () => {

    const { createAccount, logout } = useNavbar()

    return (
        <Group gap="md">
            <Link to={LINK_PATHS.MAIN}>
                <Button
                    variant="subtle"
                >
                    Мои счета
                </Button>
            </Link>

            <Button
                variant="outline"
                leftSection={<IconPlus size={16} />}
                onClick={createAccount}
            >
                Открыть счет
            </Button>

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
                    <div style={{ padding: '8px 12px' }}>
                        <Text size="sm" fw={500}>
                            Иван Петров
                        </Text>
                        <Text size="xs" c="dimmed">
                            ivan.petrov@example.com
                        </Text>
                    </div>

                    <Menu.Divider my="xs" />

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

        </Group>
    )
}

export { Navbar }