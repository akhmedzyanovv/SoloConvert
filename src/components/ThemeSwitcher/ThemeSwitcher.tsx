import { Button } from '../ui/button';
import { SunMoonIcon } from 'lucide-react';
import { useThemeController } from '@/hooks/useThemeController';

function ThemeSwitcher() {
    const { theme, updateTheme } = useThemeController();

    return (
        <Button
            className="[--radius:9999rem]"
            type="button"
            size={'icon'}
            variant={'outline'}
            onClick={() => updateTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            <SunMoonIcon />
        </Button>
    );
}

export default ThemeSwitcher;
