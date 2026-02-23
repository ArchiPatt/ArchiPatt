import {
    Badge,
    Button,
    Card,
    Divider,
    Grid,
    Group,
    Progress,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";
import {
    IconCalendar,
    IconCreditCard,
    IconPercentage,
    IconTrendingUp,
} from "@tabler/icons-react";


const CreditCard = () => {

    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            // style={{ maxWidth: 520, opacity: credit.status === "closed" ? 0.7 : 1 }}
        >
            <Group justify="space-between" mb="md">
                <Group gap="md">
                    <ThemeIcon
                        size={48}
                        radius="xl"
                        variant="light"
                        // color={credit.status === "active" ? "orange" : "gray"}
                    >
                        <IconCreditCard size={24} />
                    </ThemeIcon>

                    <div>
                        <Text size="sm" c="dimmed">
                            Кредит
                        </Text>
                        <Text size="lg" fw={600}>
                            123
                        </Text>
                    </div>
                </Group>

                <Badge variant="light">
                    123
                </Badge>
            </Group>

            <Stack gap="xs" mb="md">
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        Остаток к погашению
                    </Text>
                    <Text size="sm" fw={500}>
                        10% погашено
                    </Text>
                </Group>

                {/*<Progress value={progress} radius="xl" />*/}
                <Progress radius="xl" />

                <Text size="xl" fw={700}>
                    123
                </Text>
            </Stack>

            <Divider my="md" />

            <Grid>
                <Grid.Col span={6}>
                    <Group align="flex-start" gap="xs">
                        <IconTrendingUp size={16} />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                                Ежемесячный платеж
                            </Text>
                            <Text fw={600}>123</Text>
                        </Stack>
                    </Group>
                </Grid.Col>

                <Grid.Col span={6}>
                    <Group align="flex-start" gap="xs">
                        <IconPercentage size={16} />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                                Процентная ставка
                            </Text>
                            <Text fw={600}>12%</Text>
                        </Stack>
                    </Group>
                </Grid.Col>

                <Grid.Col span={6}>
                    <Group align="flex-start" gap="xs">
                        <IconCalendar size={16} />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                                Осталось месяцев
                            </Text>
                            <Text fw={600}>
                                123
                            </Text>
                        </Stack>
                    </Group>
                </Grid.Col>

                <Grid.Col span={6}>
                    <Group align="flex-start" gap="xs">
                        <IconCalendar size={16} />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                                Дата оформления
                            </Text>
                            <Text fw={600}>123</Text>
                        </Stack>
                    </Group>
                </Grid.Col>
            </Grid>

            {/*{credit.status === "active" && (*/}
            {/*    <>*/}
            {/*        <Divider my="md" />*/}
            {/*        <Button*/}
            {/*            fullWidth*/}
            {/*            variant="light"*/}
            {/*            color="orange"*/}
            {/*            onClick={() => alert("Функция погашения кредита в разработке")}*/}
            {/*        >*/}
            {/*            Погасить кредит*/}
            {/*        </Button>*/}
            {/*    </>*/}
            {/*)}*/}
        </Card>
    );
};

export { CreditCard };
