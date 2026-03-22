import type {CreditCardProps} from "../../ui/components/CreditCard/types/CreditCardProps.ts";
import {LINK_PATHS} from "../../shared/constants/LINK_PATHS.ts";
import {useNavigate} from "react-router-dom";
import {remainsPercantage} from "../../shared/utils/remainsPercantage.ts";

const useCreditCard = (props: CreditCardProps) => {
    const {
        creditInformation,
        percent,
    } = props

    const navigate = useNavigate();

    const percantage = remainsPercantage(Number(creditInformation.principalAmount), Number(creditInformation.outstandingAmount))
    const interestRate = Number(percent) * 100

    const openDetail = () => {
        navigate(LINK_PATHS.CREDIT_DETAIL.replace(':id', String(creditInformation.id)))
    }

    return {
        creditInformation,
        percantage,
        interestRate,
        openDetail,
    }
}

export { useCreditCard };