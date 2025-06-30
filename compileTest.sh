#javac -d . Test.java Plugin.java ../core/ScraperPlugin.java && jar cf MyJar.jar *.class

mkdir -p build
javac -d build src/main/java/com/example/scraper/core/ScraperPlugin.java src/main/java/com/example/scraper/plugins/Test.java

# Assure-toi que META-INF/services/... existe dans build
mkdir -p build/META-INF/services
echo "com.example.scraper.plugins.Test" > build/META-INF/services/com.example.scraper.core.ScraperPlugin

# Crée le jar depuis le dossier build
cd build
jar cf MyJar.jar META-INF/ com/
