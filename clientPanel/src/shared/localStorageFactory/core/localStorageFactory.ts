const localStorageFactory = <T>(namespace: string) => {

    return {
        setItem: (value: T) => {
            localStorage.setItem(namespace, JSON.stringify(value))
        },

        getItem: (): T | null => {
            const item = localStorage.getItem(namespace)
            if (item) {
                return JSON.parse(item) as T
            }
            return null
        },

        removeItem: () => {
            localStorage.removeItem(namespace)
        },
    }

}

export { localStorageFactory }