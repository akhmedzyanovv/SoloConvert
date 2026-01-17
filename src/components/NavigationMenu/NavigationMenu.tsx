import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuLink,
    NavigationMenuTrigger,
    NavigationMenuContent
} from '@/components/ui/navigation-menu';
import { Link, useLocation } from 'react-router';
import { ThemeSwitcher } from '../ThemeSwitcher';

const tools: { title: string; href: string; description: string }[] = [
    {
        title: 'Video Converter',
        href: '/',
        description: 'Tool for converting video to GIF format.'
    },
    {
        title: 'Subtitle Renderer',
        href: '/subtitle-renderer',
        description: 'Tool under construction.'
    }
];

function AppNavigationMenu() {
    const location = useLocation();

    const title = tools.find((tool) => tool.href === location.pathname)?.title;
    
    return (
        <div className="w-full p-5 flex flex-row justify-between">
            <NavigationMenu className="w-full">
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>{title}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul
                                className="grid gap-2 sm:w-[400px] md:w-[500px]
                                    md:grid-cols-2 lg:w-[600px]"
                            >
                                {tools.map((tool) => (
                                    <ListItem
                                        key={tool.title}
                                        title={tool.title}
                                        href={tool.href}
                                    >
                                        {tool.description}
                                    </ListItem>
                                ))}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <ThemeSwitcher />
        </div>
    );
}

function ListItem({
    title,
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<'li'> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link to={href}>
                    <div className="text-sm leading-none font-medium">
                        {title}
                    </div>
                    <p
                        className="text-muted-foreground line-clamp-2 text-sm
                            leading-snug"
                    >
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    );
}

export default AppNavigationMenu;
