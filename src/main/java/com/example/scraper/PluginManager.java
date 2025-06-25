package com.example.scraper;

import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.*;

public class PluginManager {

    public static List<SiteScraperPlugin> loadPlugins() {
        List<SiteScraperPlugin> plugins = new ArrayList<>();
        File pluginsDir = new File("plugins");

        if (!pluginsDir.exists() || !pluginsDir.isDirectory()) {
            System.out.println("Aucun dossier de plugins trouvé.");
            return plugins;
        }

        File[] jars = pluginsDir.listFiles((dir, name) -> name.endsWith(".jar"));
        if (jars == null) return plugins;

        for (File jar : jars) {
            try {
                URL[] urls = { jar.toURI().toURL() };
                URLClassLoader loader = new URLClassLoader(urls, SiteScraperPlugin.class.getClassLoader());

                ServiceLoader<SiteScraperPlugin> serviceLoader = ServiceLoader.load(SiteScraperPlugin.class, loader);
                for (SiteScraperPlugin plugin : serviceLoader) {
                    plugins.add(plugin);
                    System.out.println(" Plugin chargé : " + plugin.getName() + " (" + plugin.getCategory() + ")");
                }
            } catch (Exception e) {
                System.err.println("Erreur chargement plugin " + jar.getName() + ": " + e.getMessage());
            }
        }

        return plugins;
    }
}
