import st from "./OpenAccountPage.module.scss"
import { useState } from 'react';
import {
    Container,
    Card,
    Title,
    Text,
    Button,
    Stack,
    Radio,
    Group,
    NumberInput,
    Paper,
    Alert,
    Divider,
} from '@mantine/core';
import { IconCheck, IconArrowLeft } from '@tabler/icons-react';
import { Link } from "react-router-dom";
import type { Account, AccountType } from "@/components/AccountCard";
import {LINK_PATHS} from "@/constants/LINK_PATHS.ts";

const OpenAccountPage = () => {
    const [accountType, setAccountType] = useState<AccountType>('checking');
    const [initialDeposit, setInitialDeposit] = useState<number | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdAccount, setCreatedAccount] = useState<Account | null>(null);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
        }).format(value);

    const handleSubmit = () => {
        setIsSubmitting(true);

        setTimeout(() => {
            const accountNumber = `4081 7810 0000 ${Math.floor(
                1000 + Math.random() * 9000
            )}`;

            const newAccount: Account = {
                id: Date.now().toString(),
                accountNumber,
                balance: initialDeposit ?? 0,
                currency: 'RUB',
                type: accountType,
                openDate: new Date().toISOString().split('T')[0],
            };

            setCreatedAccount(newAccount);
            setIsSubmitting(false);
        }, 1000);
    };

    if (createdAccount) {
        return (
            <Container size="sm" py="xl">
                <Card withBorder shadow="sm" padding="lg" radius="md">
                    <Stack gap="md">
                        <Group>
                            <IconCheck size={24} color="green" />
                            <Title order={3}>Счет успешно открыт</Title>
                        </Group>

                        <Divider />

                        <Text>
                            <strong>Номер счета:</strong> {createdAccount.accountNumber}
                        </Text>
                        <Text>
                            <strong>Тип:</strong>{' '}
                            {createdAccount.type === 'checking'
                                ? 'Текущий счет'
                                : 'Сберегательный счет'}
                        </Text>
                        <Text>
                            <strong>Баланс:</strong>{' '}
                            {formatCurrency(createdAccount.balance)}
                        </Text>
                        <Text>
                            <strong>Дата открытия:</strong> {createdAccount.openDate}
                        </Text>

                        <Button
                            mt="md"
                            variant="light"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={() => setCreatedAccount(null)}
                        >
                            Открыть ещё один счет
                        </Button>
                    </Stack>
                </Card>
            </Container>
        );
    }

    return (
        <Container size="sm" py="xl">
            <Card withBorder shadow="sm" padding="lg" radius="md">
                <Stack gap="lg">
                    <Title order={2}>Открытие нового счета</Title>
                    <Text c="dimmed">
                        Заполните форму для открытия счета в банке
                    </Text>

                    <Divider />

                    <Stack gap="md">
                        <Title order={4}>Тип счета</Title>

                        <Radio.Group
                            value={accountType}
                            onChange={(value) =>
                                setAccountType(value as AccountType)
                            }
                        >
                            <Stack>
                                <Paper withBorder p="md" radius="md">
                                    <Radio value="checking" label="Текущий счет" />
                                    <Text size="sm" c="dimmed" mt={4}>
                                        Для ежедневных операций и платежей. Без процентов.
                                    </Text>
                                </Paper>

                                <Paper withBorder p="md" radius="md">
                                    <Radio value="savings" label="Сберегательный счет" />
                                    <Text size="sm" c="dimmed" mt={4}>
                                        Для накоплений. До 5% годовых на остаток.
                                    </Text>
                                </Paper>
                            </Stack>
                        </Radio.Group>
                    </Stack>

                    <NumberInput
                        label="Первоначальное пополнение (необязательно)"
                        placeholder="0.00"
                        value={initialDeposit}
                        onChange={(value) =>
                            setInitialDeposit(Number(value))
                        }
                        min={0}
                    />

                    <Alert icon={<IconCheck size={16} />} color="blue" radius="md">
                        <Text size="sm">
                            <strong>Преимущества:</strong>
                        </Text>
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                            <li>Бесплатное обслуживание</li>
                            <li>Мгновенное открытие счета</li>
                            <li>Без скрытых комиссий</li>
                            <li>Круглосуточный доступ</li>
                        </ul>
                    </Alert>

                    <Group grow>
                        <Button
                            onClick={handleSubmit}
                            loading={isSubmitting}
                        >
                            Открыть счет
                        </Button>

                        <Link to={LINK_PATHS.MAIN} className={st.back}>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setAccountType('checking');
                                    setInitialDeposit(undefined);
                                }}
                            >
                                Отмена
                            </Button>
                        </Link>
                    </Group>
                </Stack>
            </Card>

            <Paper mt="lg" p="md" radius="md" bg="gray.0">
                <Text size="sm" c="dimmed">
                    Открывая счет, вы соглашаетесь с условиями обслуживания банка.
                    Счет создаётся мгновенно.
                </Text>
            </Paper>
        </Container>
    );
}

export { OpenAccountPage }