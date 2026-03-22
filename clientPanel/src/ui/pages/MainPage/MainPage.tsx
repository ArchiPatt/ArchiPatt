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
import {LINK_PATHS} from "../../../shared/constants/LINK_PATHS.ts";
import {useMainPage} from "../../../useCases/pages/useMainPage.ts";
import {AccountCard} from "../../components/AccountCard/core/AccountCard.tsx";
import {CreditCard} from "../../components/CreditCard/core/CreditCard.tsx";
import {Loading} from "../../components/Loading";

const MainPage = () => {

    const {
        accounts,
        accountLoading,
        accountError,
        credits,
        creditLoading,
        creditError,
        tariffs,
        tariffsLoading,
        tariffError,
        hiddenAccounts
    } = useMainPage();

    if (accountLoading || creditLoading || tariffsLoading) {
        return (
            <Loading/>
        )
    }

    return (
        <>
            <Container size="lg" py="xl">
                <Stack gap="xl" mb="xl">
                    {!accountError ?
                        <>
                            <Group justify="space-between" align="flex-end">
                                <div>
                                    <Title order={1}>Мои счета</Title>
                                    <Text c="dimmed">
                                        У вас {accounts?.length}{" "}
                                        {accounts?.length === 1
                                            ? "активный счет"
                                            : "активных счета"}
                                    </Text>
                                </div>
                            </Group>

                            {accounts?.length === 0 ? (
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
                                <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
                                    {accounts?.map((item) => (
                                        <AccountCard key={item.id} isHidden={hiddenAccounts?.hiddenAccounts.includes(item.id)} {...item} />
                                    ))}
                                </SimpleGrid>
                            )}
                        </>:
                        <div>Не удалось загрузить счета</div>
                    }
                </Stack>

                <Stack gap="xl">
                    {!creditError || !tariffError ?
                        <>
                            <Group justify="space-between" align="flex-end">
                                <div>
                                    <Title order={2}>Мои кредиты</Title>
                                    <Text c="dimmed">
                                        {credits?.length === 0
                                            ? "У вас нет активных кредитов"
                                            : `У вас ${credits?.length} ${
                                                credits?.length === 1
                                                    ? "активный кредит"
                                                    : "активных кредита"
                                            }`}
                                    </Text>
                                </div>
                            </Group>

                            {credits?.length === 0 ? (
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
                                <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
                                    {credits?.map((item) => (
                                        <CreditCard
                                            creditInformation={{
                                                id: item.id,
                                                principalAmount: item.principalAmount,
                                                outstandingAmount: item.outstandingAmount,
                                                status: item.status,
                                                issuedAt: item.issuedAt,
                                                nextPaymentDueAt: item.nextPaymentDueAt,
                                                createdAt: item.createdAt,
                                            }}
                                            key={item.id}
                                            percent={tariffs?.find(tariff => tariff.id === item.tariffId).interestRate}
                                        />
                                    ))}
                                </SimpleGrid>
                            )}
                        </>:
                        <div>Не удалось загрузить список кредитов или тарифов</div>
                    }
                </Stack>

            </Container>
        </>
    );
};

export { MainPage };