import {Card, Table, Text, Title} from "@mantine/core";
import type {AccountOperationsPage} from "../../../../types/transaction/AccountOperationsPage.ts";
import {useTransaction} from "../../../../useCases/components/useTransaction.ts";
import {useEffect} from "react";

const Transaction = (props: AccountOperationsPage) => {

    const {
        slicedArray,
    } = useTransaction(props)


    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
            <Title order={4} mb="md">
                История операций
            </Title>

            {slicedArray.length === 0 ?
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
                        {slicedArray.map((t) => (
                            <Table.Tr key={t.id}>
                                <Table.Td>
                                    {new Date(t.createdAt).toLocaleString('ru-RU')}
                                </Table.Td>
                                <Table.Td>
                                    {t.type === 'deposit'
                                        ? 'Пополнение'
                                        : t.type === 'credit'
                                        ? 'Начисление кредита'
                                        : 'Снятие'}
                                </Table.Td>
                                <Table.Td
                                    style={{
                                        color:
                                            t.type === 'deposit'
                                                ? 'green'
                                                : t.type === 'credit'
                                                ? 'orange'
                                                : 'red',
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