"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Shield,
  Search,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
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

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);

      const response = await fetch(`/api/admin/users?${params}`);

      if (response.status === 403) {
        setError("You don't have permission to access the admin panel");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-white text-lg">Access Denied</p>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-500" />
          Admin Panel
        </h1>
        <p className="text-slate-400">
          Manage users, roles, and system settings
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-white">
                {users.length}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">Total Users</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">User Management</CardTitle>
          <CardDescription className="text-slate-400">
            View and manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48 bg-slate-900 border-slate-700">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="SEO_MANAGER">SEO Manager</SelectItem>
                <SelectItem value="SUPPORT">Support</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="LEGAL">Legal/DPO</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-slate-400">User</TableHead>
                      <TableHead className="text-slate-400">Role</TableHead>
                      <TableHead className="text-slate-400">Plan</TableHead>
                      <TableHead className="text-slate-400">Activity</TableHead>
                      <TableHead className="text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-slate-700 hover:bg-slate-800/50">
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
                          <Badge variant="outline" className="border-slate-600">
                            {user.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {user._count.scans} scans, {user._count.exposures} exposures
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600"
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
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
