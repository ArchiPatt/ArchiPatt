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
import {useAccountDetailPage} from "./useAccountDetailPage.ts";

const AccountDetailPage = () => {

    const { account, transaction, closeAccount } = useAccountDetailPage()

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
                                <Title order={2}>{account.id}</Title>
                            </div>

                            <Divider />

                            <div>
                                <Text size="sm" c="dimmed">
                                    Баланс
                                </Text>
                                <Title order={1}>{account.balance}</Title>
                            </div>
                            {account.status !== 'closed' &&
                                <Group>
                                    <Button
                                        leftSection={<IconArrowUp size={16} />}
                                        color="green"
                                        disabled={Boolean(account.status === 'closed')}
                                        // onClick={() => setDepositOpened(true)}
                                    >
                                        Пополнить
                                    </Button>

                                    <Button
                                        variant="outline"
                                        leftSection={<IconArrowDown size={16} />}
                                        // onClick={() => setWithdrawOpened(true)}
                                    >
                                        Снять
                                    </Button>

                                    <Button
                                        color="red"
                                        leftSection={<IconTrash size={16} />}
                                        onClick={closeAccount}
                                        disabled={Boolean(account.status === 'closed')}
                                    >
                                        Закрыть счет
                                    </Button>
                                </Group>
                            }
                        </Stack>
                    </Card>
                </Grid.Col>


            </Grid>


            <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
                <Title order={4} mb="md">
                    История операций
                </Title>

                {transaction.length === 0 ?
                    <Text>Операции не проводились</Text> :
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Дата</Table.Th>
                                <Table.Th>Тип</Table.Th>
                                <Table.Th>Сумма</Table.Th>
                            </Table.Tr>
                        </Table.Thead>

                        <Table.Tbody>
                            {transaction.map((t) => (
                                <Table.Tr key={t.id}>
                                    <Table.Td>
                                        {new Date(t.createdAt).toLocaleString('ru-RU')}
                                    </Table.Td>
                                    <Table.Td>
                                        {t.type === 'deposit'
                                            ? 'Пополнение'
                                            : 'Снятие'}
                                    </Table.Td>
                                    <Table.Td
                                        style={{
                                            color:
                                                t.type === 'deposit' ? 'green' : 'red',
                                        }}
                                    >
                                        {t.type === 'deposit' ? '+' : ''}
                                        {t.amount}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                }
            </Card>

        </Container>
    );
}

export { AccountDetailPage }