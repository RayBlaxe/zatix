import { APIResponse } from "@/types/api";

export type RegisterResponse = APIResponse<{
    user: {
        name: string;
        email: string;
        roles: string[];
    };
    otp_code_for_testing?: string;
}>;


