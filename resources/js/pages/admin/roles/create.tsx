import { useState, useEffect, FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Permission } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save } from 'lucide-react';

interface FormData {
    name: string;
    display_name: string;
    description: string;
    permissions: number[];
}

interface ValidationErrors {
    name?: string[];
    display_name?: string[];
    description?: string[];
    permissions?: string[];
}

export default function AdminRolesCreate() {
    const [allPermissions, setAllPermissions] = useState<Record<string, Permission[]>>({});
    const [formData, setFormData] = useState<FormData>({
        name: '',
        display_name: '',
        description: '',
        permissions: [],
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [generalError, setGeneralError] = useState<string | null>(null);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin' },
        { title: 'Roles & Permissions', href: '/admin/roles' },
        { title: 'Create Role', href: '/admin/roles/create' },
    ];

    // Fetch permissions data
    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            setFetchLoading(true);
            const response = await fetch('/api/admin/roles/permissions', {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch permissions');
            }

            const data = await response.json();
            setAllPermissions(data.data || {});
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : 'Failed to load permissions');
        } finally {
            setFetchLoading(false);
        }
    };

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // Handle permission toggle
    const handlePermissionToggle = (permissionId: number) => {
        setFormData((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter((id) => id !== permissionId)
                : [...prev.permissions, permissionId],
        }));
    };

    // Select all permissions in a group
    const handleSelectAllInGroup = (permissions: Permission[]) => {
        const permissionIds = permissions.map((p) => p.id);
        const allSelected = permissionIds.every((id) => formData.permissions.includes(id));

        setFormData((prev) => ({
            ...prev,
            permissions: allSelected
                ? prev.permissions.filter((id) => !permissionIds.includes(id))
                : [...new Set([...prev.permissions, ...permissionIds])],
        }));
    };

    // Handle form submit
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError(null);

        try {
            const response = await fetch('/api/admin/roles', {
                method: 'POST',
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
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    setErrors(data.errors);
                    console.error('Validation errors:', data.errors);
                } else {
                    throw new Error(data.message || 'Failed to create role');
                }
                return;
            }

            // Success - redirect to roles list
            router.visit('/admin/roles');
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : 'Failed to create role');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Create Role" />
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading permissions...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/admin/roles')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Create New Role
                        </h1>
                        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                            Define a new role with specific permissions
                        </p>
                    </div>
                </div>

                {generalError && (
                    <Alert variant="destructive">
                        <AlertDescription>{generalError}</AlertDescription>
                    </Alert>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Role name and description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Role Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="content-manager"
                                    required
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name[0]}</p>}
                                <p className="text-sm text-gray-500">
                                    Lowercase, no spaces, use hyphens (e.g., content-manager)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="display_name">
                                    Display Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="display_name"
                                    name="display_name"
                                    type="text"
                                    value={formData.display_name}
                                    onChange={handleChange}
                                    placeholder="Content Manager"
                                    required
                                    className={errors.display_name ? 'border-red-500' : ''}
                                />
                                {errors.display_name && (
                                    <p className="text-sm text-red-500">{errors.display_name[0]}</p>
                                )}
                                <p className="text-sm text-gray-500">
                                    Human-readable name shown in the UI
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe what this role can do..."
                                    rows={3}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description[0]}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>
                                Select permissions for this role ({formData.permissions.length} selected)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {Object.entries(allPermissions).map(([group, permissions]) => {
                                    const groupPermissionIds = permissions.map((p) => p.id);
                                    const allSelected = groupPermissionIds.every((id) =>
                                        formData.permissions.includes(id)
                                    );

                                    return (
                                        <div key={group}>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                                    {group}
                                                </h3>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSelectAllInGroup(permissions)}
                                                >
                                                    {allSelected ? 'Deselect All' : 'Select All'}
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {permissions.map((permission) => (
                                                    <div
                                                        key={permission.id}
                                                        className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                    >
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={formData.permissions.includes(permission.id)}
                                                            onCheckedChange={() =>
                                                                handlePermissionToggle(permission.id)
                                                            }
                                                        />
                                                        <div className="flex-1">
                                                            <Label
                                                                htmlFor={`permission-${permission.id}`}
                                                                className="text-sm font-medium cursor-pointer"
                                                            >
                                                                {permission.display_name}
                                                            </Label>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {permission.description || permission.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Creating...' : 'Create Role'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/admin/roles')}
                            disabled={loading}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
