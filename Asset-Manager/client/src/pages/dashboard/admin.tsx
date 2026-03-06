import { AppLayout } from "@/components/layout";
import { useRides } from "@/hooks/use-rides";
import { useDrivers, useVerifyDriver } from "@/hooks/use-drivers";
import { Users, Car, Map, CheckCircle, Shield, XCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: rides } = useRides();
  const { data: drivers } = useDrivers();
  const { mutate: verifyDriver, isPending: isVerifying } = useVerifyDriver();
  
  const [activeTab, setActiveTab] = useState<"overview" | "drivers" | "rides">("overview");

  const pendingDrivers = drivers?.filter(d => !d.driverProfile?.verified) || [];
  const verifiedDrivers = drivers?.filter(d => d.driverProfile?.verified) || [];
  const completedRides = rides?.filter(r => r.status === "completed") || [];
  
  const totalRevenue = completedRides.reduce((acc, r) => acc + Number(r.fare || 0), 0);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Admin Control Center</h1>

        {/* Tabs */}
        <div className="flex bg-accent/50 p-1 rounded-xl mb-8 w-fit border border-border">
          {[
            { id: "overview", label: "Overview", icon: Map },
            { id: "drivers", label: "Drivers Verification", icon: Shield },
            { id: "rides", label: "All Rides", icon: Car },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
              {tab.id === "drivers" && pendingDrivers.length > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                  {pendingDrivers.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, desc: "From completed rides" },
                { title: "Active Rides", value: rides?.filter(r => r.status === "ongoing").length || 0, desc: "Currently on the road" },
                { title: "Verified Drivers", value: verifiedDrivers.length, desc: "Ready to accept requests" },
                { title: "Pending Drivers", value: pendingDrivers.length, desc: "Requires verification" },
              ].map((stat, i) => (
                <div key={i} className="bg-card p-6 rounded-2xl shadow-lg border border-border/50">
                  <h3 className="text-muted-foreground font-semibold text-sm mb-2">{stat.title}</h3>
                  <p className="text-3xl font-display font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-card p-6 rounded-2xl shadow-lg border border-border/50">
              <h2 className="text-xl font-display font-bold mb-4">Platform Health</h2>
              <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> System Operational</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Payments Gateway Online</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "drivers" && (
          <div className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-accent/20">
              <h2 className="text-lg font-bold">Driver Verification Queue</h2>
            </div>
            <div className="divide-y divide-border">
              {pendingDrivers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No drivers pending verification.</div>
              ) : (
                pendingDrivers.map(driver => (
                  <div key={driver.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-accent/30 transition-colors">
                    <div>
                      <h3 className="font-bold text-lg">{driver.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1 space-y-1">
                        <p>Email: {driver.email} | Phone: {driver.phone || "N/A"}</p>
                        <p className="font-medium text-foreground">Vehicle: {driver.driverProfile?.vehicleDetails}</p>
                        <p className="font-medium text-foreground">License: {driver.driverProfile?.licenseNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => verifyDriver(driver.id)}
                        disabled={isVerifying}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Verify
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "rides" && (
          <div className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-accent/50 text-muted-foreground uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Passenger</th>
                    <th className="px-6 py-4">Driver</th>
                    <th className="px-6 py-4">Fare</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rides?.map(ride => (
                    <tr key={ride.id} className="hover:bg-accent/20">
                      <td className="px-6 py-4 font-mono text-muted-foreground">#{ride.id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                          ${ride.status === 'completed' ? 'bg-green-100 text-green-700' : 
                            ride.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                            ride.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 
                            'bg-yellow-100 text-yellow-700'}`}>
                          {ride.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{ride.user?.name || `User ${ride.userId}`}</td>
                      <td className="px-6 py-4">{ride.driver?.name || "Unassigned"}</td>
                      <td className="px-6 py-4 font-bold text-foreground">${Number(ride.fare || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {ride.createdAt ? format(new Date(ride.createdAt), "MMM d, yyyy HH:mm") : "N/A"}
                      </td>
                    </tr>
                  ))}
                  {(!rides || rides.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No rides found in the system.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
