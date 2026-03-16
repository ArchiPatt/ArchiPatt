export const formatMoney = (value?: string | null, currency: string = 'RUB') => {
   if (!value) return '–'

   const number = Number(value)

   if (Number.isNaN(number)) return value

   return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
   }).format(number)
}
