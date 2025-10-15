import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background p-4 sm:p-6 md:p-10">
            {/* Gradient Background Effects */}
            <div className="absolute inset-0 -z-10">
                {/* Primary gradient blob */}
                <div className="absolute -left-20 -top-20 h-64 w-64 animate-pulse rounded-full bg-primary/10 blur-3xl sm:h-96 sm:w-96" />
                {/* Secondary gradient blob */}
                <div className="absolute -bottom-20 -right-20 h-64 w-64 animate-pulse rounded-full bg-primary/5 blur-3xl delay-1000 sm:h-96 sm:w-96" />
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Main Content Container */}
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Logo with hover effect */}
                        <Link
                            href={home()}
                            className="group flex flex-col items-center gap-2 font-medium transition-transform duration-200 hover:scale-105"
                        >
                            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-lg transition-all duration-200 group-hover:bg-primary/20 group-hover:shadow-xl sm:h-14 sm:w-14">
                                <AppLogoIcon className="size-7 fill-current text-primary transition-transform duration-200 group-hover:scale-110 sm:size-8" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        {/* Title and Description */}
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                {title}
                            </h1>
                            <p className="text-center text-sm text-muted-foreground sm:text-base">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Form Container with glass morphism effect */}
                    <div className="rounded-lg border bg-card/50 p-6 shadow-xl backdrop-blur-sm transition-all duration-200 hover:shadow-2xl sm:p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
