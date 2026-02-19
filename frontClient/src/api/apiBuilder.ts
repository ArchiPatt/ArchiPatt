import axios from "axios"

type methodType = 'get' | 'post' | 'put' | 'patch' | 'delete';

interface AxiosConfig {
    method: methodType
    url: string
    headers: Record<string, string>
    params?: Record<string, string>
    data: any
}

function apiBuilder() {
    const requestParms: AxiosConfig = {
        method: "get",
        url: "",
        headers: {},
        data: {}
    }

    return {
        setMethod(method: methodType) {
            requestParms.method = method
            return this
        },
        setUrl(url: string) {
            requestParms.url = url
            return this
        },
        setHeaders(headers: Record<string, string>) {
            requestParms.headers = headers
            return this
        },
        setParams(params: Record<string, string>) {
            requestParms.params = params
            return this
        },
        setData(data: any) {
            requestParms.data = data
            return this
        },
        applyRequest() {
            return axios(requestParms)
        }
    }
}

export { apiBuilder }