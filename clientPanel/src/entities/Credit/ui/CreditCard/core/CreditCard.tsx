import {Badge, Card, Divider, Grid, Group, Progress, Stack, Text, ThemeIcon} from "@mantine/core";
import {IconCalendar, IconCreditCard, IconPercentage, IconTrendingUp} from "@tabler/icons-react";
import type {CreditCardProps} from "../types/CreditCardProps.ts";
import {useCreditCard} from "./useCreditCard.ts";

const CreditCard = (props: CreditCardProps) => {

    const {
        principalAmount,
        outstandingAmount,
        status,
        nextPaymentDueAt,
        createdAt,
        remainsPercantage,
        // tariff
    } = useCreditCard(props);

    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ maxWidth: 520, opacity: status === "closed" ? 0.7 : 1 }}
        >
            <Group justify="space-between" mb="md">
                <Group gap="md">
                    <ThemeIcon
                        size={48}
                        radius="xl"
                        variant="light"
                        color={status === "active" ? "orange" : "gray"}
                    >
                        <IconCreditCard size={24} />
                    </ThemeIcon>

                    <div>
                        <Text size="sm" c="dimmed">
                            Кредит
                        </Text>
                        <Text size="lg" fw={600}>
                            {`${principalAmount}₽`}
                        </Text>
                    </div>
                </Group>

                <Badge variant="light">
                    {status === 'active' ? 'Активный' : 'Закрыт'}
                </Badge>
            </Group>

            <Stack gap="xs" mb="md">
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        Остаток к погашению
                    </Text>
                    <Text size="sm" fw={500}>
                        {`${remainsPercantage}% погашено`}
                    </Text>
                </Group>

                <Progress value={remainsPercantage} radius="xl" />

                <Text size="xl" fw={700}>
                    {`${outstandingAmount}₽`}
                </Text>
            </Stack>

            <Divider my="md" />

            <Grid>
                <Grid.Col span={6}>
                    <Group align="flex-start" gap="xs">
                        <IconTrendingUp size={16} />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                                Следующий Платеж
                            </Text>
                            <Text fw={600}>{`${nextPaymentDueAt}₽`}</Text>
                        </Stack>
                    </Group>
                </Grid.Col>

                <Grid.Col span={6}>
                    <Group align="flex-start" gap="xs">
                        <IconPercentage size={16} />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                                Процентная ставка
                            </Text>
                            {/*<Text fw={600}>{`${tariff.interestRate * 100}%`}</Text>*/}
                        </Stack>
                    </Group>
                </Grid.Col>

                <Grid.Col span={6}>
                    <Group align="flex-start" gap="xs">
                        <IconCalendar size={16} />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                                Платеж
                            </Text>
                            <Text fw={600}>
                                {/*{`Каждые ${tariff.billingPeriodDays} дн.`}*/}
                            </Text>
                        </Stack>
                    </Group>
                </Grid.Col>

                <Grid.Col span={6}>
                    <Group align="flex-start" gap="xs">
                        <IconCalendar size={16} />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                                Дата оформления
                            </Text>
                            <Text fw={600}>{createdAt}</Text>
                        </Stack>
                    </Group>
                </Grid.Col>
            </Grid>

            {/*{credit.status === "active" && (*/}
            {/*    <>*/}
            {/*        <Divider my="md" />*/}
            {/*        <Button*/}
            {/*            fullWidth*/}
            {/*            variant="light"*/}
            {/*            color="orange"*/}
            {/*            onClick={() => alert("Функция погашения кредита в разработке")}*/}
            {/*        >*/}
            {/*            Погасить кредит*/}
            {/*        </Button>*/}
            {/*    </>*/}
            {/*)}*/}
        </Card>
    )
}

export { CreditCard }