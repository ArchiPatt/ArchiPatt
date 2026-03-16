import type { AxiosResponse } from 'axios'

declare global {
   interface ApicraftAxiosResponse<Data = never> extends Omit<AxiosResponse, 'data'> {
      data: Data
   }
}
