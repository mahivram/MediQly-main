import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, HeartPulse, User, Stethoscope } from "lucide-react";
import "../index.css";
import { useLogin } from "../hooks/auth"; // Import useLogin hook

const formSchema = z.object({
  email: z.string().email("Must be a valid email"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"user" | "doctor">("user"); // New: Toggle between User & Doctor

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ✅ Use the `useLogin` hook and determine which login type to use
  const loginMutation = useLogin();

  const onSubmit = (values: { email: string; password: string }) => {
    loginMutation.mutate(
      { credentials: values, loginType },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: `${
              loginType === "user" ? "User" : "Doctor"
            } logged in successfully. Redirecting... to home Page`,
          });
          navigate("/");
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              (error as any)?.response?.data.message || "Login failed",
          });
        },
      }
    );
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left Side with Background */}
      <div
        style={{ backgroundImage: `url("../../aiH.jpg")` }}
        className="relative hidden h-full bg-cover bg-center flex-col bg-muted p-10 text-white dark:border-r lg:flex"
      >
        <div className="relative z-20 flex items-center gap-2 text-lg font-bold primary-grad">
          <HeartPulse className="h-6 w-6" />
          MediQly
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "This healthcare platform has revolutionized how I manage my
              health and wellness journey."
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side Login Form */}
      <div className="p-4 lg:p-8 h-full flex items-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {loginType === "user" ? "User Login" : "Doctor Login"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to sign in as a {loginType}.
            </p>
          </div>

          {/* User & Doctor Toggle Buttons */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={loginType === "user" ? "default" : "outline"}
              onClick={() => setLoginType("user")}
            >
              <User className="h-4 w-4 mr-2" />
              User
            </Button>
            <Button
              variant={loginType === "doctor" ? "default" : "outline"}
              onClick={() => setLoginType("doctor")}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Doctor
            </Button>
          </div>

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="placeholder:text-gray-300"
                          {...field}
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          {/* Sign-Up Link */}
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?
            <Link
              to={loginType === "user" ? "/register" : "/doc-register"}
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up as a {loginType}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
