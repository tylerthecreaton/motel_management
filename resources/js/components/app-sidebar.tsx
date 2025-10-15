import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import { edit as passwordEdit } from '@/routes/password';
import { edit as appearanceEdit } from '@/routes/appearance';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Settings, User, Lock, Palette, Home, FileText, ShieldCheck, Users, Shield } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Rooms',
        href: '/rooms',
        icon: Home,
    },
    {
        title: 'My Contracts',
        href: '/bookings',
        icon: FileText,
    },
    {
        title: 'Admin',
        href: '/admin',
        icon: ShieldCheck,
        items: [
            {
                title: 'Bookings Management',
                href: '/admin/bookings',
                icon: FileText,
            },
            {
                title: 'Users Management',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Roles & Permissions',
                href: '/admin/roles',
                icon: Shield,
            },
        ],
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        items: [
            {
                title: 'Profile',
                href: profileEdit(),
                icon: User,
            },
            {
                title: 'Password',
                href: passwordEdit(),
                icon: Lock,
            },
            {
                title: 'Appearance',
                href: appearanceEdit(),
                icon: Palette,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
