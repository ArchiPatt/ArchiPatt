import type {creditCardProps} from "../types/CreditCardProps.ts";
import {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {tokenStorage} from "../../../app/storage/tokenStorage";
import {creditsApi} from "../../../api/credits/creditsApi.ts";


const useCreditCard = (props: creditCardProps) => {

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

    const [tariff, setTariff] = useState()

    const { data: tariffInfo } = useQuery({
        queryKey: ['tariffInfo'],
        queryFn: () => creditsApi.getTariffById(tariffId),
        enabled: !!tokenStorage.getItem(),
        retry: false,
    });

    useEffect(() => {
        if (tariffInfo) {
            setTariff(tariffInfo)
        }
    }, [tariffInfo]);

    return {
        principalAmount,
        outstandingAmount,
        status,
        issuedAt,
        nextPaymentDueAt,
        createdAt,
        remainsPercantage,
        tariff
    }
}

export { useCreditCard }