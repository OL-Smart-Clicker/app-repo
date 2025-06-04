import { Role } from "./role"

export type User = {
    id: string,
    role?: Role,
    userPrincipalName?: string,
    givenName?: string,
    surname?: string,
    displayName?: string
}