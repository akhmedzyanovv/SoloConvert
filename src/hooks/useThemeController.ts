import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export const useThemeController = () => {
    const getCurrentTheme = () =>
        window.matchMedia('(prefers-color-scheme: dark)').matches && 'dark' || 'light';
    const [theme, setTheme] = useState<Theme>(getCurrentTheme());
    
    const mqListener = (e: MediaQueryListEvent) => {
        updateTheme(e.matches && 'dark' || 'light');
    };

    const updateTheme = (theme: Theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            setTheme(theme);
        } else {
            document.documentElement.classList.remove('dark');
            setTheme(theme);
        }
    }

    useEffect(() => {
        const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
        darkThemeMq.addEventListener('change', mqListener);
        return () => darkThemeMq.removeEventListener('change', mqListener);
    }, []);
    return { theme, updateTheme };
};
