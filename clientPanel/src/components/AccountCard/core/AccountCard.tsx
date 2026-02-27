import { Badge, Button, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconArrowRight, IconWallet } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import {LINK_PATHS} from "../../../constants/LINK_PATHS.ts";
import type {AccountProps} from "../types/AccountProps.ts";
import {useAccountCard} from "./useAccountCard.ts";


const AccountCard = (props: AccountProps) => {

    const {
        id,
        balance,
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
                    RUB
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

            {/*<Link to={LINK_PATHS.ACCOUNT_DETAIL}>*/}
                <Button variant="light" fullWidth rightSection={<IconArrowRight size={16} />} onClick={openDetail}>
                    Подробнее
                </Button>
            {/*</Link>*/}
        </Card>
    );
};

export { AccountCard };
