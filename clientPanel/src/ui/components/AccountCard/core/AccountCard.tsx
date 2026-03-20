import {Badge, Button, Card, Group, Stack, Text, ThemeIcon} from "@mantine/core";
import {IconArrowRight, IconWallet} from "@tabler/icons-react";
import type {AccountProps} from "../types/AccountProps.ts";
import {useAccountCard} from "../../../../useCases/components/useAccountCard.ts";

const AccountCard = (props: AccountProps) => {

    const {
        id,
        balance,
        currency,
        status,
        openDetail
    } = useAccountCard(props)

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 420 }}>
            <Group justify="space-between" mb="md">
                <Group gap="md">
                    <ThemeIcon size={48} radius="xl" variant="light" color="blue">
                        <IconWallet size={24} />
                    </ThemeIcon>

                    <div>
                        <Text size="sm" c="dimmed">
                            Текущий счет
                        </Text>
                        <Text fw={500} ff="monospace">
                            {id}
                        </Text>
                    </div>
                </Group>

                <Badge variant={"light"}>
                    {currency}
                </Badge>
            </Group>

            <Stack gap={4} mb="lg">
                <Text size="sm" c="dimmed">
                    Баланс
                </Text>
                <Text size="xl" fw={700}>
                    {balance}
                </Text>
                <Text size="xs" c="dimmed">
                    {status}
                </Text>
            </Stack>


            <Button variant="light" fullWidth rightSection={<IconArrowRight size={16} />} onClick={openDetail}>
                Подробнее
            </Button>
        </Card>
    )
}

export { AccountCard }