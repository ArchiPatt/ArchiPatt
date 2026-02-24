import {
    Container,
    Card,
    Title,
    Text,
    Stack,
    Group,
    Divider,
    Button,
    Avatar,
    Grid,
    Paper,
} from '@mantine/core';
import {
    IconUser,
    IconMail,
    IconPhone,
    IconMapPin,
    IconCalendar,
    IconShield,
} from '@tabler/icons-react';

const ProfilePage = () => {
    const user = {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan.petrov@example.com',
        phone: '+7 (999) 123-45-67',
        address: 'г. Москва, ул. Примерная, д. 10, кв. 25',
        birthDate: '1990-05-15',
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

    return (
        <Container size="lg" py="xl">
            <Stack spacing="xl">
                <div>
                    <Title order={1}>Мой профиль</Title>
                    <Text color="dimmed">Управляйте своими личными данными</Text>
                </div>

                <Card shadow="sm" padding="lg" radius="md">
                    <Group position="apart" align="flex-start" mb="md">
                        <Group>
                            <Avatar color="blue" size={80} radius="xl">
                                {user.firstName[0] + user.lastName[0]}
                            </Avatar>
                            <div>
                                <Title order={3}>
                                    {user.firstName} {user.lastName}
                                </Title>
                                <Group spacing={5} align="center" mt={4}>
                                    <IconMail size={16} />
                                    <Text>{user.email}</Text>
                                </Group>
                            </div>
                        </Group>
                        <Button>Редактировать</Button>
                    </Group>

                    <Divider my="sm" />

                    <Grid>
                        <Grid.Col span={6}>
                            <Group spacing={5} align="center">
                                <IconUser size={16} />
                                <Text>{user.firstName}</Text>
                            </Group>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Group spacing={5} align="center">
                                <IconUser size={16} />
                                <Text>{user.lastName}</Text>
                            </Group>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Group spacing={5} align="center">
                                <IconMail size={16} />
                                <Text>{user.email}</Text>
                            </Group>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Group spacing={5} align="center">
                                <IconPhone size={16} />
                                <Text>{user.phone}</Text>
                            </Group>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Group spacing={5} align="center">
                                <IconCalendar size={16} />
                                <Text>{formatDate(user.birthDate)}</Text>
                            </Group>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Group spacing={5} align="center">
                                <IconMapPin size={16} />
                                <Text>{user.address}</Text>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Card>

                <Card shadow="sm" padding="lg" radius="md">
                    <Group position="apart" mb="sm">
                        <Group spacing={5} align="center">
                            <IconShield size={20} />
                            <Title order={4}>Безопасность</Title>
                        </Group>
                        <Text color="dimmed" size="sm">
                            Управление паролем и настройками
                        </Text>
                    </Group>

                    <Stack spacing="sm">
                        <Paper padding="md" radius="md" withBorder>
                            <Group position="apart">
                                <div>
                                    <Text weight={500}>Пароль</Text>
                                    <Text size="sm" color="dimmed">
                                        Последнее изменение: 15 января 2026
                                    </Text>
                                </div>
                                <Button variant="outline" size="sm">
                                    Изменить
                                </Button>
                            </Group>
                        </Paper>

                        <Paper padding="md" radius="md" withBorder>
                            <Group position="apart">
                                <div>
                                    <Text weight={500}>Двухфакторная аутентификация</Text>
                                    <Text size="sm" color="dimmed">
                                        Дополнительная защита аккаунта
                                    </Text>
                                </div>
                                <Button variant="outline" size="sm">
                                    Настроить
                                </Button>
                            </Group>
                        </Paper>

                        <Paper padding="md" radius="md" withBorder>
                            <Group position="apart">
                                <div>
                                    <Text weight={500}>История входов</Text>
                                    <Text size="sm" color="dimmed">
                                        Последние активности
                                    </Text>
                                </div>
                                <Button variant="outline" size="sm">
                                    Посмотреть
                                </Button>
                            </Group>
                        </Paper>
                    </Stack>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" style={{ backgroundColor: '#fff5f5', borderColor: '#f87171' }}>
                    <Title order={4} color="red" mb="xs">
                        Опасная зона
                    </Title>
                    <Text color="red" size="sm" mb="md">
                        Необратимые действия с вашим аккаунтом
                    </Text>
                    <Group position="apart">
                        <div>
                            <Text weight={500} color="red">
                                Удалить аккаунт
                            </Text>
                            <Text size="sm" color="red">
                                Полное удаление аккаунта и всех связанных данных
                            </Text>
                        </div>
                        <Button color="red" variant="light">
                            Удалить
                        </Button>
                    </Group>
                </Card>
            </Stack>
        </Container>
    );
}

export { ProfilePage }