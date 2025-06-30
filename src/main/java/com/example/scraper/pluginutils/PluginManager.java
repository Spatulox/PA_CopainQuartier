package com.example.scraper.pluginutils;

import com.example.scraper.core.ScraperPlugin;
import com.example.scraper.ui.StyledButton;
import javafx.geometry.Pos;
import javafx.scene.layout.GridPane;

import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.*;

import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import javafx.scene.control.Button;
import java.util.function.Consumer;

public class PluginManager {

    public static List<ScraperPlugin> loadPlugins() {
        List<ScraperPlugin> plugins = new ArrayList<>();
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
                URLClassLoader loader = new URLClassLoader(urls, ScraperPlugin.class.getClassLoader());

                ServiceLoader<ScraperPlugin> serviceLoader = ServiceLoader.load(ScraperPlugin.class, loader);
                for (ScraperPlugin plugin : serviceLoader) {
                    plugins.add(plugin);
                    System.out.println(" Plugin chargé : " + plugin.name() + " (" + plugin.category() + ")");
                }
            } catch (Exception e) {
                System.err.println("Erreur chargement plugin " + jar.getName() + ": " + e.getMessage());
            }
        }

        return plugins;
    }

    public static void startPeriodicReload(int periodInSeconds, Consumer<List<ScraperPlugin>> onReload) {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.scheduleAtFixedRate(
                () -> {
                    System.out.println("Chargement des plugins...");
                    List<ScraperPlugin> plugins = loadPlugins();
                    // Appelle le callback avec la nouvelle liste de plugins
                    onReload.accept(plugins);
                },
                0,
                periodInSeconds,
                TimeUnit.SECONDS
        );
    }

    public static GridPane createPluginButtonsGrid(List<ScraperPlugin> plugins, Consumer<ScraperPlugin> pluginAction) {
        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(20);
        grid.setAlignment(Pos.CENTER);

        StyledButton styledButton = new StyledButton();
        int col = 0;
        int row = 0;

        for (ScraperPlugin plugin : plugins) {
            String cat = plugin.category();
            Button pluginBtn = styledButton.createStyledButton("🔌 " + cat);
            pluginBtn.setOnAction(e -> pluginAction.accept(plugin));

            grid.add(pluginBtn, col, row);

            col++;
            if (col == 3) {
                col = 0;
                row++;
            }
        }
        return grid;
    }
}
