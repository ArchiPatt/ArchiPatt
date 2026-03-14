import { Alert, Badge, Button, Center, Group, Loader, Stack, Table, Title } from '@mantine/core'
import { useTariffs } from '../../../useCases/pages/useTariffs'

export const Tariffs = () => {
   const { state, functions } = useTariffs()

   if (state.isLoading) {
      return (
         <Center h="100%">
            <Loader />
         </Center>
      )
   }

   if (state.isFetched && (!state.tariffsData || state.tariffsData.length === 0)) {
      return (
         <Alert color="blue" title="Тарифы">
            Тарифы не найдены
         </Alert>
      )
   }

   return (
      <Stack gap="md">
         <Group justify="space-between">
            <Title order={2}>Тарифы</Title>
            <Button onClick={functions.handleOpenCreateTariff}>Создать тариф</Button>
         </Group>
         <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
               <Table.Tr>
                  <Table.Th>Название тарифа</Table.Th>
                  <Table.Th>Процентная ставка</Table.Th>
                  <Table.Th>Период</Table.Th>
                  <Table.Th>Активен</Table.Th>
               </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
               {state.tariffsData?.map((tariff) => (
                  <Table.Tr key={tariff.id}>
                     <Table.Td>{tariff.name}</Table.Td>
                     <Table.Td>{`${(Number(tariff.interestRate) * 100).toFixed(2)}%`}</Table.Td>
                     <Table.Td>{tariff.billingPeriodDays} дней</Table.Td>
                     <Table.Td>
                        <Badge color={tariff.isActive ? 'green' : 'gray'}>
                           {tariff.isActive ? 'Активен' : 'Не активен'}
                        </Badge>
                     </Table.Td>
                  </Table.Tr>
               ))}
            </Table.Tbody>
         </Table>
      </Stack>
   )
}
