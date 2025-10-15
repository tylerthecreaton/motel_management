import { Head, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Lock, Palette, ChevronRight } from 'lucide-react';

export default function SettingsIndex() {
    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Settings', href: '/settings' },
    ];

    const settingsCategories = [
        {
            title: 'Profile',
            description: 'Manage your personal information and account details',
            icon: User,
            href: '/settings/profile',
            color: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
        },
        {
            title: 'Password',
            description: 'Update your password and security settings',
            icon: Lock,
            href: '/settings/password',
            color: 'text-green-600 bg-green-100 dark:bg-green-900',
        },
        {
            title: 'Appearance',
            description: 'Customize the look and feel of your interface',
            icon: Palette,
            href: '/settings/appearance',
            color: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
        },
    ];

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 overflow-y-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Settings
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Settings Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {settingsCategories.map((category) => {
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
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Quick overview of your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Account Status
                                </p>
                                <p className="text-base font-semibold text-green-600">Active</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Security
                                </p>
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                    2FA Available
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Help Section */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="text-blue-900 dark:text-blue-100">
                            Need Help?
                        </CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                            If you need assistance with your settings, please contact support
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                            Contact Support
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
