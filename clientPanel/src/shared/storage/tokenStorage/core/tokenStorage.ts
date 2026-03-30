import {localStorageFactory} from "../../../localStorageFactory";

const tokenStorage = localStorageFactory<string>('tokenStorage')

export { tokenStorage }