import { useState } from 'react';
import {
    Container,
    Card,
    Text,
    Group,
    Badge,
    Button,
    Table,
    Modal,
    NumberInput,
    Stack,
    Title,
    Grid,
    Divider,
} from '@mantine/core';
import {
    IconArrowUp,
    IconArrowDown,
    IconTrash,
    IconCreditCard,
} from '@tabler/icons-react';

type TransactionType = 'deposit' | 'withdrawal';

interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    date: string;
    description: string;
}

interface Credit {
    id: string;
    amount: number;
    remainingAmount: number;
    rate: number;
    monthlyPayment: number;
    status: 'active' | 'closed';
}

const AccountDetailPage = () => {
    const [balance, setBalance] = useState(125000);
    const [currency] = useState('RUB');

    const [transactions, setTransactions] = useState<Transaction[]>([
        {
            id: '1',
            type: 'deposit',
            amount: 50000,
            date: new Date().toISOString(),
            description: 'Пополнение счета',
        },
        {
            id: '2',
            type: 'withdrawal',
            amount: 10000,
            date: new Date().toISOString(),
            description: 'Снятие наличных',
        },
    ]);

    const [credits, setCredits] = useState<Credit[]>([
        {
            id: '1',
            amount: 200000,
            remainingAmount: 150000,
            rate: 12,
            monthlyPayment: 8000,
            status: 'active',
        },
    ]);

    const [depositOpened, setDepositOpened] = useState(false);
    const [withdrawOpened, setWithdrawOpened] = useState(false);
    const [paymentOpened, setPaymentOpened] = useState(false);

    const [depositAmount, setDepositAmount] = useState<number | undefined>();
    const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>();
    const [paymentAmount, setPaymentAmount] = useState<number | undefined>();

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency,
        }).format(value);

    const handleDeposit = () => {
        if (!depositAmount) return;

        setBalance((prev) => prev + depositAmount);

        setTransactions((prev) => [
            {
                id: Date.now().toString(),
                type: 'deposit',
                amount: depositAmount,
                date: new Date().toISOString(),
                description: 'Пополнение счета',
            },
            ...prev,
        ]);

        setDepositOpened(false);
        setDepositAmount(undefined);
    };

    const handleWithdraw = () => {
        if (!withdrawAmount || withdrawAmount > balance) return;

        setBalance((prev) => prev - withdrawAmount);

        setTransactions((prev) => [
            {
                id: Date.now().toString(),
                type: 'withdrawal',
                amount: withdrawAmount,
                date: new Date().toISOString(),
                description: 'Снятие наличных',
            },
            ...prev,
        ]);

        setWithdrawOpened(false);
        setWithdrawAmount(undefined);
    };

    const handlePayCredit = (creditId: string) => {
        if (!paymentAmount) return;

        setCredits((prev) =>
            prev.map((c) =>
                c.id === creditId
                    ? {
                        ...c,
                        remainingAmount: c.remainingAmount - paymentAmount,
                        status:
                            c.remainingAmount - paymentAmount <= 0
                                ? 'closed'
                                : 'active',
                    }
                    : c
            )
        );

        setPaymentOpened(false);
        setPaymentAmount(undefined);
    };

    return (
        <Container size="lg" py="xl">
            <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack gap="md">
                            <div>
                                <Text size="sm" c="dimmed">
                                    Текущий счет
                                </Text>
                                <Title order={2}>40817810099910004312</Title>
                            </div>

                            <Divider />

                            <div>
                                <Text size="sm" c="dimmed">
                                    Баланс
                                </Text>
                                <Title order={1}>{formatCurrency(balance)}</Title>
                            </div>

                            <Group>
                                <Button
                                    leftSection={<IconArrowUp size={16} />}
                                    color="green"
                                    onClick={() => setDepositOpened(true)}
                                >
                                    Пополнить
                                </Button>

                                <Button
                                    variant="outline"
                                    leftSection={<IconArrowDown size={16} />}
                                    onClick={() => setWithdrawOpened(true)}
                                >
                                    Снять
                                </Button>

                                <Button
                                    color="red"
                                    leftSection={<IconTrash size={16} />}
                                >
                                    Закрыть счет
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Title order={4} mb="md">
                            Активные кредиты
                        </Title>

                        {credits.map((credit) => (
                            <Card key={credit.id} withBorder mb="md" p="md">
                                <Stack gap="xs">
                                    <Group justify="space-between">
                                        <Text size="sm">Остаток</Text>
                                        <Badge
                                            // color={CreditCard.status === 'active' ? 'blue' : 'gray'}
                                        >
                                            {credit.status === 'active'
                                                ? 'Активен'
                                                : 'Закрыт'}
                                        </Badge>
                                    </Group>

                                    <Title order={3}>
                                        {formatCurrency(credit.remainingAmount)}
                                    </Title>

                                    <Text size="sm">
                                        Ставка: {credit.rate}%
                                    </Text>
                                    <Text size="sm">
                                        Платеж: {formatCurrency(credit.monthlyPayment)}
                                    </Text>

                                    {credit.status === 'active' && (
                                        <Button
                                            variant="light"
                                            leftSection={<IconCreditCard size={16} />}
                                            onClick={() => setPaymentOpened(true)}
                                        >
                                            Погасить
                                        </Button>
                                    )}
                                </Stack>
                            </Card>
                        ))}
                    </Card>
                </Grid.Col>
            </Grid>

            <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
                <Title order={4} mb="md">
                    История операций
                </Title>

                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Дата</Table.Th>
                            <Table.Th>Тип</Table.Th>
                            <Table.Th>Описание</Table.Th>
                            <Table.Th>Сумма</Table.Th>
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {transactions.map((t) => (
                            <Table.Tr key={t.id}>
                                <Table.Td>
                                    {new Date(t.date).toLocaleString('ru-RU')}
                                </Table.Td>
                                <Table.Td>
                                    {t.type === 'deposit'
                                        ? 'Пополнение'
                                        : 'Снятие'}
                                </Table.Td>
                                <Table.Td>{t.description}</Table.Td>
                                <Table.Td
                                    style={{
                                        color:
                                            t.type === 'deposit' ? 'green' : 'red',
                                    }}
                                >
                                    {t.type === 'deposit' ? '+' : '-'}
                                    {formatCurrency(t.amount)}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Card>

            <Modal
                opened={depositOpened}
                onClose={() => setDepositOpened(false)}
                title="Пополнение счета"
            >
                <Stack>
                    <NumberInput
                        label="Сумма"
                        value={depositAmount}
                        onChange={(value) => setDepositAmount(Number(value))}
                    />
                    <Button onClick={handleDeposit}>Подтвердить</Button>
                </Stack>
            </Modal>

            <Modal
                opened={withdrawOpened}
                onClose={() => setWithdrawOpened(false)}
                title="Снятие средств"
            >
                <Stack>
                    <NumberInput
                        label="Сумма"
                        value={withdrawAmount}
                        onChange={(value) => setWithdrawAmount(Number(value))}
                    />
                    <Button onClick={handleWithdraw}>Подтвердить</Button>
                </Stack>
            </Modal>

            <Modal
                opened={paymentOpened}
                onClose={() => setPaymentOpened(false)}
                title="Погашение кредита"
            >
                <Stack>
                    <NumberInput
                        label="Сумма"
                        value={paymentAmount}
                        onChange={(value) => setPaymentAmount(Number(value))}
                    />
                    <Button
                        onClick={() => handlePayCredit(credits[0].id)}
                    >
                        Погасить
                    </Button>
                </Stack>
            </Modal>
        </Container>
    );
}

export { AccountDetailPage }