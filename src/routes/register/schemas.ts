import { z } from "zod";

export const RegisterAccountSchema = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string().min(8).max(72),
    passwordConfirm: z.string()
}).superRefine(({password, passwordConfirm}, ctx) => {
    if(password !== passwordConfirm) {
        ctx.addIssue({
            code: "custom",
            path: ["passwordConfirm"],
            message: "Passwords do not match"
        })
        ctx.addIssue({
            code: 'custom',
            path: ['password'],
            message: "Passwords do not match"
        })
    }
})