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
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#8d6b4e]">
          <Activity size={20} />
        </div>
        <h2 className="text-2xl font-bold text-[#2f241b]">Activity Logs</h2>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8d6b4e]/20 border-t-[#8d6b4e]" />
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-500">
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
              className="rounded-xl border border-[#7a5f47]/10 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {activity.status === "error" || activity.status === "failed" ? (
                      <AlertCircle size={16} className="text-red-500" />
                    ) : (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                    <p className="font-semibold text-gray-900">{activity.action}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
                    {activity.email && (
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-gray-400" />
                        <span>{activity.email}</span>
                      </div>
                    )}
                    {activity.ip && (
                      <div className="flex items-center gap-1.5">
                        <Globe size={14} className="text-gray-400" />
                        <span className="font-mono">{activity.ip}</span>
                      </div>
                    )}
                    {activity.path && (
                      <div className="flex items-center gap-1.5 rounded bg-gray-100 px-1.5 py-0.5 font-mono">
                        {activity.path}
                      </div>
                    )}
                  </div>
                  
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="mt-2 rounded-lg bg-gray-50 p-2.5 text-xs font-mono text-gray-600">
                      {JSON.stringify(activity.details, null, 2)}
                    </div>
                  )}
                </div>

                <div className="shrink-0 text-xs text-gray-500">
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
