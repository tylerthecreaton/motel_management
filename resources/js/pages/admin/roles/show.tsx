import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Role, Permission } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Edit, Shield, Users, Key } from 'lucide-react';

interface RoleWithDetails extends Role {
    users_count?: number;
}

export default function AdminRolesShow({ roleId }: { roleId: string }) {
    const [role, setRole] = useState<RoleWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin' },
        { title: 'Roles & Permissions', href: '/admin/roles' },
        { title: 'Role Details', href: `/admin/roles/${roleId}` },
    ];

    // Fetch role data
    useEffect(() => {
        fetchRole();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleId]);

    const fetchRole = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/admin/roles/${roleId}`, {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch role');
            }

            const data = await response.json();
            setRole(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load role');
        } finally {
            setLoading(false);
        }
    };

    // Check if role is system role
    const isSystemRole = (roleName: string) => {
        return ['admin', 'manager', 'user'].includes(roleName);
    };

    // Group permissions by group
    const groupedPermissions = role?.permissions?.reduce((acc, permission) => {
        const group = permission.group || 'other';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    if (loading) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Role Details" />
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading role...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    if (error || !role) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Role Details" />
                <div className="flex h-full items-center justify-center p-4">
                    <Alert variant="destructive">
                        <AlertDescription>{error || 'Role not found'}</AlertDescription>
                    </Alert>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Role: ${role.display_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 overflow-y-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit('/admin/roles')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {role.display_name}
                                </h1>
                                {isSystemRole(role.name) && (
                                    <Badge variant="outline">System Role</Badge>
                                )}
                            </div>
                            <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                                {role.name}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => router.visit(`/admin/roles/${roleId}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Role
                    </Button>
                </div>

                {/* Role Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Role details and description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role Name</p>
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{role.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Display Name</p>
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                    {role.display_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                                <p className="text-base text-gray-900 dark:text-gray-100">
                                    {role.description || 'No description'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                            <CardDescription>Role usage overview</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Total Permissions
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {role.permissions?.length || 0}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Assigned Users
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {role.users_count || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Permissions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                        <CardDescription>
                            {role.permissions?.length || 0} permission{(role.permissions?.length || 0) !== 1 ? 's' : ''}{' '}
                            assigned to this role
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!role.permissions || role.permissions.length === 0 ? (
                            <div className="text-center py-12">
                                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    No permissions assigned
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    This role doesn't have any permissions yet
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(groupedPermissions || {}).map(([group, permissions]) => (
                                    <div key={group}>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 capitalize">
                                            {group}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {permissions.map((permission) => (
                                                <div
                                                    key={permission.id}
                                                    className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                >
                                                    <Key className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {permission.display_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {permission.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
