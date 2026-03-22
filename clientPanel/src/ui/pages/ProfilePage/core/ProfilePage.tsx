import {
    Container,
    Card,
    Title,
    Text,
    Stack,
    Group,
    Divider,
    Avatar,
    Grid,
    Badge
} from '@mantine/core';
import {useProfilePage} from "../../../../useCases/pages/useProfilePage.ts";
import {ROLES} from "../../../../shared/constants/ROLES.ts";
import {Loading} from "../../../components/Loading";

const ProfilePage = () => {

    const { userData, isLoading, creditRating, creditLoading } = useProfilePage()

    if (isLoading || creditLoading) {
        return (
            <Loading/>
        )
    }
    if (!userData) return null

    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                <div>
                    <Title order={1}>Мой профиль</Title>
                </div>

                <Card shadow="sm" padding="lg" radius="md">
                    <Group position="apart" align="flex-start" mb="md">
                        <Group>
                            <Avatar color="blue" size={80} radius="xl">
                                {userData.displayName[0] + userData.displayName[0]}
                            </Avatar>

                            <div>
                                <Title order={3}>
                                    {userData.displayName}
                                </Title>
                            </div>
                        </Group>
                    </Group>

                    <Divider my="sm" />

                    <Grid>
                        <Grid.Col span={6}>
                            <Group gap='5' align="center">
                                <Text fw={500}>Роли:</Text>
                                {userData.roles.map((item, index) => (
                                    <Text key={index}>
                                        {`${ROLES[item]}${index !== userData.roles.length - 1 ? "," : ""}`}
                                    </Text>
                                ))}
                            </Group>
                        </Grid.Col>
                    </Grid>

                    {creditRating ? (
                        <>
                            <Divider my="md" />

                            <Stack gap="xs">
                                <Title order={4}>Кредитный рейтинг</Title>

                                <Grid>
                                    <Grid.Col span={3}>
                                        <Text c="dimmed">Балл рейтинга</Text>
                                        <Badge
                                            size="lg"
                                            color={
                                                creditRating.score >= 80
                                                    ? "green"
                                                    : creditRating.score >= 50
                                                        ? "yellow"
                                                        : "red"
                                            }
                                        >
                                            {creditRating.score}
                                        </Badge>
                                    </Grid.Col>

                                    <Grid.Col span={3}>
                                        <Text c="dimmed">Просроченные кредиты</Text>
                                        <Text fw={500}>
                                            {creditRating.overdueCount}
                                        </Text>
                                    </Grid.Col>

                                    <Grid.Col span={3}>
                                        <Text c="dimmed">Всего кредитов</Text>
                                        <Text fw={500}>
                                            {creditRating.totalCredits}
                                        </Text>
                                    </Grid.Col>

                                    <Grid.Col span={3}>
                                        <Text c="dimmed">Закрытые кредиты</Text>
                                        <Text fw={500}>
                                            {creditRating.closedCount}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            </Stack>
                        </>
                    ):<div>Не удалось загрузить кредитный рейтинг</div>
                    }
                </Card>
            </Stack>
        </Container>
    );
}

export { ProfilePage }