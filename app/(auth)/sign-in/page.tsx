'use client';

import FooterLink from "@/components/forms/FooterLink";
import { useForm } from "react-hook-form";
import InputField from "@/components/forms/InputField";
import {Button} from "@/components/ui/button";
import {signInWithEmail} from "@/lib/actions/auth.actions";
import {router} from "next/client";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

const SignIn = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);
            if(result.success) router.push('/');
        } catch (e) {
            console.error(e);
            toast.error('Sign in failed', {
                description: e instanceof Error ? e.message : 'Failed to sign in.'
            })
        }
    }
    return (
        <>
        <h1 className="form-title">Welcome Back</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <InputField
                name="email"
                label="Email"
                placeholder="contact@gmail.com"
                register={register}
                error={errors.email}
                validation={{ required: 'Email name is required', pattern: /^\w+@\w+\.\w+$/, message: 'Email address is required' }}
            />

            <InputField
                name="password"
                label="Password"
                placeholder="Enter a strong password"
                type="password"
                register={register}
                error={errors.password}
                validation={{ required: 'Password is required', minLength: 8 }}
            />

            <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                {isSubmitting ? 'Creating Account' : 'Start Your Investment Journey'}
            </Button>

            <FooterLink text="Don't have an account?" linkText="Sign up" href="/sign-up" />
        </form>
            </>
    )
}
export default SignIn
