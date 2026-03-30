import {localStorageFactory} from "../../../localStorageFactory";

const refreshStorage = localStorageFactory<string>('refreshStorage');

export { refreshStorage };