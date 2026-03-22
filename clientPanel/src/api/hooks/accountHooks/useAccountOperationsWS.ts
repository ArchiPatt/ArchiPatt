import {useEffect, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {tokenStorage} from "../../../shared/storage/tokenStorage";
import type {AccountOperation} from "../../../../generated/api/core";

const useAccountOperationsWS = (id: string) => {
    const [operations, setOperations] = useState<AccountOperation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const queryClient = useQueryClient()

    useEffect(() => {

        if(!id) return

        const socket = new WebSocket(
            `ws://localhost:4003/ws/accounts/${id}/operations?authorization=Bearer ${tokenStorage.getItem()}`
        )
        socket.onopen = () => {
            setIsLoading(false)
        }
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === 'snapshot' && Array.isArray(data.items)) {
                setOperations(data.items)
            }
            if (data.type === 'operation_added' && 'operation' in data) {
                setOperations((prev) => [data.operation, ...prev])
                queryClient.invalidateQueries({ queryKey: ['account'] })
            }
        }
        return () => {
            socket.close()
        }
    }, [id])

    return { operations, isLoading }
}

export { useAccountOperationsWS }