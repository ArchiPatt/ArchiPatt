import {Badge, Button, Card, Divider, Grid, Group, Progress, Stack, Text, ThemeIcon} from "@mantine/core";
import {IconArrowRight, IconCalendar, IconCreditCard, IconPercentage, IconTrendingUp} from "@tabler/icons-react";
import type {CreditCardProps} from "../types/CreditCardProps.ts";
import {useCreditCard} from "../../../../useCases/components/useCreditCard.ts";
import {formatDate} from "../../../../shared/utils/formatDate.ts";

const CreditCard = (props: CreditCardProps) => {

    const {
        creditInformation,
        percantage,
        interestRate,
        openDetail
    } = useCreditCard(props);

    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ maxWidth: 520, opacity: creditInformation.status === "closed" ? 0.7 : 1 }}
        >
            <Group justify="space-between" mb="md">
                <Group gap="md">
                    <ThemeIcon
                        size={48}
                        radius="xl"
                        variant="light"
                        color={creditInformation.status === "active" ? "orange" : "gray"}
                    >
                        <IconCreditCard size={24} />
                    </ThemeIcon>

                    <div>
                        <Text size="sm" c="dimmed">
                            Кредит
                        </Text>
                        <Text size="lg" fw={600}>
                            {`${creditInformation.principalAmount}₽`}
                        </Text>
                    </div>
                </Group>

                <Badge variant="light">
                    {creditInformation.status === 'active' ? 'Активный' : 'Закрыт'}
                </Badge>
            </Group>

            <Stack gap="xs" mb="md">
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        Остаток к погашению
                    </Text>
                    <Text size="sm" fw={500}>
                        {`${percantage}% погашено`}
                    </Text>
                </Group>

                <Progress value={percantage} radius="xl" />

                <Text size="xl" fw={700}>
                    {`${creditInformation.outstandingAmount}₽`}
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
                            <Text fw={600}>{`${formatDate(creditInformation.nextPaymentDueAt)}`}</Text>
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
                            <Text fw={600}>{`${interestRate}%`}</Text>
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
                            <Text fw={600}>{formatDate(creditInformation.createdAt)}</Text>
                        </Stack>
                    </Group>
                </Grid.Col>
            </Grid>

            <Button variant="light" fullWidth rightSection={<IconArrowRight size={16}/>} onClick={openDetail}>
                Подробнее
            </Button>
        </Card>
    )
}

export { CreditCard }