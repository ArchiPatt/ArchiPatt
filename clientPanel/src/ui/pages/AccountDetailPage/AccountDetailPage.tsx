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
    NumberInput,
    Badge,
    Combobox,
    TextInput,
    Center,
    Loader,
} from "@mantine/core";

import {
    IconArrowUp,
    IconArrowDown,
    IconTrash,
    IconEye,
    IconEyeOff,
} from "@tabler/icons-react";

import { useAccountDetailPage } from "../../../useCases/pages/useAccountDetailPage.ts";
import { Transaction } from "../../components/Transaction/core/Transaction.tsx";

const AccountDetailPage = () => {
    const {
        account,
        accountLoading,
        accountError,
        operations,
        operationsLoading,
        closeAccount,

        depositModalOpened,
        setDepositModalOpened,
        withdrawModalOpened,
        setWithdrawModalOpened,
        transferModalOpened,
        setTransferModalOpened,

        amount,
        withdrawAmount,
        transferAmount,
        transferdAccount,

        onChangeAmount,
        onChangeWithdrawAmount,
        onChangeTransferAmount,
        onChangeTrasferdAccount,

        depositAccount,
        withdrawAccount,
        transfer,

        errorText,
        accountList,
        accountListLoading,
        combobox,

        isHidden,
        setHiddenAccount
    } = useAccountDetailPage();

    if (operationsLoading || accountLoading || accountListLoading) {
        return (
            <Center h="70vh">
                <Stack align="center">
                    <Loader size="lg" />
                    <Text c="dimmed">Загрузка счета...</Text>
                </Stack>
            </Center>
        );
    }

    if (accountError) {
        return <Center>Не удалось загрузить информацию о счете</Center>;
    }

    return (
        <Container size="lg" py="xl">
            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card
                        shadow="sm"
                        padding="xl"
                        radius="lg"
                        withBorder
                        style={{
                            background:
                                "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)",
                            color: "white",
                            opacity: isHidden ? 0.5 : 1,
                            transition: "0.25s ease",
                        }}
                    >
                        <Stack gap="md">

                            {/* HEADER */}
                            <Group justify="space-between" align="flex-start">
                                <div>
                                    <Text size="sm" c="gray.4">
                                        Текущий счет
                                    </Text>

                                    <Title order={2} ff="monospace">
                                        {account?.id}
                                    </Title>
                                </div>

                                <Group gap="xs">
                                    <Badge variant="light" color="blue">
                                        {account?.currency}
                                    </Badge>

                                    {isHidden && <Badge>Скрыт</Badge>}

                                </Group>
                            </Group>

                            <Divider color="rgba(255,255,255,0.15)" />

                            <Stack gap={0}>
                                <Text size="sm" c="gray.4">
                                    Баланс
                                </Text>

                                <Title order={1} fw={800} size="3rem">
                                    {account?.balance}
                                </Title>
                            </Stack>

                            {account?.status !== "closed" && (
                                <Group mt="md">

                                    <Button
                                        radius="xl"
                                        color="green"
                                        leftSection={<IconArrowUp size={16} />}
                                        onClick={() =>
                                            setDepositModalOpened(true)
                                        }
                                    >
                                        Пополнить
                                    </Button>

                                    <Button
                                        radius="xl"
                                        variant="light"
                                        leftSection={<IconArrowDown size={16} />}
                                        onClick={() =>
                                            setTransferModalOpened(true)
                                        }
                                    >
                                        Перевести
                                    </Button>

                                    <Button
                                        radius="xl"
                                        variant="subtle"
                                        onClick={() =>
                                            setWithdrawModalOpened(true)
                                        }
                                    >
                                        Снять
                                    </Button>

                                    <Button
                                        radius="xl"
                                        variant="outline"
                                        color="gray"
                                        leftSection={
                                            isHidden ? (
                                                <IconEye size={16} />
                                            ) : (
                                                <IconEyeOff size={16} />
                                            )
                                        }
                                        onClick={setHiddenAccount}
                                    >
                                        {isHidden
                                            ? "Показать счет"
                                            : "Скрыть счет"}
                                    </Button>

                                    <Button
                                        ml="auto"
                                        radius="xl"
                                        variant="outline"
                                        color="red"
                                        leftSection={<IconTrash size={16} />}
                                        onClick={closeAccount}
                                    >
                                        Закрыть
                                    </Button>
                                </Group>
                            )}
                        </Stack>
                    </Card>

                    <Stack mt="xl">
                        <Title order={3}>История операций</Title>

                        {operations?.length ? (
                            <Transaction items={operations} />
                        ) : (
                            <Text c="dimmed">Операции отсутствуют</Text>
                        )}
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card withBorder radius="lg" p="lg">
                        <Text fw={600}>Информация о счете</Text>

                        <Stack mt="md" gap="xs">
                            <Group justify="space-between">
                                <Text c="dimmed">Статус</Text>
                                <Badge>{account?.status}</Badge>
                            </Group>

                            <Group justify="space-between">
                                <Text c="dimmed">Валюта</Text>
                                <Text>{account?.currency}</Text>
                            </Group>

                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>

            <Modal opened={depositModalOpened}
                   onClose={() => setDepositModalOpened(false)}
                   title="Пополнить счет"
                   centered radius="lg">
                <Stack>
                    <NumberInput
                        label="Сумма"
                        value={amount}
                        onChange={onChangeAmount}
                        min={0}
                        precision={2}
                    />
                    <Text c="red">{errorText}</Text>
                    <Button fullWidth color="green" onClick={depositAccount}>
                        Пополнить
                    </Button>
                </Stack>
            </Modal>

            <Modal opened={withdrawModalOpened}
                   onClose={() => setWithdrawModalOpened(false)}
                   title="Снять со счета"
                   centered radius="lg">
                <Stack>
                    <NumberInput
                        label="Сумма"
                        value={withdrawAmount}
                        onChange={onChangeWithdrawAmount}
                        min={0}
                        precision={2}
                    />
                    <Text c="red">{errorText}</Text>
                    <Button fullWidth onClick={withdrawAccount}>
                        Снять
                    </Button>
                </Stack>
            </Modal>

            <Modal opened={transferModalOpened}
                   onClose={() => setTransferModalOpened(false)}
                   title="Перевод"
                   centered radius="lg">
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
                                value={transferdAccount ?? ""}
                                onChange={(e) => {
                                    onChangeTrasferdAccount(
                                        e.currentTarget.value
                                    );
                                    combobox.openDropdown();
                                }}
                            />
                        </Combobox.Target>

                        <Combobox.Dropdown>
                            <Combobox.Options>
                                {(accountList ?? [])
                                    .filter(
                                        a =>
                                            a.status !== "closed" &&
                                            a.id !== account?.id
                                    )
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
                        value={transferAmount}
                        onChange={onChangeTransferAmount}
                        min={0}
                        precision={2}
                    />

                    <Text c="red">{errorText}</Text>

                    <Button fullWidth color="green" onClick={transfer}>
                        Перевести
                    </Button>
                </Stack>
            </Modal>
        </Container>
    );
};

export { AccountDetailPage };