export const formatMoney = (value?: string | null) => {
   if (!value) return '—'

   const number = Number(value)

   if (Number.isNaN(number)) return value

   return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 2
   }).format(number)
}
