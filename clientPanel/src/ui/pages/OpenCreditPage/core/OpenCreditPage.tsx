import {
  Container,
  Card,
  Title,
  Text,
  Stack,
  Group,
  NumberInput,
  Button,
  Select,
  Box,
} from "@mantine/core";
import { IconCalculator } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useOpenCreditPage } from "../../../../useCases/pages/useOpenCreditPage.ts";
import {Loading} from "../../../components/Loading";

const OpenCreditPage = () => {
  const {
    filteredAccount,
    accountLoading,
    accountError,
    filteredTariff,
    tariffLoading,
    tariffError,
    choosenTariff,
    choosenAccount,
    amount,
    handleChooseTariff,
    handleChooseAccount,
    onChangeAmount,
    takeCredit,
    errorText,
  } = useOpenCreditPage();

  if (accountLoading || tariffLoading) {
    return (
        <Loading/>
    )
  }

  if (accountError || tariffError)
    return <div>Не удалось загрузить данные! Попробуйте позже</div>;

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group gap="lg" align="flex-start">
          <Card shadow="sm" padding="lg" radius="md" style={{ flex: 2 }}>
            <Title order={3}>Оформление кредита</Title>
            <Text color="dimmed" size="sm" mb="md">
              Заполните форму для получения кредита
            </Text>

            <Stack gap="md">
              <Select
                label="Счет для зачисления"
                placeholder="Выберите счет"
                data={filteredAccount?.map((a) => ({
                  value: a.id,
                  label: `${a.id} - ${a.balance}`,
                }))}
                value={choosenAccount}
                onChange={handleChooseAccount}
              />
              <Select
                label="Тариф"
                placeholder="Выберите тариф"
                data={filteredTariff.map((t) => ({
                  value: t.id,
                  label: `${t.name} – ${t.interestRate * 100}%`,
                }))}
                value={choosenTariff}
                onChange={handleChooseTariff}
              />

              <NumberInput
                label="Сумма кредита"
                value={amount}
                onChange={onChangeAmount}
                step={1000}
              />
              <Text color="red">{errorText}</Text>
              <Group gap="md">
                <Button style={{ flex: 1 }} color="blue" onClick={takeCredit}>
                  Оформить кредит
                </Button>
                <Link to="/" style={{ flex: 1 }}>
                  <Button variant="outline" style={{ width: "100%" }}>
                    Отмена
                  </Button>
                </Link>
              </Group>
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" style={{ flex: 1 }}>
            <Group mb="md">
              <IconCalculator size={20} />
              <Title order={4}>Расчет платежа</Title>
            </Group>

            <Stack gap="sm">
              <Box>
                <Text size="sm" color="dimmed">
                  Сумма кредита
                </Text>
                <Text size="lg" fw={700}>
                  {amount}
                </Text>
              </Box>

              <Box>
                <Text size="sm" color="dimmed">
                  Процентная ставка
                </Text>
                <Text size="lg" fw={500}>
                  {choosenTariff &&
                    filteredTariff.find((item) => item.id === choosenTariff)
                      ?.interestRate * 100}
                  %
                </Text>
              </Box>
            </Stack>
          </Card>
        </Group>
      </Stack>
    </Container>
  );
};

export { OpenCreditPage };
