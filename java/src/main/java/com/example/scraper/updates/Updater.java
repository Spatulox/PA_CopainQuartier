package com.example.scraper.updates;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Path;
import java.util.Optional;

import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.stage.Stage;
import org.json.JSONArray;
import org.json.JSONObject;

import com.example.scraper.core.AppFilesPath;

public class Updater {
    private static String apiUrl = "http://localhost:3000/java";

    public static String getLatestVersion() throws Exception {
        URL url = new URL(apiUrl + "/version");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        StringBuilder response = new StringBuilder();
        String inputLine;
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();
        JSONArray versions = new JSONArray(response.toString());
        JSONObject latest = versions.getJSONObject(0);
        String latestVersion = latest.getString("version");
        return latestVersion;
    }

    public static void downloadExecutable(String version) throws Exception {
        Path basePath = AppFilesPath.getBinPath();
        File outputFile = new File(basePath.toFile(), "new-version.jar");

        URL url = new URL(apiUrl + "/executable/" + version);
        InputStream in = url.openStream();
        FileOutputStream fos = new FileOutputStream(outputFile);
        byte[] buffer = new byte[4096];
        int bytesRead;
        while ((bytesRead = in.read(buffer)) != -1) {
            fos.write(buffer, 0, bytesRead);
        }
        fos.close();
        in.close();
    }

    public static void replaceExecutableByNewVersion(Stage stage) {
        try {
            java.nio.file.Files.move(
                    java.nio.file.Paths.get("new-version.jar"),
                    java.nio.file.Paths.get("webscrapper.jar"),
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING
            );

            // Afficher une alerte de confirmation JavaFX
            Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
            alert.initOwner(stage);
            alert.setTitle("Redémarrage requis");
            alert.setHeaderText("Mise à jour réussie !");
            alert.setContentText("Voulez-vous redémarrer l'application maintenant ?");

            Optional<ButtonType> result = alert.showAndWait();
            if (result.isPresent() && result.get() == ButtonType.OK) {
                // Redémarrage accepté
                new ProcessBuilder("java", "-jar", "app.jar").start();
                System.exit(0);
            }
        } catch (IOException e) {
            e.printStackTrace();
            Alert error = new Alert(Alert.AlertType.ERROR);
            error.initOwner(stage);
            error.setTitle("Erreur");
            error.setHeaderText("Erreur lors de la mise à jour");
            error.setContentText(e.getMessage());
            error.showAndWait();
        }
    }
}
