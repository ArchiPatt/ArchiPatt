import {Button, Card, Container, Group, NumberInput, Select, Stack, Text, Title} from "@mantine/core";
import {Link} from "react-router-dom";
import {useOpenAccountPage} from "../../../useCases/pages/useOpenAccountPage.ts";

const OpenAccountPage = () => {

    const {
        currencies
    } = useOpenAccountPage()

    return (
        <Container size="lg" py="xl">
            <Stack spacing="xl">
                <Group spacing="lg" align="flex-start">
                    <Card shadow="sm" padding="lg" radius="md" style={{ flex: 2 }}>
                        <Title order={3}>Открытие счета</Title>
                        <Text color="dimmed" size="sm" mb="md">
                            Заполните форму для открытия счета
                        </Text>

                        <Stack spacing="md">
                            <Select
                                label="Счет для зачисления"
                                placeholder="Выберите счет"
                                data={currencies}
                                // value={choosenAccount}
                                // onChange={handleChooseAccount}
                            />
                            <Text color="red">ошибка</Text>
                            <Group spacing="md">
                                <Button style={{ flex: 1 }} color="blue" onClick={() => console.log(1)}>
                                    Открыть счет
                                </Button>
                                <Link to="/" style={{ flex: 1 }}>
                                    <Button variant="outline" style={{ width: "100%" }}>
                                        Отмена
                                    </Button>
                                </Link>
                            </Group>
                        </Stack>
                    </Card>

                </Group>
            </Stack>
        </Container>
    )
}

export { OpenAccountPage }