import {
    Stack,
    Grid,
    Card,
    Text,
    Title,
    Group,
    Badge,
    Progress,
    Button,
    Divider,
    NumberInput,
    Modal,
    Flex
} from '@mantine/core';
import {
    IconCreditCard,
    IconCalendar,
} from '@tabler/icons-react';
import {useCreditDetailPage} from "../../../../useCases/pages/useCreditDetailPage.ts";
import {formatDate} from "../../../../shared/utils/formatDate.ts";
import {getCreditStatusColor} from "../../../../useCases/shared/credit/getCreditStatusColor.ts";
import {getCreditStatusLabel} from "../../../../useCases/shared/credit/getCreditStatusLabel.ts";
import {Loading} from "../../../components/Loading";

const CreditDetailPage = () => {

    const {
        credit,
        creditLoading,
        creditError,
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
        repayCredit,
        selectFullRepayAmount
    } = useCreditDetailPage()



    if (
        creditLoading
        || accountLoading
        || tariffLoading
        || !credit
    ) {
        return (
            <Loading/>
        )
    }

    return (
        <Stack gap="xl" p="xl">
            {!creditError && !accountError && !tariffError ?
                <Grid>
                    <Grid.Col span={8}>
                        <Card shadow="sm" padding="lg">
                            <Stack gap="md">
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
                                        <Stack gap={0}>
                                            <Text size="sm" color="dimmed">Кредит</Text>
                                            <Title order={3}>{credit?.principalAmount}</Title>
                                        </Stack>
                                    </Group>
                                    <Badge variant="light" color={getCreditStatusColor(credit.status)}>
                                        {getCreditStatusLabel(credit.status)}
                                    </Badge>
                                </Group>

                                <Divider />

                                <Stack gap={4}>
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
                                        <Flex align="center" gap="xs">
                                            <Text size="xs">Процентная ставка</Text>
                                            <Text fw={600}>{tariff?.interestRate * 100}%</Text>
                                        </Flex>
                                        <Flex align="center" gap="xs">
                                            <Group gap={4}><IconCalendar size={16} /><Text size="xs">Следующий платеж</Text></Group>
                                            <Text fw={600}>{credit?.status === 'active' ? formatDate(credit.nextPaymentDueAt) : '-'}</Text>
                                        </Flex>
                                    </Grid.Col>
                                </Grid>

                                <Modal
                                    opened={modalState}
                                    onClose={() => setModalState(false)}
                                    title="Погашение кредита"
                                >
                                    <Stack gap="md">
                                        <NumberInput
                                            label="Сумма"
                                            placeholder="0"
                                            min={0}
                                            value={repayAmount}
                                            onChange={onChangeRepayAmount}
                                        />
                                        <Group position="apart">
                                            <Button variant="outline" onClick={selectFullRepayAmount}>Погасить полностью</Button>
                                            <Button fullWidth color="green" onClick={repayCredit}>
                                                Погасить
                                            </Button>
                                        </Group>
                                        <Text color='red'>{errorText}</Text>
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

                    <Grid.Col span={4}>
                        <Stack gap="md">
                            <Card shadow="sm" padding="md">
                                <Stack gap="sm">
                                    <Text size="xs" color="dimmed">Номер счета</Text>
                                    <Text fw={600} style={{ fontFamily: 'monospace' }}>{credit?.accountId}</Text>
                                    <Text size="xs" color="dimmed">Баланс</Text>
                                    <Text fw={600}>{account?.balance}</Text>
                                </Stack>
                            </Card>

                            <Card shadow="sm" padding="md">
                                <Stack gap="sm">
                                    <Text size="xs" color="dimmed">Дата оформления</Text>
                                    <Text fw='600'>{formatDate(credit?.createdAt)}</Text>
                                    {credit?.status === 'active' &&
                                        <>
                                            <Text size="xs" color="dimmed">Дата следующего платежа</Text>
                                            <Text fw={600}>{formatDate(credit.nextPaymentDueAt)}</Text>
                                        </>
                                    }
                                    <Text size="xs" color="dimmed">Дата окончания</Text>
                                    <Text fw={600}>{credit?.closedAt ? formatDate(credit?.closedAt) : '-'}</Text>
                                </Stack>
                            </Card>

                            <Card shadow="sm" padding="md">
                                <Stack gap="sm">
                                    <Text size="xs" color="dimmed">Сумма кредита</Text>
                                    <Text fw={600}>{credit?.principalAmount}</Text>
                                    <Text size="xs" color="dimmed">Общая сумма процентов</Text>
                                    <Text fw={600} color="orange">{tariff?.interestRate * 100}%</Text>
                                </Stack>
                            </Card>
                        </Stack>
                    </Grid.Col>
                </Grid>:
                <div>Не получилось загрузить данные</div>
            }
        </Stack>
    );
}

export { CreditDetailPage }