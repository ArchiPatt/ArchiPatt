import {
    Container,
    Card,
    Text,
    Group,
    Button,
    Stack,
    Title,
    Grid,
    Divider,
    Modal,
    NumberInput
} from '@mantine/core';
import {
    IconArrowUp,
    IconArrowDown,
    IconTrash,
} from '@tabler/icons-react';
import { useAccountDetailPage } from "../../../useCases/pages/useAccountDetailPage.ts";
import {Transaction} from "../../components/Transaction/core/Transaction.tsx";

const AccountDetailPage = () => {
    const {
        account,
        accountLoading,
        accountError,
        transaction,
        transactionLoading,
        transactionError,
        closeAccount,
        depositModalOpened,
        setDepositModalOpened,
        withdrawModalOpened,
        setWithdrawModalOpened,
        amount,
        onChangeAmount,
        withdrawAmount,
        onChangeWithdrawAmount,
        depositAccount,
        withdrawAccount,
        errorText,
    } = useAccountDetailPage();

    if (accountLoading || transactionLoading) return <div>Loading...</div>

    return (
        <Container size="lg" py="xl">
            {!accountError ?
                <Grid>
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Stack gap="md">
                                <div>
                                    <Text size="sm" c="dimmed">
                                        Текущий счет
                                    </Text>
                                    <Title order={2}>{account?.id}</Title>
                                </div>

                                <Divider />

                                <div>
                                    <Text size="sm" c="dimmed">
                                        Баланс
                                    </Text>
                                    <Title order={1}>{account?.balance}</Title>
                                </div>

                                {account?.status !== 'closed' &&
                                    <Group>
                                        <Button
                                            leftSection={<IconArrowUp size={16} />}
                                            color="green"
                                            onClick={() => setDepositModalOpened(true)}
                                        >
                                            Пополнить
                                        </Button>

                                        <Button
                                            variant="outline"
                                            leftSection={<IconArrowDown size={16} />}
                                            onClick={() => setWithdrawModalOpened(true)}
                                        >
                                            Снять
                                        </Button>

                                        <Button
                                            color="red"
                                            leftSection={<IconTrash size={16} />}
                                            onClick={closeAccount}
                                        >
                                            Закрыть счет
                                        </Button>
                                    </Group>
                                }
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>
                :
                <div>Не удалось загрузить информацию о счете</div>
            }

            {!transactionError ?
                transaction ?
                    <Transaction items={transaction.items} total={transaction.total} /> :
                    <div>Операций нет</div>
                :
                <div>Не удалось загрузить список операций</div>
            }

            <Modal
                opened={depositModalOpened}
                onClose={() => setDepositModalOpened(false)}
                title="Пополнить счет"
            >
                <Stack>
                    <NumberInput
                        label="Сумма"
                        placeholder="Введите сумму"
                        value={amount}
                        onChange={onChangeAmount}
                        min={0}
                        precision={2}
                        step={100}
                    />
                    <Text color='red'>{errorText}</Text>
                    <Button color="green" onClick={depositAccount}>
                        Пополнить
                    </Button>
                </Stack>
            </Modal>

            <Modal
                opened={withdrawModalOpened}
                onClose={() => setWithdrawModalOpened(false)}
                title="Снять со счета"
            >
                <Stack>
                    <NumberInput
                        label="Сумма"
                        placeholder="Введите сумму"
                        value={withdrawAmount}
                        onChange={onChangeWithdrawAmount}
                        min={0}
                        precision={2}
                        step={100}
                    />
                    <Text color='red'>{errorText}</Text>
                    <Button color="blue" onClick={withdrawAccount}>
                        Снять
                    </Button>
                </Stack>
            </Modal>


        </Container>
    );
}

export { AccountDetailPage }