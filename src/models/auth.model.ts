export interface Credentials
{
    email: string;
    password: string;
}

export interface ChangePasswordReq
{
    password: string;
    newPassword: string;
}

export interface ResetPWDTokenReq
{
    email: string;
    url: string;
}

export interface PayloadData {
    userId: number;
    email: string;
    role: string;
}