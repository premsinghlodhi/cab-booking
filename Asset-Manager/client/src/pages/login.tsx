import { AppLayout } from "@/components/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Car, Loader2 } from "lucide-react";

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await login(data);
      if (user.role === "admin") setLocation("/dashboard/admin");
      else if (user.role === "driver") setLocation("/dashboard/driver");
      else setLocation("/dashboard/user");
    } catch (error) {
      // Error handled by mutation and UI toast if configured, or just display local error
      alert((error as Error).message);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md bg-card p-8 rounded-[2rem] shadow-2xl shadow-black/5 border border-border/50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-2xl">
              <Car className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-bold text-center mb-2">Welcome back</h2>
          <p className="text-center text-muted-foreground mb-8">Sign in to your Rydr account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Email Address</label>
              <input 
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-destructive text-sm ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <Link href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
              </div>
              <input 
                type="password"
                {...register("password")}
                className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-destructive text-sm ml-1">{errors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-4"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            Don't have an account? <Link href="/register" className="text-foreground font-semibold hover:text-primary transition-colors">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
