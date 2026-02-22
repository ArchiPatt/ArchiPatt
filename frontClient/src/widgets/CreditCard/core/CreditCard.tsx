import {
    Card,
    Group,
    Stack,
    Text,
    Badge,
    Progress,
    ThemeIcon,
    Grid,
    Divider,
    Button,
} from '@mantine/core';
import {
    IconCreditCard,
    IconCalendar,
    IconPercentage,
    IconTrendingUp,
} from '@tabler/icons-react';

const CreditCard = () => {
    const credit = {
        amount: 500000,
        remainingAmount: 185000,
        monthlyPayment: 15000,
        rate: 12.5,
        term: 36,
        startDate: '2023-01-15',
        status: 'active', // active | closed
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

    const progress =
        ((credit.amount - credit.remainingAmount) / credit.amount) * 100;

    const getRemainingMonths = () => {
        const startDate = new Date(credit.startDate);
        const currentDate = new Date();
        const monthsPassed =
            (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
            (currentDate.getMonth() - startDate.getMonth());
        return Math.max(0, credit.term - monthsPassed);
    };

    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ maxWidth: 520, opacity: credit.status === 'closed' ? 0.7 : 1 }}
        >
            <Group justify="space-between" mb="md">
                <Group gap="md">
                    <ThemeIcon
                        size={48}
                        radius="xl"
                        variant="light"
                        color={credit.status === 'active' ? 'orange' : 'gray'}
                    >
                        <IconCreditCard size={24} />
                    </ThemeIcon>

                    <div>
                        <Text size="sm" c="dimmed">
                            Кредит
                        </Text>
                        <Text size="lg" fw={600}>
                            {formatCurrency(credit.amount)}
                        </Text>
                    </div>
                </Group>

                <Badge
                    // color={credit.status === 'active' ? 'orange' : 'gray'}
                    variant="light"
                >
                    {credit.status === 'active' ? 'Активный' : 'Закрыт'}
                </Badge>
            </Group>

            <Stack gap="xs" mb="md">
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        Остаток к погашению
                    </Text>
                    <Text size="sm" fw={500}>
                        {progress.toFixed(0)}% погашено
                    </Text>
                </Group>

                <Progress value={progress} radius="xl" />

                <Text size="xl" fw={700}>
                    {formatCurrency(credit.remainingAmount)}
                </Text>
            </Stack>

            <Divider my="md" />

            <Grid>
                <Grid.Col span={6}>
                    <Group align="flex-start" gap="xs">
                        <IconTrendingUp size={16} />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                                Ежемесячный платеж
                            </Text>
                            <Text fw={600}>
                                {formatCurrency(credit.monthlyPayment)}
                            </Text>
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
                            <Text fw={600}>{credit.rate}%</Text>
                        </Stack>
                    </Group>
                </Grid.Col>

                <Grid.Col span={6}>
                    <Group align="flex-start" gap="xs">
                        <IconCalendar size={16} />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                                Осталось месяцев
                            </Text>
                            <Text fw={600}>
                                {credit.status === 'active'
                                    ? getRemainingMonths()
                                    : 0}
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
                            <Text fw={600}>
                                {formatDate(credit.startDate)}
                            </Text>
                        </Stack>
                    </Group>
                </Grid.Col>
            </Grid>

            {credit.status === 'active' && (
                <>
                    <Divider my="md" />
                    <Button
                        fullWidth
                        variant="light"
                        color="orange"
                        onClick={() => alert('Функция погашения кредита в разработке')}
                    >
                        Погасить кредит
                    </Button>
                </>
            )}
        </Card>
    );
}

export { CreditCard }