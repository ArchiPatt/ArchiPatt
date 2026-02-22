import {Button, Card, Group, Stack, ThemeIcon, Text} from "@mantine/core";
import {IconArrowRight, IconWallet} from "@tabler/icons-react";
import {Badge} from "lucide-react";
import { Link } from "react-router-dom"
import {LINK_PATHS} from "../../../shared/static/LINK_PATHS.ts";

const AccountCard = () => {
    const account = {
        id: '1',
        type: 'checking',
        accountNumber: '4081 1781 2345 6789',
        balance: 125430.5,
        currency: 'RUB',
        openDate: '2023-04-15',
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getAccountTypeLabel = (type: string) => {
        return type === 'checking'
            ? 'Текущий счет'
            : 'Сберегательный счет';
    };

    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ maxWidth: 420 }}
        >
            <Group justify="space-between" mb="md">
                <Group gap="md">
                    <ThemeIcon
                        size={48}
                        radius="xl"
                        variant="light"
                        color="blue"
                    >
                        <IconWallet size={24} />
                    </ThemeIcon>

                    <div>
                        <Text size="sm" c="dimmed">
                            {getAccountTypeLabel(account.type)}
                        </Text>
                        <Text fw={500} ff="monospace">
                            {account.accountNumber}
                        </Text>
                    </div>
                </Group>

                <Badge
                    variant={account.type === 'savings' ? 'light' : 'filled'}
                >
                    {account.currency}
                </Badge>
            </Group>

            <Stack gap={4} mb="lg">
                <Text size="sm" c="dimmed">
                    Доступный баланс
                </Text>
                <Text size="xl" fw={700}>
                    {formatCurrency(account.balance, account.currency)}
                </Text>
                <Text size="xs" c="dimmed">
                    Открыт {formatDate(account.openDate)}
                </Text>
            </Stack>

            <Link to={LINK_PATHS.ACCOUNT_DETAIL}>
                <Button
                    variant="light"
                    fullWidth
                    rightSection={<IconArrowRight size={16} />}
                >
                    Подробнее
                </Button>
            </Link>
        </Card>
    );
}

export { AccountCard }