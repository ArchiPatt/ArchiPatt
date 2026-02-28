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
} from '@mantine/core';
import {
    IconArrowUp,
    IconArrowDown,
    IconTrash,
} from '@tabler/icons-react';
import {useAccountDetailPage} from "./useAccountDetailPage.ts";
import {Transaction} from "../../../entities/Transaction";

const AccountDetailPage = () => {

    const {
        account,
        accountLoading,
        accountError,
        transaction,
        transactionLoading,
        transactionError
    } = useAccountDetailPage()

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
                                        >
                                            Пополнить
                                        </Button>

                                        <Button
                                            variant="outline"
                                            leftSection={<IconArrowDown size={16} />}
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
                                }
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>:
                <div>Не удалось загрузить информацию о счете</div>
            }
            {!transactionError ?
                transaction ?
                    <Transaction items={transaction.items} total={transaction.total} /> :
                    <div>Оперций нет</div>:
                <div>Не уадлсоь загрузить список операций</div>
            }
        </Container>
    );
}

export { AccountDetailPage }