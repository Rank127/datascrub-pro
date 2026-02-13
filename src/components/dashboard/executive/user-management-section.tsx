"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { PlanBadge } from "../plan-badge";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  effectivePlan: string;
  planSource: "DIRECT" | "FAMILY" | "FREE";
  familyOwner: string | null;
  familyGroupInfo: { memberCount: number; maxMembers: number } | null;
  createdAt: string;
  emailVerified: string | null;
  _count: {
    exposures: number;
    scans: number;
  };
}

const roleColors: Record<string, string> = {
  USER: "bg-slate-500/20 text-slate-400",
  SEO_MANAGER: "bg-blue-500/20 text-blue-400",
  SUPPORT: "bg-yellow-500/20 text-yellow-400",
  ADMIN: "bg-purple-500/20 text-purple-400",
  LEGAL: "bg-orange-500/20 text-orange-400",
  SUPER_ADMIN: "bg-red-500/20 text-red-400",
};

const roleLabels: Record<string, string> = {
  USER: "User",
  SEO_MANAGER: "SEO Manager",
  SUPPORT: "Support",
  ADMIN: "Admin",
  LEGAL: "Legal/DPO",
  SUPER_ADMIN: "Super Admin",
};

export function UserManagementSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });
        if (search) params.set("search", search);
        if (roleFilter) params.set("role", roleFilter);

        const response = await fetch(`/api/admin/users?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.pagination.total);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, search, roleFilter, refreshTrigger]);

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setEditRole(user.role);
  };

  const handleSaveRole = async () => {
    if (!editUser) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser.id,
          role: editRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user");
      }

      toast.success(`Role updated to ${roleLabels[editRole]}`);
      setEditUser(null);
      setRefreshTrigger(n => n + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Users className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">User Management</h3>
            <p className="text-sm text-slate-400">
              {totalUsers.toLocaleString()} total users
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700"
              />
            </div>
            <Select value={roleFilter || "all"} onValueChange={(v) => { setRoleFilter(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="SEO_MANAGER">SEO Manager</SelectItem>
                <SelectItem value="SUPPORT">Support</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="LEGAL">Legal/DPO</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-slate-600 mb-3" />
              <p className="text-slate-400">No users found</p>
              <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">User</TableHead>
                      <TableHead className="text-slate-400">Role</TableHead>
                      <TableHead className="text-slate-400">Plan</TableHead>
                      <TableHead className="text-slate-400">Activity</TableHead>
                      <TableHead className="text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{user.email}</div>
                            {user.name && (
                              <div className="text-sm text-slate-400">{user.name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={roleColors[user.role] || roleColors.USER}>
                            {roleLabels[user.role] || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <PlanBadge plan={user.effectivePlan} variant="outline" />
                            {user.familyGroupInfo ? (
                              <span className="text-xs text-emerald-500">
                                Owner ({user.familyGroupInfo.memberCount}/{user.familyGroupInfo.maxMembers})
                              </span>
                            ) : user.planSource === "FAMILY" && (
                              <span className="text-xs text-slate-500">
                                via {user.familyOwner}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-400">
                            <span className="text-white">{user._count.scans}</span> scans
                            <span className="mx-1">·</span>
                            <span className="text-white">{user._count.exposures}</span> exposures
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white"
                            onClick={() => handleEditUser(user)}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-slate-800">
                <p className="text-sm text-slate-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User Role</DialogTitle>
            <DialogDescription className="text-slate-400">
              Change the role for {editUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User - Regular customer</SelectItem>
                <SelectItem value="SEO_MANAGER">SEO Manager - Marketing only</SelectItem>
                <SelectItem value="SUPPORT">Support - Masked PII access</SelectItem>
                <SelectItem value="ADMIN">Admin - User management</SelectItem>
                <SelectItem value="LEGAL">Legal/DPO - Full PII for compliance</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin - Full access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditUser(null)}
              className="border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={saving || editRole === editUser?.role}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
