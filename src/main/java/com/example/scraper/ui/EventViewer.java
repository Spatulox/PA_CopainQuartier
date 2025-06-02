package com.example.scraper.ui;

import com.example.scraper.EvousScraper;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.scene.control.*;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import org.w3c.dom.*;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;

public class EventViewer {
    private final TableView<Event> table = new TableView<>();
    private final ObservableList<Event> data = FXCollections.observableArrayList();

    public BorderPane getView() {
        TableColumn<Event, String> titleCol = new TableColumn<>("Titre");
        titleCol.setCellValueFactory(param -> param.getValue().titleProperty());

        TableColumn<Event, String> dateCol = new TableColumn<>("Date");
        dateCol.setCellValueFactory(param -> param.getValue().dateProperty());

        table.getColumns().addAll(titleCol, dateCol);
        table.setItems(data);

        Button scrapeButton = new Button("Lancer le scraping");
        scrapeButton.setOnAction(e -> {
            new EvousScraper().scrape();
            loadData(); // recharge les données après scraping
        });

        VBox vbox = new VBox(10, scrapeButton, table);

        loadData();

        BorderPane root = new BorderPane();
        root.setCenter(vbox);
        return root;
    }

    private void loadData() {
        data.clear();

        try {
            File xmlFile = new File("events.xml");
            if (!xmlFile.exists()) return;

            Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(xmlFile);
            NodeList nodes = doc.getElementsByTagName("event");

            for (int i = 0; i < nodes.getLength(); i++) {
                Element event = (Element) nodes.item(i);
                String title = event.getElementsByTagName("title").item(0).getTextContent();
                String date = event.getElementsByTagName("date").item(0).getTextContent();
                data.add(new Event(title, date));
            }

        } catch (Exception e) {
            System.err.println("Erreur lecture XML : " + e.getMessage());
        }
    }
}
