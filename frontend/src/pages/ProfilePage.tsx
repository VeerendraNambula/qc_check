import React, { useState, useEffect, useRef } from 'react';
import { User, Save, Loader2, Camera, Lock } from 'lucide-react';
import { api } from '../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Forms';
import { toast } from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
    const userId = localStorage.getItem('userId');
    const queryClient = useQueryClient();

    // Personal Info State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch user data
    const { data: user, isLoading } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const res = await api.get(`/users/${userId}`);
            return res.data;
        },
        enabled: !!userId,
    });

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email || '');
        }
    }, [user]);

    const updateProfileMutation = useMutation({
        mutationFn: async (updates: { name?: string; email?: string; profilePictureUrl?: string; password?: string }) => {
            await api.patch(`/users/${userId}`, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            toast.success("Profile updated successfully");
            setIsEditingName(false);
            setIsEditingEmail(false);
            setIsChangingPassword(false);
            setCurrentPassword('');
            setPassword('');
            setConfirmPassword('');
        },
        onError: (error: any) => {
            console.error("Failed to update profile:", error);
            const message = error.response?.data?.message || "Failed to update profile";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.patch(`/users/${userId}/change-password`, data);
        },
        onSuccess: () => {
            toast.success("Password changed successfully");
            setIsChangingPassword(false);
            setPassword('');
            setConfirmPassword('');
        },
        onError: (error: any) => {
            console.error("Failed to change password:", error);
            const message = error.response?.data?.message || "Failed to change password";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    });

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const loadingToast = toast.loading("Uploading image...");

        try {
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const imageUrl = uploadRes.data.url;
            updateProfileMutation.mutate({ profilePictureUrl: imageUrl });
            toast.dismiss(loadingToast);
        } catch (error) {
            console.error("Failed to upload image:", error);
            toast.dismiss(loadingToast);
            toast.error("Failed to upload profile picture");
        }
    };

    const handleSaveName = () => {
        if (name && name !== user?.name) {
            updateProfileMutation.mutate({ name });
        } else {
            setIsEditingName(false);
        }
    };

    const handleSaveEmail = () => {
        if (email && email !== user?.email) {
            updateProfileMutation.mutate({ email });
        } else {
            setIsEditingEmail(false);
        }
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        changePasswordMutation.mutate({ currentPassword, newPassword: password });
    };

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-qc-primary" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            <h1 className="text-2xl font-black text-qc-text-main">User Profile</h1>

            <div className="bg-white p-8 rounded-qc-lg border border-qc-border shadow-qc-sm space-y-8">
                {/* Header / Avatar */}
                <div className="flex items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="h-24 w-24 bg-qc-primary rounded-full flex items-center justify-center text-white text-3xl font-black shadow-qc-md overflow-hidden border-4 border-white ring-2 ring-qc-border/50">
                            {user?.profilePictureUrl ? (
                                <img src={user.profilePictureUrl} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                user?.name?.charAt(0) || <User size={32} />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-qc-text-main">{user?.name}</h2>
                        <p className="text-sm text-qc-text-muted font-mono">@{user?.username}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded">
                            {user?.role}
                        </span>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-6 pt-4 border-t border-qc-border">
                    <h3 className="text-sm font-black text-qc-text-muted uppercase tracking-widest">Personal Information</h3>

                    <div className="grid gap-6">
                        <div>
                            {isEditingName ? (
                                <div className="space-y-3 bg-slate-50 p-4 rounded-qc-lg border border-qc-border">
                                    <Input
                                        label="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="ghost" onClick={() => {
                                            setName(user?.name || '');
                                            setIsEditingName(false);
                                        }}>
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSaveName}
                                            isLoading={updateProfileMutation.isPending}
                                            icon={Save}
                                        >
                                            Save Name
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="group">
                                    <label className="block text-xs font-bold text-qc-text-muted uppercase tracking-wider mb-1">Full Name</label>
                                    <div className="flex justify-between items-center p-3 rounded-qc-base border border-transparent hover:border-qc-border hover:bg-slate-50 transition-all -mx-3">
                                        <span className="text-qc-text-main font-medium">{user?.name}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setIsEditingName(true)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            {isEditingEmail ? (
                                <div className="space-y-3 bg-slate-50 p-4 rounded-qc-lg border border-qc-border">
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="ghost" onClick={() => {
                                            setEmail(user?.email || '');
                                            setIsEditingEmail(false);
                                        }}>
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSaveEmail}
                                            isLoading={updateProfileMutation.isPending}
                                            icon={Save}
                                        >
                                            Save Email
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="group">
                                    <label className="block text-xs font-bold text-qc-text-muted uppercase tracking-wider mb-1">Email Address</label>
                                    <div className="flex justify-between items-center p-3 rounded-qc-base border border-transparent hover:border-qc-border hover:bg-slate-50 transition-all -mx-3">
                                        <span className="text-qc-text-main font-medium">{user?.email || 'Not set'}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setIsEditingEmail(true)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-qc-text-muted uppercase tracking-wider mb-1">User ID</label>
                            <div className="text-qc-text-muted bg-slate-50 px-3 py-2 rounded-qc-base border border-qc-border cursor-not-allowed select-none font-mono text-sm">
                                {user?.id}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="space-y-6 pt-4 border-t border-qc-border">
                    <h3 className="text-sm font-black text-qc-text-muted uppercase tracking-widest">Security</h3>

                    <div>
                        {isChangingPassword ? (
                            <form onSubmit={handlePasswordChange} className="space-y-4 bg-slate-50 p-6 rounded-qc-lg border border-qc-border animate-in fade-in slide-in-from-top-2">
                                <h4 className="font-bold text-qc-text-main flex items-center gap-2">
                                    <Lock size={16} className="text-qc-primary" />
                                    Change Password
                                </h4>
                                <div className="grid gap-4">
                                    <Input
                                        type="password"
                                        label="Current Password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                    <Input
                                        type="password"
                                        label="New Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        required
                                    />
                                    <Input
                                        type="password"
                                        label="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
                                        required
                                    />
                                </div>
                                <div className="flex gap-2 justify-end pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setCurrentPassword('');
                                            setPassword('');
                                            setConfirmPassword('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        isLoading={changePasswordMutation.isPending}
                                        icon={Save}
                                    >
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex items-center justify-between p-4 border border-qc-border rounded-qc-lg bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-full text-qc-text-muted">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-qc-text-main">Password</p>
                                        <p className="text-xs text-qc-text-muted">Update your password securely</p>
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsChangingPassword(true)}
                                >
                                    Change Password
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
