import { Power, Package, IndianRupee, Zap } from "lucide-react";

interface RiderHomeProps {
  isOnline: boolean;
  toggleOnline: () => void;
  todayEarnings: number;
  todayDeliveries: number;
  activeOrders: number;
}

const RiderHome = ({ isOnline, toggleOnline, todayEarnings, todayDeliveries, activeOrders }: RiderHomeProps) => {
  return (
    <div className="space-y-6">
      {/* Big Online/Offline Toggle */}
      <div className="flex flex-col items-center justify-center py-10">
        <button
          onClick={toggleOnline}
          className={`w-36 h-36 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            isOnline
              ? "bg-green-500 text-white shadow-green-500/30 scale-105"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Power className="w-16 h-16" />
        </button>
        <p className={`mt-4 font-heading text-2xl font-bold uppercase tracking-wider ${isOnline ? "text-green-600" : "text-muted-foreground"}`}>
          {isOnline ? "ONLINE" : "OFFLINE"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {isOnline ? "You are receiving orders" : "Tap to go online and receive orders"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl p-4 shadow-card text-center">
          <IndianRupee className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="font-heading text-xl font-bold text-primary">{todayEarnings}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">TODAY</p>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card text-center">
          <Package className="w-6 h-6 text-foreground mx-auto mb-2" />
          <p className="font-heading text-xl font-bold text-foreground">{todayDeliveries}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">DELIVERIES</p>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card text-center">
          <Zap className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <p className="font-heading text-xl font-bold text-orange-500">{activeOrders}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">ACTIVE</p>
        </div>
      </div>

      {!isOnline && (
        <div className="bg-secondary/50 rounded-2xl p-6 text-center">
          <p className="text-muted-foreground text-sm">You are currently offline. Go online to start receiving delivery requests.</p>
        </div>
      )}
    </div>
  );
};

export default RiderHome;
