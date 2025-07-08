Les libs ne sont pas mises à jours

# Compilation (webscrapper.jar) :
> - Transforme l'app en .jar avec toutes les dépendances
> - ./compileJar.sh

# Compilation (jpackage => package WebScrapper + binaire):
> - Besoin des lib Java (Javafx, etc...)
> - Fichier webscrapper.jar
> - "Compilation" avec jpackage
> - ./compileJava.sh

# Système de Mise à jour automatique :
> - Request le serveur pour la dernière version
> - Compare (!=) avec la version local
> - Télécharger le fichier webscrapper.jar (fichiers ressources)
> - Remplace le fichier Webscrapper/lib/app/webscrapper.jar (local jpackage) par le nouveau webscrapper.jar de l'API