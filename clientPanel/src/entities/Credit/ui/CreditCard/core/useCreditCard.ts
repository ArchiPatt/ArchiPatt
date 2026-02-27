import type {CreditCardProps} from "../types/CreditCardProps.ts";
import {useEffect} from "react";

const useCreditCard = (props: CreditCardProps) => {
    const {
        tariffId,
        principalAmount, // Сумма кредита
        outstandingAmount, // Остаток
        status,
        issuedAt,
        nextPaymentDueAt,
        createdAt
    } = props

    const remainsPercantage = (outstandingAmount / principalAmount) * 100;

    // const [tariff, setTariff] = useState()
    //
    // const { data: tariffInfo } = useQuery({
    //     queryKey: ['tariffInfo'],
    //     queryFn: () => creditsApi.getTariffById(tariffId),
    //     enabled: !!tokenStorage.getItem(),
    //     retry: false,
    // });

    // useEffect(() => {
    //     if (tariffInfo) {
    //         setTariff(tariffInfo)
    //     }
    // }, [tariffInfo]);

    return {
        principalAmount,
        outstandingAmount,
        status,
        issuedAt,
        nextPaymentDueAt,
        createdAt,
        remainsPercantage,
        // tariff
    }
}

export { useCreditCard };