import { AppLayout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useRides, useBookRide } from "@/hooks/use-rides";
import { MockMap } from "@/components/mock-map";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function UserDashboard() {
  const { user } = useAuth();
  const { data: rides, isLoading: isLoadingRides } = useRides({ role: "user" });
  const { mutateAsync: bookRide, isPending: isBooking } = useBookRide();

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const activeRide = rides?.find(r => r.status === "pending" || r.status === "accepted" || r.status === "ongoing");
  const pastRides = rides?.filter(r => r.status === "completed" || r.status === "cancelled") || [];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !dropoff) return;
    try {
      await bookRide({
        userId: user!.id,
        pickupLocation: pickup,
        dropLocation: dropoff
      });
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
      setPickup("");
      setDropoff("");
    } catch (err) {
      console.error(err);
      alert("Failed to book ride");
    }
  };

  const getMapStatus = () => {
    if (activeRide?.status === "pending") return "searching";
    if (activeRide?.status === "accepted" || activeRide?.status === "ongoing") return "ongoing";
    return "idle";
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col md:flex-row gap-8 h-[calc(100vh-4rem)]">
        
        {/* Left Column: Actions & History */}
        <div className="w-full md:w-1/3 flex flex-col gap-6 h-full overflow-hidden">
          
          {/* Booking Card */}
          <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-border/50 shrink-0">
            <h2 className="text-2xl font-display font-bold mb-6">Where to?</h2>
            
            <AnimatePresence mode="wait">
              {activeRide ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-primary/10 border border-primary/20 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex h-3 w-3">
                      {activeRide.status === "pending" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>}
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </div>
                    <span className="font-semibold text-lg capitalize">{activeRide.status}</span>
                  </div>
                  <div className="space-y-3 relative">
                    <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-border"></div>
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="bg-background rounded-full p-1 border border-border shadow-sm mt-0.5"><MapPin className="w-3 h-3 text-secondary" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Pickup</p>
                        <p className="text-sm font-medium">{activeRide.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="bg-background rounded-full p-1 border border-border shadow-sm mt-0.5"><Navigation className="w-3 h-3 text-destructive" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Dropoff</p>
                        <p className="text-sm font-medium">{activeRide.dropLocation}</p>
                      </div>
                    </div>
                  </div>
                  {activeRide.driver && (
                    <div className="mt-4 pt-4 border-t border-primary/20 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                        {activeRide.driver.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{activeRide.driver.name}</p>
                        <p className="text-xs text-muted-foreground">Driver • {activeRide.driver.phone || "N/A"}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleBook} 
                  className="space-y-4"
                >
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><MapPin className="w-5 h-5" /></div>
                    <input 
                      required
                      value={pickup}
                      onChange={e => setPickup(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-accent border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                      placeholder="Current location"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><Navigation className="w-5 h-5" /></div>
                    <input 
                      required
                      value={dropoff}
                      onChange={e => setDropoff(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-accent border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                      placeholder="Destination"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isBooking}
                    className="w-full py-4 rounded-xl font-bold bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Ride"}
                  </button>
                  {bookingSuccess && (
                    <p className="text-green-600 text-sm font-medium flex items-center gap-1 justify-center">
                      <CheckCircle2 className="w-4 h-4" /> Ride requested successfully!
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Past Rides List */}
          <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-border/50 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-xl font-display font-bold mb-4">Past Rides</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {isLoadingRides ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : pastRides.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No past rides yet.</p>
                </div>
              ) : (
                pastRides.map(ride => (
                  <div key={ride.id} className="p-4 rounded-2xl bg-accent/50 hover:bg-accent transition-colors border border-transparent hover:border-border cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-foreground truncate max-w-[70%]">{ride.dropLocation}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${ride.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ride.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{ride.createdAt ? format(new Date(ride.createdAt), "MMM d, yyyy • h:mm a") : "Unknown date"}</p>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>${Number(ride.fare || 0).toFixed(2)}</span>
                      {ride.driver && <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Car className="w-3 h-3"/> {ride.driver.name}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Map */}
        <div className="w-full md:w-2/3 h-[400px] md:h-full rounded-[2rem] overflow-hidden shadow-xl border border-border/50">
          <MockMap 
            status={getMapStatus()} 
            pickup={activeRide?.pickupLocation || pickup} 
            dropoff={activeRide?.dropLocation || dropoff} 
          />
        </div>

      </div>
    </AppLayout>
  );
}
