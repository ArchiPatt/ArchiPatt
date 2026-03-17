/**
 * Маскирует ID счёта, показывая только первые и последние символы
 * @param id - полный ID счёта
 * @param visibleChars - количество видимых символов в начале и конце (по умолчанию 4)
 * @returns маскированный ID вида "abcd...efgh"
 */
export const maskAccountId = (id: string, visibleChars: number = 4): string => {
   if (!id) return ''
   
   if (id.length <= visibleChars * 2) {
      return id
   }
   
   const start = id.slice(0, visibleChars)
   const end = id.slice(-visibleChars)
   
   return `${start}...${end}`
}
