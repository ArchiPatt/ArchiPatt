import { Badge, Button, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconArrowRight, IconWallet } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import {LINK_PATHS} from "@/constants/LINK_PATHS.ts";


const AccountCard = () => {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 420 }}>
            <Group justify="space-between" mb="md">
                <Group gap="md">
                    <ThemeIcon size={48} radius="xl" variant="light" color="blue">
                        <IconWallet size={24} />
                    </ThemeIcon>

                    <div>
                        <Text size="sm" c="dimmed">
                            тип
                        </Text>
                        <Text fw={500} ff="monospace">
                            123
                        </Text>
                    </div>
                </Group>

                {/*<Badge variant={account.type === "savings" ? "light" : "filled"}>*/}
                {/*    123*/}
                {/*</Badge>*/}
                <Badge>
                    123
                </Badge>
            </Group>

            <Stack gap={4} mb="lg">
                <Text size="sm" c="dimmed">
                    Доступный баланс
                </Text>
                <Text size="xl" fw={700}>
                    123
                </Text>
                <Text size="xs" c="dimmed">
                    Открыт
                </Text>
            </Stack>

            <Link to={LINK_PATHS.ACCOUNT_DETAIL}>
                <Button variant="light" fullWidth rightSection={<IconArrowRight size={16} />}>
                    Подробнее
                </Button>
            </Link>
        </Card>
    );
};

export { AccountCard };
