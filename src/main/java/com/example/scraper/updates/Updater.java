package com.example.scraper.updates;

import java.io.BufferedReader;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONArray;
import org.json.JSONObject;

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
        URL url = new URL(apiUrl + "/executable/" + version);
        InputStream in = url.openStream();
        FileOutputStream fos = new FileOutputStream("webscrapper.jar");
        byte[] buffer = new byte[4096];
        int bytesRead;
        while ((bytesRead = in.read(buffer)) != -1) {
            fos.write(buffer, 0, bytesRead);
        }
        fos.close();
        in.close();
    }

    /*public static void replaceExecutableByNewVersion(){
        java.nio.file.Files.move(
                java.nio.file.Paths.get("nouvelle-version.jar"),
                java.nio.file.Paths.get("app.jar"),
                java.nio.file.StandardCopyOption.REPLACE_EXISTING
        );
        // Relancer l'application
        new ProcessBuilder("java", "-jar", "app.jar").start();
        System.exit(0);
    }*/
}
