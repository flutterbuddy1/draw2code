'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('test@test.com');
    const [password, setPassword] = useState('123456');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting login with:", { email, password });
        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });
            console.log("Login response:", res);

            if (res?.error) {
                setError(`Login failed: ${res.error}`);
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Welcome back</h1>
                {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
                        Log in
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-zinc-500">
                    Don't have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
