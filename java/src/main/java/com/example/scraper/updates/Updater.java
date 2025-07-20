package com.example.scraper.updates;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;

import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.stage.Stage;
import org.json.JSONArray;
import org.json.JSONObject;

import com.example.scraper.core.AppFilesPath;

public class Updater {
    private static String apiUrl = "https://api.copain-quartier.fr/java";

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
        Path basePath = AppFilesPath.getAppFile();
        File outputFile = new File(basePath.toFile(), "new-version.jar");

        URL url = new URL(apiUrl + "/jar/" + version);
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
            Path appPath = AppFilesPath.getAppFile();
            Path binPath = AppFilesPath.getBinPath();

            String os = System.getProperty("os.name").toLowerCase();
            boolean isWindows = os.contains("win");
            Path executable = isWindows
                    ? binPath.resolve("JavaApp.exe")
                    : binPath.resolve("JavaApp");


            Path source = appPath.resolve("new-version.jar");
            Path target = appPath.resolve("javaapp.jar");
            Files.move(source, target, StandardCopyOption.REPLACE_EXISTING);

            // Afficher l'alerte de confirmation
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.initOwner(stage);
            alert.setTitle("Redémarrage de l'application requis");
            alert.setHeaderText("Mise à jour réussie !");
            alert.setContentText("La mise à jour prendra effet lors de la prochaine ouverture de l'application");
            alert.showAndWait();

        } catch (IOException e) {
            e.printStackTrace();
            Alert error = new Alert(Alert.AlertType.ERROR);
            error.initOwner(stage);
            error.setTitle("Erreur");
            error.setHeaderText("Erreur lors de la mise à jour");
            error.setContentText(e.getMessage());
            error.showAndWait();
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }
}
