package com.example.scraper.themeutils;

import com.example.scraper.core.ThemePlugin;

public class ThemeManager {
    private static ThemePlugin currentTheme = null;

    public static ThemePlugin getTheme() {
        return currentTheme;
    }

    public static void setTheme(ThemePlugin theme) {
        currentTheme = theme;
    }
}
