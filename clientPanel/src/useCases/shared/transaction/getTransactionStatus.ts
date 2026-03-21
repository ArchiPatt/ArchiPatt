const getTransactionStatus = (status: string) => {
    if (status === 'deposit' || status === 'transfer_in') return 'Пополнение'
    if (status === 'credit_issue') return 'Начисление кредита'
    if (status === 'transfer_out') return 'Перевод'
    if (status === "withdraw") return 'Снятие'

    return 'Неизвестен'
}

export { getTransactionStatus }