"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button, Card, Input, Label, Text } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { PageLayout } from "@/components/templates";

const LoginPage = () => {
  const router = useRouter();
  const { handleLogin, isLoggingIn, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      await handleLogin(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.data?.message || "Invalid credentials");
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Text className="text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </Text>
          </div>
          <Card>
            <form className="space-y-6" onSubmit={onSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <FormField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
              <FormField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoggingIn}
                className="w-full"
              >
                {isLoggingIn ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
