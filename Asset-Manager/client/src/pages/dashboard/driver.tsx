import { AppLayout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useRides, useUpdateRideStatus } from "@/hooks/use-rides";
import { useUpdateDriverStatus } from "@/hooks/use-drivers";
import { motion } from "framer-motion";
import { Car, MapPin, Navigation, Clock, CheckCircle2, ChevronRight, Loader2, Power } from "lucide-react";
import { format } from "date-fns";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { data: rides, isLoading: isLoadingRides } = useRides({ role: "driver" });
  const { mutate: updateRideStatus, isPending: isUpdating } = useUpdateRideStatus();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateDriverStatus();

  // The schema adds driverProfile to user when fetching /api/auth/me
  const profile = user?.driverProfile;
  const isOnline = profile?.availabilityStatus || false;

  const pendingRides = rides?.filter(r => r.status === "pending") || [];
  const activeRide = rides?.find(r => r.status === "accepted" || r.status === "ongoing");
  const pastRides = rides?.filter(r => r.status === "completed" || r.status === "cancelled") || [];

  const handleToggleOnline = () => {
    updateStatus(!isOnline);
  };

  const handleAccept = (id: number) => {
    updateRideStatus({ id, status: "accepted" });
  };

  const handleStart = (id: number) => {
    updateRideStatus({ id, status: "ongoing" });
  };

  const handleComplete = (id: number) => {
    updateRideStatus({ id, status: "completed" });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-card p-6 rounded-[2rem] shadow-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <Car className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Hello, {user?.name}</h1>
              <p className="text-muted-foreground text-sm font-medium mt-1">
                Vehicle: {profile?.vehicleDetails || "Not specified"} • Plate: {profile?.licenseNumber || "N/A"}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleToggleOnline}
            disabled={isUpdatingStatus}
            className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold shadow-md transition-all ${
              isOnline 
                ? "bg-green-500 text-white hover:bg-green-600 shadow-green-500/25" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
            }`}
          >
            <Power className="w-5 h-5" />
            {isUpdatingStatus ? "Updating..." : isOnline ? "Online (Receiving requests)" : "Go Online"}
          </button>
        </div>

        {!profile?.verified && (
          <div className="bg-orange-100 border border-orange-200 text-orange-800 p-4 rounded-xl mb-8 font-medium">
            Your account is currently pending verification. You may not receive ride requests until an admin verifies your profile.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Active / Pending Requests */}
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-primary' : 'bg-muted-foreground'}`}></span>
              </span>
              Current Status
            </h2>

            {activeRide ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-[2rem] p-6 shadow-xl border-2 border-primary/30"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-primary/20 text-primary font-bold px-3 py-1 rounded-full text-sm uppercase tracking-wide">
                    {activeRide.status}
                  </span>
                  <span className="font-bold text-xl">${Number(activeRide.fare || 0).toFixed(2)}</span>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="mt-1"><MapPin className="w-5 h-5 text-secondary" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase">Pickup Location</p>
                      <p className="font-medium text-lg">{activeRide.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1"><Navigation className="w-5 h-5 text-destructive" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase">Dropoff Location</p>
                      <p className="font-medium text-lg">{activeRide.dropLocation}</p>
                    </div>
                  </div>
                </div>

                {activeRide.user && (
                  <div className="flex items-center gap-3 p-4 bg-accent rounded-2xl mb-6">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-bold">
                      {activeRide.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{activeRide.user.name}</p>
                      <p className="text-xs text-muted-foreground">{activeRide.user.phone || "No phone provided"}</p>
                    </div>
                  </div>
                )}

                {activeRide.status === "accepted" ? (
                  <button 
                    onClick={() => handleStart(activeRide.id)}
                    disabled={isUpdating}
                    className="w-full py-4 rounded-xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg transition-all"
                  >
                    Start Ride
                  </button>
                ) : (
                  <button 
                    onClick={() => handleComplete(activeRide.id)}
                    disabled={isUpdating}
                    className="w-full py-4 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/25 transition-all"
                  >
                    Complete Ride
                  </button>
                )}
              </motion.div>
            ) : pendingRides.length > 0 ? (
              <div className="space-y-4">
                {pendingRides.map(ride => (
                  <motion.div 
                    key={ride.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card rounded-2xl p-5 shadow-lg border border-border"
                  >
                    <div className="flex justify-between mb-4">
                      <span className="font-bold text-lg">${Number(ride.fare || 0).toFixed(2)}</span>
                      <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4"/> 2 min away</span>
                    </div>
                    <div className="space-y-2 mb-6">
                      <p className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-secondary shrink-0"/> <span className="truncate">{ride.pickupLocation}</span></p>
                      <p className="text-sm font-medium flex items-center gap-2"><Navigation className="w-4 h-4 text-destructive shrink-0"/> <span className="truncate">{ride.dropLocation}</span></p>
                    </div>
                    <button 
                      onClick={() => handleAccept(ride.id)}
                      disabled={isUpdating}
                      className="w-full py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      Accept Ride
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-[2rem] p-12 shadow-md border border-border/50 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-10 h-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-bold mb-2">No requests yet</h3>
                <p className="text-muted-foreground max-w-[250px]">Stay online to receive ride requests in your area.</p>
              </div>
            )}
          </div>

          {/* Ride History */}
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold">Today's Earnings</h2>
            <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-border/50 h-[calc(100%-3rem)] flex flex-col">
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total Earned</p>
                <p className="text-4xl font-display font-bold text-green-500">
                  ${pastRides.reduce((acc, r) => acc + (r.status === 'completed' ? Number(r.fare || 0) : 0), 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">{pastRides.filter(r => r.status === 'completed').length} completed rides</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {isLoadingRides ? (
                  <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
                ) : pastRides.length === 0 ? (
                  <p className="text-center text-muted-foreground italic py-8">No completed rides today.</p>
                ) : (
                  pastRides.map(ride => (
                    <div key={ride.id} className="p-4 rounded-2xl bg-accent/50 border border-transparent hover:border-border transition-colors">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-sm">${Number(ride.fare || 0).toFixed(2)}</span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {ride.createdAt ? format(new Date(ride.createdAt), "h:mm a") : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate max-w-[45%]">{ride.pickupLocation}</span>
                        <ChevronRight className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[45%]">{ride.dropLocation}</span>
                      </div>
                      <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${ride.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ride.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
