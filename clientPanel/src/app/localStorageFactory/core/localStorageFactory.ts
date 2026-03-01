const localStorageFactory = (namespace: string) => {

    return {
        setItem: (value: any) => {
            localStorage.setItem(namespace, JSON.stringify(value))
        },

        getItem: () => {
            const item = localStorage.getItem(namespace)
            if (item) {
                return JSON.parse(item)
            }
            return null
        },

        removeItem: () => {
            localStorage.removeItem(namespace)
        },
    }

}

export { localStorageFactory }