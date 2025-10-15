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
                                    {/* Dropdown trigger - แสดงเมื่อ sidebar expand */}
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={{ children: item.title }}
                                            className="group-data-[collapsible=icon]:hidden"
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    {/* Link to overview - แสดงเฉพาะเมื่อ sidebar collapse */}
                                    {item.href && (
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={{ children: item.title }}
                                            isActive={page.url === item.href}
                                            className="hidden group-data-[collapsible=icon]:flex"
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
                                    
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
