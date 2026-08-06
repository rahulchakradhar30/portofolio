"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, User, Globe, AlertCircle, CheckCircle } from "lucide-react";

type ActivityLog = {
  id: string;
  action: string;
  email?: string;
  ip?: string;
  status?: string;
  path?: string;
  details?: Record<string, unknown>;
  timestamp?: string;
};

export default function ActivityTab() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const res = await fetch("/api/admin/activity");
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error("Error loading activities:", error);
      } finally {
        setLoading(false);
      }
    };
    loadActivities();
  }, []);

  return (
    <div className="space-y-6">
      <div className="paper-card flex items-center gap-3 p-4 shadow-none md:p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[var(--foreground)] bg-[var(--accent)] text-white shadow-[4px_4px_0_0_rgba(47,36,27,0.12)]">
          <Activity size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">Activity Logs</h2>
          <p className="text-sm text-[var(--foreground)]/65">Recent admin events and request traces.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--foreground)]/20 border-t-[var(--accent)]" />
        </div>
      ) : activities.length === 0 ? (
        <div className="paper-card rounded-2xl border-dashed py-12 text-center text-[var(--foreground)]/60 shadow-none">
          No activity logs found.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, i) => (
            <motion.div
              key={activity.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="paper-card p-4 shadow-none"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {activity.status === "error" || activity.status === "failed" ? (
                      <AlertCircle size={16} className="text-red-500" />
                    ) : (
                      <CheckCircle size={16} className="text-emerald-600" />
                    )}
                    <p className="font-semibold text-[var(--foreground)]">{activity.action}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--foreground)]/70">
                    {activity.email && (
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-[var(--foreground)]/35" />
                        <span>{activity.email}</span>
                      </div>
                    )}
                    {activity.ip && (
                      <div className="flex items-center gap-1.5">
                        <Globe size={14} className="text-[var(--foreground)]/35" />
                        <span className="font-mono">{activity.ip}</span>
                      </div>
                    )}
                    {activity.path && (
                      <div className="flex items-center gap-1.5 rounded-full border border-[var(--foreground)]/10 bg-[var(--surface-soft)] px-2 py-1 font-mono">
                        {activity.path}
                      </div>
                    )}
                  </div>
                  
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="mt-2 rounded-2xl border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] p-3 text-xs font-mono text-[var(--foreground)]/70">
                      {JSON.stringify(activity.details, null, 2)}
                    </div>
                  )}
                </div>

                <div className="shrink-0 text-xs text-[var(--foreground)]/55">
                  {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'N/A'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
