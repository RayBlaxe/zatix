import { APIResponse } from "@/types/api";

export type RegisterResponse = APIResponse<{
    email: string;
    otp_code: string;
}>;


