import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Shield, ChevronRight, TrendingUp, Calendar } from 'lucide-react';

export default function AdminIndex() {
    const [stats, setStats] = useState({
        totalBookings: 0,
        pendingBookings: 0,
        totalUsers: 0,
        totalRoles: 0,
    });
    const [loading, setLoading] = useState(true);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin' },
    ];

    // Fetch statistics
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            
            // Fetch data from multiple endpoints
            const [bookingsRes, usersRes, rolesRes] = await Promise.all([
                fetch('/api/admin/bookings', {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin',
                }),
                fetch('/api/admin/users', {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin',
                }),
                fetch('/api/admin/roles', {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin',
                }),
            ]);

            const bookingsData = await bookingsRes.json();
            const usersData = await usersRes.json();
            const rolesData = await rolesRes.json();

            const bookings = bookingsData.data || [];
            const users = usersData.data || [];
            const roles = rolesData.data || [];

            setStats({
                totalBookings: bookings.length,
                pendingBookings: bookings.filter((b: { status: string }) => b.status === 'pending').length,
                totalUsers: users.length,
                totalRoles: roles.length,
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const adminCategories = [
        {
            title: 'Bookings Management',
            description: 'Review and manage rental contract requests',
            icon: FileText,
            href: '/admin/bookings',
            color: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
            stat: `${stats.pendingBookings} pending`,
        },
        {
            title: 'Users Management',
            description: 'Manage user accounts and permissions',
            icon: Users,
            href: '/admin/users',
            color: 'text-green-600 bg-green-100 dark:bg-green-900',
            stat: `${stats.totalUsers} users`,
        },
        {
            title: 'Roles & Permissions',
            description: 'Configure roles and access control',
            icon: Shield,
            href: '/admin/roles',
            color: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
            stat: `${stats.totalRoles} roles`,
        },
    ];

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 overflow-y-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Admin Dashboard
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                        Manage your motel operations and system settings
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Total Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            ) : (
                                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Pending Approval
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            ) : (
                                <div className="text-2xl font-bold text-amber-600">{stats.pendingBookings}</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Total Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            ) : (
                                <div className="text-2xl font-bold text-green-600">{stats.totalUsers}</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-purple-600 flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Active Roles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            ) : (
                                <div className="text-2xl font-bold text-purple-600">{stats.totalRoles}</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Admin Categories */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Management Tools
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adminCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <Link key={category.href} href={category.href}>
                                    <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer group">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className={`p-3 rounded-lg ${category.color}`}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                            </div>
                                            <CardTitle className="mt-4">{category.title}</CardTitle>
                                            <CardDescription className="mt-2">
                                                {category.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <TrendingUp className="h-4 w-4" />
                                                <span>{category.stat}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="text-blue-900 dark:text-blue-100">
                            Quick Actions
                        </CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                            Common administrative tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/admin/users/create">
                                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                                    <Users className="mr-2 h-4 w-4" />
                                    Create User
                                </Button>
                            </Link>
                            <Link href="/admin/roles/create">
                                <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Create Role
                                </Button>
                            </Link>
                            <Link href="/admin/bookings">
                                <Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Review Bookings
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
