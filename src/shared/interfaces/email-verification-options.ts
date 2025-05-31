export interface EmailVerificationOptions {
    token: string;
    successUrl?: string;
    failureUrl?: string;
    alreadyVerifiedUrl?: string;
}
