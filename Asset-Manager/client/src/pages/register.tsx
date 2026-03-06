import { AppLayout } from "@/components/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Loader2, User, Car } from "lucide-react";
import { useState, useEffect } from "react";

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerAuth, isRegistering } = useAuth();
  const [location, setLocation] = useLocation();
  const isDriverDefault = location.includes("role=driver");
  const [role, setRole] = useState<"user" | "driver">(isDriverDefault ? "driver" : "user");

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: isDriverDefault ? "driver" : "user"
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const user = await registerAuth({ ...data, role });
      if (user.role === "admin") setLocation("/dashboard/admin");
      else if (user.role === "driver") setLocation("/dashboard/driver");
      else setLocation("/dashboard/user");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <motion.div 
          className="w-full max-w-md bg-card p-8 rounded-[2rem] shadow-2xl shadow-black/5 border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl font-display font-bold text-center mb-2">Create an account</h2>
          <p className="text-center text-muted-foreground mb-8">Join Rydr today.</p>

          <div className="flex bg-accent p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === "user" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <User className="w-4 h-4" /> Rider
            </button>
            <button
              type="button"
              onClick={() => setRole("driver")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === "driver" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Car className="w-4 h-4" /> Driver
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground ml-1">Full Name</label>
              <input 
                type="text"
                {...register("name")}
                className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="John Doe"
              />
              {errors.name && <p className="text-destructive text-sm ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground ml-1">Email Address</label>
              <input 
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-destructive text-sm ml-1">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground ml-1">Phone Number</label>
              <input 
                type="tel"
                {...register("phone")}
                className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground ml-1">Password</label>
              <input 
                type="password"
                {...register("password")}
                className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-destructive text-sm ml-1">{errors.password.message}</p>}
            </div>

            {role === "driver" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 pt-2 border-t border-border mt-4"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground ml-1">Vehicle Details</label>
                  <input 
                    type="text"
                    {...register("vehicleDetails")}
                    className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    placeholder="Toyota Prius (Black) - XYZ 1234"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground ml-1">License Number</label>
                  <input 
                    type="text"
                    {...register("licenseNumber")}
                    className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    placeholder="DL-123456789"
                  />
                </div>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={isRegistering}
              className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 mt-6"
            >
              {isRegistering ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-foreground font-semibold hover:text-primary transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
