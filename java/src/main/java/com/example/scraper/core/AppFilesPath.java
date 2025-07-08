package com.example.scraper.core;

import com.example.scraper.updates.Updater;

import java.io.File;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class AppFilesPath {

    public static java.nio.file.Path getBinPath() throws URISyntaxException {
        String jarPath = new File(
                Updater.class.getProtectionDomain().getCodeSource().getLocation().toURI()
        ).getParent();

        java.nio.file.Path basePath = Paths.get(jarPath).getParent().getParent().resolve("bin");
        return basePath;
    }

    private static Path getPath(String path) throws URISyntaxException {
        String jarPath = new File(
                Updater.class.getProtectionDomain().getCodeSource().getLocation().toURI()
        ).getParent();

        Path basePath = Paths.get(jarPath).getParent().getParent().resolve(path);

        try {
            Files.createDirectories(basePath);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return basePath;
    }

    public static Path getPluginsPath() throws URISyntaxException {
        return getPath("plugins");
    }

    public static java.nio.file.Path getThemesPath() throws URISyntaxException {
        return getPath("themes");
    }
}
