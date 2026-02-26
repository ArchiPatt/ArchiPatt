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
import type {userProfileResponse} from "../../../types/userProfileResponse.ts";
import {useProfilePage} from "./useProfilePage.ts";

const ProfilePage = (props: userProfileResponse) => {
    const user = {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan.petrov@example.com',
        phone: '+7 (999) 123-45-67',
        address: 'г. Москва, ул. Примерная, д. 10, кв. 25',
        birthDate: '1990-05-15',
    };

    const {
        id,
        username,
        displayName,
        roles,
        isBlocked
    } = useProfilePage(props)


    return (
        <Container size="lg" py="xl">
            <Stack spacing="xl">
                <div>
                    <Title order={1}>Мой профиль</Title>
                </div>

                <Card shadow="sm" padding="lg" radius="md">
                    <Group position="apart" align="flex-start" mb="md">
                        <Group>
                            <Avatar color="blue" size={80} radius="xl">
                                {displayName[0] + displayName[0]}
                            </Avatar>
                            <div>
                                <Title order={3}>
                                    {displayName}
                                </Title>
                            </div>
                        </Group>
                    </Group>

                    <Divider my="sm" />

                    <Grid>

                        <Grid.Col span={6}>
                            <Group spacing={5} align="center">
                                <Text>Роли:</Text>
                                {roles.map((item, index) => (
                                    <Text key={index}>{item}</Text>
                                ))}
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Card>

            </Stack>
        </Container>
    );
}

export { ProfilePage }