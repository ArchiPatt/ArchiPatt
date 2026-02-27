interface accountOperations {
   id: string
   accountId: string
   amount: string
   type: string
   correlationId: string
   idempotencyKey: string
    //meta пока строка
   meta: string
   createdAt: string
}

export type { accountOperations }