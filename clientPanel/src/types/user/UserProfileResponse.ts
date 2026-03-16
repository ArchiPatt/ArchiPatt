interface UserProfileResponse {
    id: string
    username: string
    displayName: string
    roles: string[]
    isBlocked: boolean
}

export type { UserProfileResponse }