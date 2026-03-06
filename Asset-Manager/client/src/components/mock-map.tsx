import { motion } from "framer-motion";
import { MapPin, Navigation, Car } from "lucide-react";

export function MockMap({ 
  status = "idle",
  pickup,
  dropoff,
  driverLocation
}: { 
  status?: "idle" | "searching" | "ongoing" | "completed";
  pickup?: string;
  dropoff?: string;
  driverLocation?: { lat: number, lng: number };
}) {
  return (
    <div className="w-full h-full min-h-[400px] rounded-3xl bg-accent/20 map-grid relative overflow-hidden border border-border/50 shadow-inner flex items-center justify-center">
      {/* Decorative map elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      {status === "idle" && (
        <div className="text-center text-muted-foreground flex flex-col items-center">
          <MapPin className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">Enter your destination to see the route</p>
        </div>
      )}

      {status === "searching" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 bg-primary/50 rounded-full animate-ping" style={{ animationDelay: '300ms' }}></div>
              <div className="relative bg-primary text-primary-foreground p-3 rounded-full shadow-xl">
                <Navigation className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 font-display font-bold text-lg animate-pulse">Finding your driver...</p>
          </div>
        </div>
      )}

      {(status === "ongoing" || status === "completed") && (
        <div className="absolute inset-0 p-8">
          {/* Mock Route Line */}
          <svg className="w-full h-full absolute inset-0 overflow-visible" preserveAspectRatio="none">
            <motion.path 
              d="M 20% 80% Q 40% 20% 80% 30%" 
              fill="transparent" 
              stroke="hsl(var(--primary))" 
              strokeWidth="6" 
              strokeLinecap="round"
              strokeDasharray="10 15"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>

          {/* Pickup Pin */}
          <motion.div 
            className="absolute left-[20%] bottom-[20%] -translate-x-1/2 translate-y-1/2 flex flex-col items-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <div className="bg-secondary text-secondary-foreground p-2 rounded-full shadow-lg z-10 relative">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mt-2 shadow-sm border border-border whitespace-nowrap">
              {pickup || "Pickup"}
            </div>
          </motion.div>

          {/* Dropoff Pin */}
          <motion.div 
            className="absolute left-[80%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            <div className="bg-destructive text-destructive-foreground p-2 rounded-full shadow-lg z-10 relative">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mt-2 shadow-sm border border-border whitespace-nowrap">
              {dropoff || "Dropoff"}
            </div>
          </motion.div>

          {/* Moving Car */}
          {status === "ongoing" && (
            <motion.div 
              className="absolute flex items-center justify-center z-20"
              initial={{ left: "20%", bottom: "20%" }}
              animate={{ left: "50%", bottom: "50%" }} // Just mocking mid-way
              transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
            >
              <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] border-2 border-background map-blip">
                <Car className="w-6 h-6" />
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
