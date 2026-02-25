import { Alert, Badge, Button, Group, Stack, Table, Title } from '@mantine/core'
import { useTariffsQuery } from '../../api/hooks/useTariffsQuery'
import { modals } from '@mantine/modals'

export const Tariffs = () => {
   const tariffs = useTariffsQuery()

   const handleOpenCreateTariff = () => {
      modals.openContextModal({
         modal: 'createTariff',
         title: 'Создать тариф',
         innerProps: {}
      })
   }

   if (tariffs.isFetched && (!tariffs.data || tariffs.data.data.length === 0)) {
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
            <Button onClick={handleOpenCreateTariff}>Создать тариф</Button>
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
               {tariffs.data?.data.map((tariff) => (
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
