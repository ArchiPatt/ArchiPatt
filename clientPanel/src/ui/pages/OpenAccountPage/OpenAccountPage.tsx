import {Button, Card, Container, Group, NumberInput, Select, Stack, Text, Title} from "@mantine/core";
import {Link} from "react-router-dom";
import {useOpenAccountPage} from "../../../useCases/pages/useOpenAccountPage.ts";

const OpenAccountPage = () => {

    const {
        currencyList,
        currency,
        setCurrency,
        createAccount
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
                                label="Валюта"
                                placeholder="Выберите валюту"
                                data={currencyList?.currencies}
                                value={currency}
                                onChange={setCurrency}
                            />
                            {!currency &&
                                <Text color="red">Выберите валюту</Text>
                            }
                            <Group spacing="md">
                                <Button style={{ flex: 1 }} color="blue" onClick={createAccount}  disabled={!currency}>
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