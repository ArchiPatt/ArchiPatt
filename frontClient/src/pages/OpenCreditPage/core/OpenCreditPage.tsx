import { Container, Card, Title, Text, Stack, Group, Divider, NumberInput, Slider, Button, Select, Box } from '@mantine/core';
import { IconArrowLeft, IconCalculator, IconInfoCircle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

const OpenCreditPage = () => {
    const accounts = [
        { id: '1', accountNumber: '4081 7810 0000 1234', balance: 150000 },
        { id: '2', accountNumber: '4081 7810 0000 5678', balance: 50000 },
    ];

    const selectedAccount = accounts[0];
    const creditAmount = 500000;
    const termMonths = 24;

    const calculateRate = (months: number) => {
        if (months <= 12) return 10.5;
        if (months <= 24) return 11.5;
        if (months <= 36) return 12.5;
        return 13.5;
    };

    const calculateMonthlyPayment = (principal: number, annualRate: number, months: number) => {
        const monthlyRate = annualRate / 100 / 12;
        const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);
        return payment;
    };

    const rate = calculateRate(termMonths);
    const monthlyPayment = calculateMonthlyPayment(creditAmount, rate, termMonths);
    const totalPayment = monthlyPayment * termMonths;
    const overpayment = totalPayment - creditAmount;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 2 }).format(value);

    return (
        <Container size="lg" py="xl">
            <Stack spacing="xl">
                <Group>
                    <Link to="/">
                        <Button variant="outline" leftIcon={<IconArrowLeft size={16} />}>Назад к списку счетов</Button>
                    </Link>
                </Group>

                <Group spacing="lg" align="flex-start">
                    {/* Форма кредита */}
                    <Card shadow="sm" padding="lg" radius="md" style={{ flex: 2 }}>
                        <Title order={3}>Оформление кредита</Title>
                        <Text color="dimmed" size="sm" mb="md">Заполните форму для получения кредита</Text>

                        <Stack spacing="md">
                            <Select
                                label="Счет для зачисления"
                                placeholder={`${selectedAccount.accountNumber} (${formatCurrency(selectedAccount.balance)})`}
                                data={accounts.map(a => ({ value: a.id, label: `${a.accountNumber} (${formatCurrency(a.balance)})` }))}
                                value={selectedAccount.id}
                                disabled
                            />

                            <NumberInput
                                label="Сумма кредита"
                                value={creditAmount}
                                min={10000}
                                max={5000000}
                                step={1000}
                                disabled
                            />
                            <Text size="xs" color="dimmed">Минимальная сумма: 10 000 ₽, максимальная: 5 000 000 ₽</Text>

                            <Box>
                                <Group position="apart" mb={4}>
                                    <Text size="sm">Срок кредита</Text>
                                    <Text size="sm" weight={500}>{termMonths} месяцев</Text>
                                </Group>
                                <Slider
                                    value={termMonths}
                                    min={6}
                                    max={60}
                                    step={6}
                                    disabled
                                />
                                <Group position="apart" mt={2} spacing={0}>
                                    <Text size="xs">6 мес.</Text>
                                    <Text size="xs">60 мес.</Text>
                                </Group>
                            </Box>

                            <Card padding="sm" radius="md" style={{ backgroundColor: '#ebf8ff', border: '1px solid #bee3f8' }}>
                                <Group align="flex-start">
                                    <IconInfoCircle size={20} color="#3182ce" />
                                    <Stack spacing={2} style={{ flex: 1 }}>
                                        <Text weight={500} color="#2c5282">Условия кредита:</Text>
                                        <Text size="sm" color="#2b6cb0">
                                            • Одобрение за 1 минуту<br/>
                                            • Без справок и поручителей<br/>
                                            • Досрочное погашение без комиссии<br/>
                                            • Ставка зависит от срока кредита
                                        </Text>
                                    </Stack>
                                </Group>
                            </Card>

                            <Group spacing="md">
                                <Button style={{ flex: 1 }} color="blue">Оформить кредит</Button>
                                <Link to="/" style={{ flex: 1 }}>
                                    <Button variant="outline" style={{ width: '100%' }}>Отмена</Button>
                                </Link>
                            </Group>
                        </Stack>
                    </Card>

                    {/* Расчет платежа */}
                    <Card shadow="sm" padding="lg" radius="md" style={{ flex: 1 }}>
                        <Group mb="md">
                            <IconCalculator size={20} />
                            <Title order={4}>Расчет платежа</Title>
                        </Group>

                        <Stack spacing="sm">
                            <Box>
                                <Text size="sm" color="dimmed">Сумма кредита</Text>
                                <Text size="lg" weight={700}>{formatCurrency(creditAmount)}</Text>
                            </Box>
                            <Box>
                                <Text size="sm" color="dimmed">Процентная ставка</Text>
                                <Text size="lg" weight={500}>{rate}% годовых</Text>
                            </Box>
                            <Box>
                                <Text size="sm" color="dimmed">Срок кредита</Text>
                                <Text size="lg" weight={500}>{termMonths} месяцев</Text>
                            </Box>
                            <Divider my="sm" />
                            <Box>
                                <Text size="sm" color="dimmed">Ежемесячный платеж</Text>
                                <Text size="xl" weight={700} color="blue">{formatCurrency(monthlyPayment)}</Text>
                            </Box>
                            <Box>
                                <Group position="apart" mt={4}>
                                    <Text size="sm" color="dimmed">Общая сумма выплат:</Text>
                                    <Text weight={500}>{formatCurrency(totalPayment)}</Text>
                                </Group>
                                <Group position="apart">
                                    <Text size="sm" color="dimmed">Переплата:</Text>
                                    <Text weight={500} color="orange">{formatCurrency(overpayment)}</Text>
                                </Group>
                            </Box>
                        </Stack>
                    </Card>
                </Group>

                <Card padding="md" radius="md" style={{ backgroundColor: '#f7fafc' }}>
                    <Text size="sm" color="dimmed">
                        <strong>Важно:</strong> Кредит будет зачислен на выбранный счет моментально после одобрения заявки. Вы обязуетесь производить ежемесячные платежи в указанном размере. При досрочном погашении комиссия не взимается.
                    </Text>
                </Card>
            </Stack>
        </Container>
    );
}

export { OpenCreditPage }