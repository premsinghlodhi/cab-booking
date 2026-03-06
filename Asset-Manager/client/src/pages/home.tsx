import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Shield, Clock, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === "admin") setLocation("/dashboard/admin");
      else if (user.role === "driver") setLocation("/dashboard/driver");
      else setLocation("/dashboard/user");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) return null;

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col w-full h-full relative">
        {/* landing page hero scenic modern city road background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=1080&fit=crop" 
            alt="City Road" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/20 dark:from-background dark:via-background/95 dark:to-background/40"></div>
        </div>

        <div className="container mx-auto px-4 flex-1 flex items-center z-10 py-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary-foreground font-semibold text-sm mb-6 border border-primary/30">
                🚀 Reimagining Urban Mobility
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-foreground leading-tight mb-6">
                Your reliable ride, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-600">just a tap away.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-lg">
                Experience seamless travel with Go to hell. Safe, fast, and affordable rides available 24/7 across the city.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register"
                  className="px-8 py-4 rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 text-center flex items-center justify-center gap-2 text-lg"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/register?role=driver"
                  className="px-8 py-4 rounded-2xl font-bold bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center text-lg"
                >
                  Become a Driver
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {[
                { icon: MapPin, text: "Accurate Tracking" },
                { icon: Shield, text: "Verified Drivers" },
                { icon: Clock, text: "24/7 Availability" },
                { icon: CreditCard, text: "Seamless Payments" },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-start p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl mb-3">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
