import { z } from "zod";

export const LoginWithPasswordSchema = z.object({
    email: z.string(),
    password: z.string()
})