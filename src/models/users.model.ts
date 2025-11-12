export enum Role {
    ADMIN = "ADMIN",
    VIEWER = "VIEWER",
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
}