package com.example.scraper.plugins;

import com.example.scraper.core.Plugin;
import com.example.scraper.pluginutils.InternetRequest;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;

public class Popup extends Plugin {

    @Override
    public void execute() throws Exception {
        System.out.println("Popup plugin executed!");
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("Popup Plugin Demo");
        alert.setHeaderText("Hello, this is a test popup plugin!");

        Button btnClose = new Button("Close");
        btnClose.setOnAction(e -> alert.close());

        VBox content = new VBox(10, new Label("Hello, this is a test popup plugin!"), btnClose);
        alert.getDialogPane().setContent(content);

        alert.showAndWait();
    }

    @Override
    public VBox view() {
        // Retourne un VBox vide, ou un message si tu veux
        return new VBox();
    }

    @Override
    public Button HeaderButton(Runnable refreshView) {
        Button btn = new Button("Test Popup");
        btn.setOnAction(e -> {
            try {
                execute();
                refreshView.run();
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        });
        return btn;
    }

    @Override
    public String name(){
        return "Popup";
    }
}
