package com.example.scraper;

import org.w3c.dom.*;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.File;

public class Database {

    private static final String FILE_PATH = "events.xml";

    public static void saveEvent(String title, String url, String date, String type, String source) {
        try {
            File xmlFile = new File(FILE_PATH);
            Document doc;
            Element root;

            if (xmlFile.exists()) {
                doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(xmlFile);
                root = doc.getDocumentElement();
            } else {
                doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().newDocument();
                root = doc.createElement("events");
                doc.appendChild(root);
            }

            Element event = doc.createElement("event");

            Element titleElem = doc.createElement("title");
            titleElem.appendChild(doc.createTextNode(title));
            event.appendChild(titleElem);

            Element urlElem = doc.createElement("url");
            urlElem.appendChild(doc.createTextNode(url));
            event.appendChild(urlElem);

            Element dateElem = doc.createElement("date");
            dateElem.appendChild(doc.createTextNode(date));
            event.appendChild(dateElem);

            Element typeElem = doc.createElement("type");
            typeElem.appendChild(doc.createTextNode(type));
            event.appendChild(typeElem);

            Element sourceElem = doc.createElement("source");
            sourceElem.appendChild(doc.createTextNode(source));
            event.appendChild(sourceElem);

            root.appendChild(event);

            Transformer transformer = TransformerFactory.newInstance().newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.transform(new DOMSource(doc), new StreamResult(xmlFile));

        } catch (Exception e) {
            System.err.println("Erreur XML : " + e.getMessage());
        }
    }
}
