import {Card, Table, Text, Title} from "@mantine/core";
import {useTransaction} from "../../../../useCases/components/useTransaction.ts";
import type {TransactionProps} from "../../../../types/transaction/TransactionProps.ts";
import {getTransactionStatus} from "../../../../useCases/shared/transaction/getTransactionStatus.ts";
import {getTransactionStatusColor} from "../../../../useCases/shared/transaction/getTransactionStatusColor.ts";

const Transaction = (props: TransactionProps) => {

    const {
        items
    } = useTransaction(props)

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
            <Title order={4} mb="md">
                История операций
            </Title>

            {items.length === 0 ?
                <Text>Операции не проводились</Text> :
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Дата</Table.Th>
                            <Table.Th>Тип</Table.Th>
                            <Table.Th>Сумма</Table.Th>
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {items.map((t) => (
                            <Table.Tr key={t.id}>
                                <Table.Td>
                                    {new Date(t.createdAt).toLocaleString('ru-RU')}
                                </Table.Td>
                                <Table.Td>
                                    {getTransactionStatus(t.type)}
                                </Table.Td>
                                <Table.Td
                                    style={{
                                        color:
                                        getTransactionStatusColor(t.type),
                                    }}
                                >
                                    {t.type === 'deposit' ? '+' : ''}
                                    {t.amount}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            }
        </Card>
    )
}

export { Transaction }