"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import type { User } from "@/types";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

export default function PersonalInfoPage() {
  const { hydrated, user } = useDashboardAuth();
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email ?? "");
    }
  }, [user]);

  if (!hydrated || !user) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put<{ user: User }>("/auth/profile", {
        name,
        email: email.trim() || undefined,
      });
      setUser(res.data.user);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Update failed"));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPwd(true);
    try {
      await api.put("/auth/password", pwd);
      setPwd({ current_password: "", password: "", password_confirmation: "" });
      toast.success("Password changed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Password change failed"));
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold md:text-2xl">Personal Info</h1>

      {/* Personal info card */}
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                className="h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-phone">Phone (not editable)</Label>
              <Input
                id="p-phone"
                className="h-11"
                value={user.phone ?? ""}
                readOnly
                disabled
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-email">Email</Label>
              <Input
                id="p-email"
                className="h-11"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={savingProfile}
              className="h-11 w-full bg-[#f47920] hover:bg-[#e56910] sm:w-auto"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password card */}
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="cur-pwd">Current password</Label>
              <Input
                id="cur-pwd"
                className="h-11"
                type="password"
                value={pwd.current_password}
                onChange={(e) =>
                  setPwd({ ...pwd, current_password: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-pwd">New password</Label>
              <Input
                id="new-pwd"
                className="h-11"
                type="password"
                value={pwd.password}
                onChange={(e) => setPwd({ ...pwd, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="conf-pwd">Confirm new password</Label>
              <Input
                id="conf-pwd"
                className="h-11"
                type="password"
                value={pwd.password_confirmation}
                onChange={(e) =>
                  setPwd({ ...pwd, password_confirmation: e.target.value })
                }
                required
              />
            </div>
            <Button
              type="submit"
              disabled={savingPwd}
              className="h-11 w-full bg-[#f47920] hover:bg-[#e56910] sm:w-auto"
            >
              {savingPwd ? "Saving..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
