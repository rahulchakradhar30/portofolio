"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import type { AdminUser } from "@/app/lib/types";

export default function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="paper-card flex items-center justify-between gap-3 p-4 shadow-none md:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[var(--foreground)] bg-[var(--accent)] text-white shadow-[4px_4px_0_0_rgba(47,36,27,0.12)]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">Admin Users</h2>
            <p className="text-sm text-[var(--foreground)]/65">Authorized accounts and their access state.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-[var(--foreground)]/60">Loading...</div>
      ) : (
        <div className="paper-card overflow-hidden p-0 shadow-none">
          <table className="w-full border-collapse">
            <thead className="bg-[var(--surface-soft)] border-b-2 border-[var(--foreground)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-[var(--foreground)]/70">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-[var(--foreground)]/70">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-[var(--foreground)]/70">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-[var(--foreground)]/70">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[var(--foreground)]/10 hover:bg-[var(--surface-soft)]/70">
                  <td className="px-6 py-4 text-[var(--foreground)]">{user.email}</td>
                  <td className="px-6 py-4 text-[var(--foreground)]/70">{user.role || "admin"}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full border-2 px-3 py-1 text-xs font-semibold ${
                      user.status === 'active'
                        ? 'border-emerald-700 bg-emerald-100 text-emerald-800'
                        : 'border-red-700 bg-red-100 text-red-800'
                    }`}>
                      {user.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--foreground)]/70">{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
