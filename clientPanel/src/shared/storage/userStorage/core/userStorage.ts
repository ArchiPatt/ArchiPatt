import {localStorageFactory} from "../../../localStorageFactory";

const userStorage = localStorageFactory<string>('userStorage');

export { userStorage }