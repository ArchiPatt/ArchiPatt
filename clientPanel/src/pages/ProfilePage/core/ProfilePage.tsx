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
import {ROLES} from "../../../constants/ROLES.ts";

const ProfilePage = () => {

    const { profileData } = useProfilePage()


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
                                {profileData.displayName[0] + profileData.displayName[0]}
                            </Avatar>
                            <div>
                                <Title order={3}>
                                    {profileData.displayName}
                                </Title>
                            </div>
                        </Group>
                    </Group>

                    <Divider my="sm" />

                    <Grid>

                        <Grid.Col span={6}>
                            <Group spacing={5} align="center">
                                <Text>Роли:</Text>
                                {profileData.roles.map((item, index) => (
                                    <Text key={index}>{`${ROLES[item]} ${index !== profileData.roles.length ? "," : ""}`}</Text>
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