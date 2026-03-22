const getTransactionStatusColor = (status: string) => {
    if (status === 'deposit' || status === 'transfer_in') return 'green'
    if (status === 'credit_issue') return 'orange'
    if (status === 'transfer_out') return 'red'
    if (status === "withdraw") return 'red'

    return 'Неизвестен'
}

export { getTransactionStatusColor }