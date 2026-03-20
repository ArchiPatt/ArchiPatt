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
    NumberInput, Badge, Flex, Select, Combobox, TextInput
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
        transferModalOpened,
        setTransferModalOpened,
        transferAmount,
        transferdAccount,
        accountList,
        accountListLoading,
        accountListError,
        onChangeTransferAmount,
        onChangeTrasferdAccount,
        combobox,
        transfer
    } = useAccountDetailPage();

    if (accountLoading || transactionLoading || accountListLoading) return <div>Loading...</div>

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
                                    <Flex align='center' gap='4'>
                                        <Text size="sm" c="dimmed">
                                            Баланс
                                        </Text>
                                        <Badge variant={"light"}>
                                            {account?.currency}
                                        </Badge>
                                    </Flex>
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
                                            leftSection={<IconArrowDown size={16} />}
                                            onClick={() => setTransferModalOpened(true)}
                                        >
                                            Перевести
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

            <Modal
                opened={transferModalOpened}
                onClose={() => setTransferModalOpened(false)}
                title="Перевод"
            >
                <Stack>
                    <Combobox
                        store={combobox}
                        onOptionSubmit={(val) => {
                            onChangeTrasferdAccount(val);
                            combobox.closeDropdown();
                        }}
                    >
                        <Combobox.Target>
                            <TextInput
                                label="Номер счета"
                                placeholder="Введите или выберите счет"
                                value={transferdAccount ?? ""}
                                onChange={(event) => {
                                    onChangeTrasferdAccount(event.currentTarget.value);
                                    combobox.openDropdown();
                                }}
                                onFocus={() => combobox.openDropdown()}
                                onBlur={() => combobox.closeDropdown()}
                            />
                        </Combobox.Target>

                        <Combobox.Dropdown>
                            <Combobox.Options>
                                {(accountList ?? [])
                                    .filter(a => a.status !== "closed" && a.id !== account?.id)
                                    .map(a => (
                                        <Combobox.Option key={a.id} value={a.id}>
                                            {a.id}
                                        </Combobox.Option>
                                    ))}
                            </Combobox.Options>
                        </Combobox.Dropdown>
                    </Combobox>
                    <NumberInput
                        label="Сумма"
                        placeholder="Введите сумму"
                        value={transferAmount}
                        onChange={onChangeTransferAmount}
                        min={0}
                        precision={2}
                        step={100}
                    />
                    <Text color='red'>{errorText}</Text>
                    <Button color="green" onClick={transfer}>
                        Перевести
                    </Button>
                </Stack>
            </Modal>

        </Container>
    );
}

export { AccountDetailPage }