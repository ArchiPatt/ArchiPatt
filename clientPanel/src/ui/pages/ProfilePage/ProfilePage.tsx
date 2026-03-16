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
} from '@mantine/core';
import {useProfilePage} from "../../../useCases/pages/useProfilePage.ts";
import {ROLES} from "../../../shared/constants/ROLES.ts";

const ProfilePage = () => {

    const { userData, isLoading } = useProfilePage()

    if (isLoading) return <div>Loading...</div>
    if (!userData) return null

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
                            <Group spacing={5} align="center">
                                <Text>Роли:</Text>
                                {userData.roles.map((item, index) => (
                                    <Text key={index}>{`${ROLES[item]} ${index !== userData.roles.length - 1 ? "," : ""}`}</Text>
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