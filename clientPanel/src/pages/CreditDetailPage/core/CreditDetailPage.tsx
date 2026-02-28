import { Stack, Grid, Card, Text, Title, Group, Badge, Progress, Button, Divider, NumberInput, Modal } from '@mantine/core';
import {
    IconCreditCard,
    IconCalendar,
} from '@tabler/icons-react';
import {useCreditDetailPage} from "./useCreditDetailPage.ts";
import {formatDate} from "../../../utils/formatDate.ts";

const CreditDetailPage = () => {

    const {
        credit,
        creditLoading,
        creditError,
        transaction,
        transactionLoading,
        transactionError,
        tariff,
        tariffLoading,
        tariffError,
        account,
        accountLoading,
        accountError,
        percantage,
        modalState,
        setModalState,
        repayAmount,
        onChangeRepayAmount,
        errorText,
        repayCredit
    } = useCreditDetailPage()

    if (creditLoading) return <div>Loading...</div>

    return (
        <Stack spacing="xl" p="xl">
            {!creditError ?
                <Grid>
                    <Grid.Col span={8}>
                        <Card shadow="sm" padding="lg">
                            <Stack spacing="md">
                                <Group position="apart">
                                    <Group>
                                        <div
                                            style={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: '50%',
                                                backgroundColor: credit?.status === 'active' ? '#FFF4E5' : '#F0F0F0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <IconCreditCard size={32} color={credit?.status === 'active' ? '#FF9F1C' : '#B0B0B0'} />
                                        </div>
                                        <Stack spacing={0}>
                                            <Text size="sm" color="dimmed">Кредит</Text>
                                            <Title order={3}>{credit?.principalAmount}</Title>
                                        </Stack>
                                    </Group>
                                    <Badge color={credit?.status === 'active' ? 'orange' : 'gray'}>
                                        {credit?.status === 'active' ? 'Активный' : 'Закрыт'}
                                    </Badge>
                                </Group>

                                <Divider />

                                <Stack spacing={4}>
                                    <Group position="apart">
                                        <Text size="sm" color="dimmed">Прогресс погашения</Text>
                                        <Text size="sm">{percantage}% погашено</Text>
                                    </Group>
                                    <Progress value={percantage} size="lg" />
                                    <Group position="apart">
                                        <Text size="xs" color="dimmed">Выплачено: {credit?.principalAmount - credit?.outstandingAmount}</Text>
                                        <Text size="xs" color="dimmed">Осталось: {credit?.outstandingAmount}</Text>
                                    </Group>
                                </Stack>

                                <Grid>
                                    <Grid.Col span={6} md={3}>
                                        {/*<Stack spacing={2}>*/}
                                        {/*    <Group spacing={4}><IconTrendingUp size={16} /><Text size="xs">Ежемесячный платеж</Text></Group>*/}
                                        {/*    <Text weight={600}>{tariff.}</Text>*/}
                                        {/*</Stack>*/}
                                    </Grid.Col>
                                    <Grid.Col span={6} md={3}>
                                        <Stack spacing={2}>
                                            <Text size="xs">Процентная ставка</Text>
                                            <Text weight={600}>{tariff?.interestRate * 100}%</Text>
                                        </Stack>
                                    </Grid.Col>
                                    <Grid.Col span={6} md={3}>
                                        <Stack spacing={2}>
                                            <Group spacing={4}><IconCalendar size={16} /><Text size="xs">Срок кредита</Text></Group>
                                            {/*<Text weight={600}>{credit?.term} мес.</Text>*/}
                                        </Stack>
                                    </Grid.Col>
                                    <Grid.Col span={6} md={3}>
                                        <Stack spacing={2}>
                                            <Group spacing={4}><IconCalendar size={16} /><Text size="xs">Следующий платеж</Text></Group>
                                            <Text weight={600}>{credit?.status === 'active' ? formatDate(credit.nextPaymentDueAt) : '-'}</Text>
                                        </Stack>
                                    </Grid.Col>
                                </Grid>

                                 Модалка погашения
                                <Modal
                                    opened={modalState}
                                    onClose={() => setModalState(false)}
                                    title="Погашение кредита"
                                >
                                    <Stack spacing="md">
                                        <NumberInput
                                            label="Сумма"
                                            placeholder="0"
                                            min={0}
                                            // max={credit.remainingAmount}
                                            value={repayAmount}
                                            onChange={onChangeRepayAmount}
                                        />
                                        {/*<Group position="apart">*/}
                                        {/*    <Button variant="outline" onClick={() => setPaymentAmount(credit.monthlyPayment)}>Ежемесячный платеж</Button>*/}
                                        {/*    <Button variant="outline" onClick={() => setPaymentAmount(credit.remainingAmount)}>Погасить полностью</Button>*/}
                                        {/*</Group>*/}
                                        <Text color='red'>{errorText}</Text>
                                        <Button fullWidth color="green" onClick={repayCredit}>
                                            Погасить
                                        </Button>
                                    </Stack>
                                </Modal>

                                {credit?.status === 'active' && (
                                    <Button fullWidth color="green" onClick={() => setModalState(true)}>
                                        Погасить кредит
                                    </Button>
                                )}
                            </Stack>
                        </Card>
                    </Grid.Col>

                    {/* Боковая панель */}
                    <Grid.Col span={4}>
                        <Stack spacing="md">
                            <Card shadow="sm" padding="md">
                                <Stack spacing="sm">
                                    <Text size="xs" color="dimmed">Номер счета</Text>
                                    <Text weight={600} style={{ fontFamily: 'monospace' }}>{credit?.accountId}</Text>
                                    <Text size="xs" color="dimmed">Баланс</Text>
                                    <Text weight={600}>{account?.balance}</Text>
                                </Stack>
                            </Card>

                            <Card shadow="sm" padding="md">
                                <Stack spacing="sm">
                                    <Text size="xs" color="dimmed">Дата оформления</Text>
                                    <Text weight={600}>{formatDate(credit?.createdAt)}</Text>
                                    <Text size="xs" color="dimmed">Дата окончания</Text>
                                    <Text weight={600}>{credit?.closedAt ? credit?.closedAt : '-'}</Text>
                                </Stack>
                            </Card>

                            <Card shadow="sm" padding="md">
                                <Stack spacing="sm">
                                    <Text size="xs" color="dimmed">Сумма кредита</Text>
                                    <Text weight={600}>{credit?.principalAmount}</Text>
                                    <Text size="xs" color="dimmed">Общая сумма процентов</Text>
                                    <Text weight={600} color="orange">{tariff?.interestRate * 100}</Text>
                                    <Divider />
                                    {/*<Text size="xs" weight={500}>Общая сумма к выплате</Text>*/}
                                    {/*<Text weight={600}>{formatCurrency(credit.monthlyPayment * credit.term)}</Text>*/}
                                </Stack>
                            </Card>
                        </Stack>
                    </Grid.Col>
                </Grid>:
                <div>Не получилось загрузить данные</div>
            }
            {/*{!transactionError ?*/}
            {/*    transaction ?*/}
            {/*        <Transaction items={transaction} /> :*/}
            {/*        <div>Операций нет</div>*/}
            {/*    :*/}
            {/*    <div>Не удалось загрузить список операций</div>*/}
            {/*}*/}
        </Stack>
    );
}

export { CreditDetailPage }