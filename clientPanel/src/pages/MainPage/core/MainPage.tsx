import {AccountCard} from "../../../components/AccountCard";
import {CreditCard} from "../../../components/CreditCard";
import {
    Container,
    Title,
    Text,
    Group,
    Button,
    SimpleGrid,
    Paper,
    Stack,
    ThemeIcon,
} from "@mantine/core";

import { IconPlus } from "@tabler/icons-react";
import {Link} from "react-router-dom";
import {LINK_PATHS} from "../../../constants/LINK_PATHS.ts";

const MainPage = () => {
    const accounts = [1, 2, 3];
    const allCredits = [1, 2];
    const activeCredits = [1];

    return (
        <>
            <Container size="lg" py="xl">
                <Stack gap="xl" mb="xl">
                    <Group justify="space-between" align="flex-end">
                        <div>
                            <Title order={1}>Мои счета</Title>
                            <Text c="dimmed">
                                У вас {accounts.length}{" "}
                                {accounts.length === 1
                                    ? "активный счет"
                                    : "активных счета"}
                            </Text>
                        </div>

                        <Link to={LINK_PATHS.OPEN_ACCOUNT}>
                            <Button
                                leftSection={<IconPlus size={16} />}
                            >
                                Открыть счет
                            </Button>
                        </Link>
                    </Group>

                    {accounts.length === 0 ? (
                        <Paper
                            withBorder
                            radius="md"
                            p="xl"
                            style={{ textAlign: "center" }}
                        >
                            <Stack align="center">
                                <ThemeIcon size={60} radius="xl" variant="light">
                                    <IconPlus size={28} />
                                </ThemeIcon>

                                <Title order={3}>У вас пока нет счетов</Title>

                                <Text c="dimmed">
                                    Откройте свой первый счет, чтобы начать работу с банком
                                </Text>

                                <Link to={LINK_PATHS.OPEN_ACCOUNT}>
                                    <Button
                                        leftSection={<IconPlus size={16} />}
                                    >
                                        Открыть счет
                                    </Button>
                                </Link>
                            </Stack>
                        </Paper>
                    ) : (
                        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                            {accounts.map((_, i) => (
                                <AccountCard />
                            ))}
                        </SimpleGrid>
                    )}
                </Stack>

                <Stack gap="xl">
                    <Group justify="space-between" align="flex-end">
                        <div>
                            <Title order={2}>Мои кредиты</Title>
                            <Text c="dimmed">
                                {activeCredits.length === 0
                                    ? "У вас нет активных кредитов"
                                    : `У вас ${activeCredits.length} ${
                                        activeCredits.length === 1
                                            ? "активный кредит"
                                            : "активных кредита"
                                    }`}
                            </Text>
                        </div>
                        <Link to={LINK_PATHS.OPEN_CREDIT}>
                            <Button

                                color="orange"
                                leftSection={<IconPlus size={16} />}
                            >
                                Оформить кредит
                            </Button>
                        </Link>
                    </Group>

                    {allCredits.length === 0 ? (
                        <Paper
                            withBorder
                            radius="md"
                            p="xl"
                            style={{ textAlign: "center" }}
                        >
                            <Stack align="center">
                                <ThemeIcon size={60} radius="xl" variant="light" color="orange">
                                    <IconPlus size={28} />
                                </ThemeIcon>

                                <Title order={3}>У вас пока нет кредитов</Title>

                                <Text c="dimmed">
                                    Оформите кредит на выгодных условиях
                                </Text>

                                <Link to={LINK_PATHS.OPEN_CREDIT}>
                                    <Button
                                        color="orange"
                                        leftSection={<IconPlus size={16} />}
                                    >
                                        Оформить кредит
                                    </Button>
                                </Link>
                            </Stack>
                        </Paper>
                    ) : (
                        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                            {allCredits.map((_, i) => (
                                <CreditCard />
                            ))}
                        </SimpleGrid>
                    )}
                </Stack>
            </Container>
        </>
    );
};

export { MainPage };