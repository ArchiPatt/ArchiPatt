import axios from "axios";

const instance = axios.create({ baseURL: 'test' })

export { instance }