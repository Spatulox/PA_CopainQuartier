package com.example.scraper.core;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.nio.file.Path;
import java.util.*;

public class Database {
    public static void save(List<Map<String, Object>> events, String fileName) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Path pluginsPath = AppFilesPath.getPluginsPath();
            Path filePath = pluginsPath.resolve(fileName);
            mapper.writeValue(filePath.toFile(), events);
            System.out.println("Données JSON écrites dans " + filePath.toFile());
        } catch (Exception e) {
            System.err.println("Erreur JSON : " + e.getMessage());
        }
    }

    public static List<Map<String, Object>> loadFromJson(String fileName) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Path pluginsPath = AppFilesPath.getPluginsPath();
            Path filePath = pluginsPath.resolve(fileName);
            return mapper.readValue(filePath.toFile(),
                    new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            System.err.println("Erreur lors de la lecture JSON : " + e.getMessage());
            return Collections.emptyList();
        }
    }
}