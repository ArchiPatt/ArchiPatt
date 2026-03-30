import {Center, Loader, Stack, Text} from "@mantine/core";

const Loading = () => {

    return (
        <Center h="70vh">
            <Stack align="center">
                <Loader size="lg" />
                <Text c="dimmed">Загрузка...</Text>
            </Stack>
        </Center>
    );
}

export { Loading };