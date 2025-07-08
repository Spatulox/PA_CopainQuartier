package com.example.scraper.ui;

import com.example.scraper.core.AppFilesPath;
import com.example.scraper.core.AppVersion;
import com.example.scraper.core.ThemePlugin;
import com.example.scraper.pluginutils.PluginViewer;
import com.example.scraper.themeutils.DefaultTheme;
import com.example.scraper.themeutils.ThemeChooser;
import com.example.scraper.themeutils.ThemeManager;
import com.example.scraper.updates.Updater;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import com.example.scraper.pluginutils.PluginLoader;
import com.example.scraper.core.Plugin;
import com.example.scraper.pluginutils.PluginManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.net.URISyntaxException;

public class MainApp extends Application {
    private static final Logger log = LoggerFactory.getLogger(MainApp.class);
    private VBox root;
    private GridPane pluginGrid;
    private ThemePlugin theme;

    @Override
    public void init() throws Exception {
        /*Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                File binDir = AppFilesPath.getBinPath().toFile();
                File updaterFile = new File(binDir, "updater" + (isWindows() ? ".exe" : ""));
                String updaterPath = updaterFile.getAbsolutePath();

                ProcessBuilder pb = new ProcessBuilder(updaterPath);
                pb.inheritIO();
                pb.start();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }));
        super.init();*/
    }

    @Override
    public void start(Stage primaryStage) {
        try {
            theme = PluginManager.loadTheme();
            ThemeManager.setTheme(theme);
        } catch (Exception e) {
            theme = new DefaultTheme();
        }
        refreshUI(primaryStage);
        try{
            String latestVersion = Updater.getLatestVersion();
            if (!AppVersion.currentVersion.equals(latestVersion)) {
                System.out.println("Nouvelle version disponible : " + latestVersion);
                Updater.downloadExecutable(latestVersion);
                Updater.replaceExecutableByNewVersion((primaryStage));

                // To avoid recheck every refresh.
                // This will be forgotten when the app will close
                AppVersion.currentVersion = latestVersion;
            }
        } catch (Exception e){
            log.error("e: ", e);
        }
    }

    private void refreshUI(Stage primaryStage) {
        root = new VBox(30);
        root.setAlignment(Pos.TOP_CENTER);
        root.setPadding(new Insets(40));
        root.setStyle(theme.rootStyle());

        Button pluginButton = theme.createButton("Ajouter un plugin");
        pluginButton.setOnAction(e -> {
            PluginLoader.showPluginForm(primaryStage);
            Platform.runLater(() -> {
                GridPane newGrid = PluginManager.createPluginButtonsGrid(
                        PluginManager.loadPlugins(primaryStage),
                        plugin -> viewPlugin(primaryStage, plugin)
                );
                root.getChildren().remove(pluginGrid);
                pluginGrid = newGrid;
                root.getChildren().add(pluginGrid);
            });
        });

        Button themeButton = theme.createButton("Choisir un theme");
        themeButton.setOnAction(e -> {
            ThemeChooser.chooseTheme();
            theme = ThemeManager.getTheme();
            refreshUI(primaryStage);
        });

        HBox categoryRow = new HBox(20);
        categoryRow.setAlignment(Pos.CENTER);
        categoryRow.getChildren().addAll(pluginButton, themeButton);

        pluginGrid = new GridPane();
        pluginGrid.setHgap(20);
        pluginGrid.setVgap(20);
        pluginGrid.setAlignment(Pos.CENTER);

        root.getChildren().addAll(categoryRow, pluginGrid);

        PluginManager.startPeriodicReload(10, plugins -> {
            Platform.runLater(() -> {
                GridPane newGrid = PluginManager.createPluginButtonsGrid(
                        PluginManager.loadPlugins(primaryStage),
                        plugin -> viewPlugin(primaryStage, plugin)
                );
                root.getChildren().remove(pluginGrid);
                pluginGrid = newGrid;
                root.getChildren().add(pluginGrid);
            });
        }, primaryStage);

        // 7. Recréer la scène
        Scene menuScene = new Scene(root, theme.width(), theme.height());
        primaryStage.setScene(menuScene);
        primaryStage.setTitle("Menu des événements");
        primaryStage.show();
    }

    private void viewPlugin(Stage stage, Plugin plugin) {
        PluginViewer viewer = new PluginViewer(stage, plugin);
        Scene scene = new Scene(viewer.getView(), theme.width(), theme.height());
        stage.setScene(scene);
        stage.setTitle("Nom : " + plugin.name());
    }

    public static void main(String[] args) {
        launch();
    }

    private static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }
}
