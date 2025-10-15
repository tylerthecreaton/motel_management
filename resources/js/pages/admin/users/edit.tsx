import { useState, useEffect, FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { User, Role } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save } from 'lucide-react';

interface FormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles: number[];
}

interface ValidationErrors {
    name?: string[];
    email?: string[];
    password?: string[];
    roles?: string[];
}

export default function AdminUsersEdit({ userId }: { userId: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [generalError, setGeneralError] = useState<string | null>(null);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin' },
        { title: 'Users Management', href: '/admin/users' },
        { title: 'Edit User', href: `/admin/users/${userId}/edit` },
    ];

    // Fetch user and roles data
    useEffect(() => {
        Promise.all([fetchUser(), fetchRoles()]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchUser = async () => {
        try {
            setFetchLoading(true);
            const response = await fetch(`/api/admin/users/${userId}`, {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }

            const data = await response.json();
            setUser(data.data);
            setFormData({
                name: data.data.name,
                email: data.data.email,
                password: '',
                password_confirmation: '',
                roles: data.data.roles?.map((r: Role) => r.id) || [],
            });
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : 'Failed to load user');
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/admin/roles', {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch roles');
            }

            const data = await response.json();
            setRoles(data.data || []);
        } catch (err) {
            console.error('Error fetching roles:', err);
        }
    };

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field
        if (errors[name as keyof ValidationErrors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    // Handle role toggle
    const handleRoleToggle = (roleId: number) => {
        setFormData((prev) => ({
            ...prev,
            roles: prev.roles.includes(roleId)
                ? prev.roles.filter((id) => id !== roleId)
                : [...prev.roles, roleId],
        }));
    };

    // Handle form submit
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError(null);

        try {
            // Prepare data - only include password if it's filled
            const submitData: {
                name: string;
                email: string;
                roles: number[];
                password?: string;
                password_confirmation?: string;
            } = {
                name: formData.name,
                email: formData.email,
                roles: formData.roles,
            };

            if (formData.password) {
                submitData.password = formData.password;
                submitData.password_confirmation = formData.password_confirmation;
            }

            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie
                            .split('; ')
                            .find((row) => row.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] || ''
                    ),
                },
                credentials: 'same-origin',
                body: JSON.stringify(submitData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    // Validation errors
                    setErrors(data.errors);
                } else {
                    throw new Error(data.message || 'Failed to update user');
                }
                return;
            }

            // Success - redirect to users list
            router.visit('/admin/users', {
                onSuccess: () => {
                    console.log('User updated successfully');
                },
            });
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : 'Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Edit User" />
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading user...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    if (!user) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Edit User" />
                <div className="flex h-full items-center justify-center">
                    <Alert variant="destructive">
                        <AlertDescription>User not found</AlertDescription>
                    </Alert>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit('/admin/users')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Edit User
                        </h1>
                        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                            Update user account information
                        </p>
                    </div>
                </div>

                {generalError && (
                    <Alert variant="destructive">
                        <AlertDescription>{generalError}</AlertDescription>
                    </Alert>
                )}

                {/* Form */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>
                            Update the details for {user.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name[0]}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email[0]}</p>
                                )}
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Leave blank to keep the current password
                                </p>

                                {/* Password */}
                                <div className="space-y-2 mb-4">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500">{errors.password[0]}</p>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        Password must be at least 8 characters long
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Roles */}
                            <div className="space-y-2">
                                <Label>Roles <span className="text-red-500">*</span></Label>
                                <div className="space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    {roles.map((role) => (
                                        <div key={role.id} className="flex items-start space-x-3">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={formData.roles.includes(role.id)}
                                                onCheckedChange={() => handleRoleToggle(role.id)}
                                            />
                                            <div className="flex-1">
                                                <Label
                                                    htmlFor={`role-${role.id}`}
                                                    className="text-sm font-medium cursor-pointer"
                                                >
                                                    {role.display_name}
                                                </Label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {role.description || role.name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.roles && (
                                    <p className="text-sm text-red-500">{errors.roles[0]}</p>
                                )}
                                <p className="text-sm text-gray-500">
                                    You can select multiple roles for this user.
                                </p>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                                    <Save className="mr-2 h-4 w-4" />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/admin/users')}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
