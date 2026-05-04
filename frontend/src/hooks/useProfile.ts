import { useCallback, useEffect, useState } from "react";
import {
  changePasswordService,
  getProfileService,
} from "../services/profileService";
import { ChangePasswordRequest, UserProfile } from "../types/auth";

export const useProfile = (autoFetch = true) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProfileService();
      setProfile(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal mengambil profil pengguna";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = async (payload: ChangePasswordRequest) => {
    setSaving(true);
    setError(null);

    try {
      return await changePasswordService(payload);
    } catch (err: any) {
      const message = err.response?.data?.message || "Gagal mengubah password";
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProfile().catch(() => undefined);
    }
  }, [autoFetch, fetchProfile]);

  return {
    profile,
    loading,
    saving,
    error,
    fetchProfile,
    changePassword,
  };
};
