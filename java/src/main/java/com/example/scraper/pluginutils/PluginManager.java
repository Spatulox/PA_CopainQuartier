package com.example.scraper.pluginutils;

import com.example.scraper.core.AppFilesPath;
import com.example.scraper.core.Plugin;
import com.example.scraper.core.ThemePlugin;
import com.example.scraper.themeutils.DefaultTheme;
import com.example.scraper.themeutils.ThemeManager;
import javafx.application.Platform;
import javafx.geometry.Pos;
import javafx.scene.Scene;
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
import javafx.stage.Stage;

import java.util.function.Consumer;

public class PluginManager {

    private static ScheduledExecutorService scheduler = null;

    public static ThemePlugin loadTheme(){
        File pluginsDir;
        try{
            pluginsDir = AppFilesPath.getThemesPath().toFile();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        if (!pluginsDir.exists() || !pluginsDir.isDirectory()) {
            System.out.println("Aucun dossier de plugins trouvé.");
            return new DefaultTheme();
        }

        File[] jars = pluginsDir.listFiles((dir, name) -> name.endsWith(".jar"));
        if (jars == null){
            return new DefaultTheme();
        }

        for (File jar : jars) {
            if (jar.getName().contains("_active") && jar.getName().endsWith(".jar")) {
                try {
                    URL[] urls = { jar.toURI().toURL() };
                    URLClassLoader loader = new URLClassLoader(urls, ThemePlugin.class.getClassLoader());
                    ServiceLoader<ThemePlugin> serviceLoader = ServiceLoader.load(ThemePlugin.class, loader);
                    for (ThemePlugin theme : serviceLoader) {
                        System.out.println("Thème actif trouvé : " + theme.getClass().getName() + " depuis " + jar.getName());
                        return theme;
                    }
                } catch (Exception e) {
                    System.err.println("Erreur chargement thème " + jar.getName() + ": " + e.getMessage());
                }
            }
        }
        System.out.println("Loading default theme");
        return new DefaultTheme();
    }

    public static List<Plugin> loadPlugins(Stage mainStage) {
        List<Plugin> plugins = new ArrayList<>();

        File pluginsDir;
        try{
            pluginsDir = AppFilesPath.getPluginsPath().toFile();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        if (!pluginsDir.exists() || !pluginsDir.isDirectory()) {
            System.out.println("Aucun dossier de plugins trouvé.");
            return plugins;
        }

        File[] jars = pluginsDir.listFiles((dir, name) -> name.endsWith(".jar"));
        if (jars == null) return plugins;
        for (File jar : jars) {
            try {
                URL[] urls = { jar.toURI().toURL() };
                URLClassLoader loader = new URLClassLoader(urls, Plugin.class.getClassLoader());

                ServiceLoader<Plugin> serviceLoader = ServiceLoader.load(Plugin.class, loader);
                for (Plugin plugin : serviceLoader) {
                    plugin.setStage(mainStage);
                    plugins.add(plugin);
                    //System.out.println(" Plugin chargé : " + plugin.name() + " : " + jar.toURI().toURL());
                }
            } catch (Exception e) {
                System.err.println("Erreur chargement plugin " + jar.getName() + ": " + e.getMessage());
            }
        }

        return plugins;
    }

    public static void startPeriodicReload(int periodInSeconds, Consumer<List<Plugin>> onReload, Stage mainStage) {
        if(scheduler!= null){
            scheduler.shutdownNow();
        }
        scheduler = Executors.newScheduledThreadPool(1);
        scheduler.scheduleAtFixedRate(
                () -> {
                    List<Plugin> plugins = loadPlugins(mainStage);
                    onReload.accept(plugins);
                },
                0,
                periodInSeconds,
                TimeUnit.SECONDS
        );
    }

    public static GridPane createPluginButtonsGrid(List<Plugin> plugins, Consumer<Plugin> pluginAction) {
        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(20);
        grid.setAlignment(Pos.CENTER);

        int col = 0;
        int row = 0;
        ThemePlugin theme = ThemeManager.getTheme();

        for (Plugin plugin : plugins) {
            Button pluginBtn = theme.createButton("🔌 " + plugin.name());
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
