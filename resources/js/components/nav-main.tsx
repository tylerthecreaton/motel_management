import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    // ถ้ามี submenu items
                    if (item.items && item.items.length > 0) {
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={item.items.some((subItem) =>
                                    subItem.href && page.url.startsWith(
                                        typeof subItem.href === 'string'
                                            ? subItem.href
                                            : subItem.href.url
                                    )
                                )}
                            >
                                <SidebarMenuItem>
                                    <div className="flex items-center gap-1 w-full">
                                        {/* Main link - คลิกไปหน้า overview */}
                                        {item.href ? (
                                            <SidebarMenuButton
                                                asChild
                                                tooltip={{ children: item.title }}
                                                isActive={page.url === item.href}
                                                className="flex-1"
                                            >
                                                <Link href={item.href} prefetch>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        ) : (
                                            <SidebarMenuButton
                                                tooltip={{ children: item.title }}
                                                className="flex-1 cursor-default"
                                            >
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        )}
                                        
                                        {/* Dropdown trigger - คลิกเพื่อ expand/collapse */}
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={{ children: 'Expand' }}
                                                className="w-8 p-0 justify-center"
                                            >
                                                <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                    </div>
                                    
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={
                                                            subItem.href ? page.url.startsWith(
                                                                typeof subItem.href === 'string'
                                                                    ? subItem.href
                                                                    : subItem.href.url
                                                            ) : false
                                                        }
                                                    >
                                                        <Link href={subItem.href!} prefetch>
                                                            {subItem.icon && <subItem.icon />}
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    // ถ้าไม่มี submenu (menu ปกติ)
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={
                                    item.href ? page.url.startsWith(
                                        typeof item.href === 'string'
                                            ? item.href
                                            : item.href.url
                                    ) : false
                                }
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href!} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
