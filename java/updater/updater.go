package main

import (
    "fmt"
    "os"
    "path/filepath"
)

func replaceExecutableByNewVersion(appDir string) error {
    source := filepath.Join(appDir, "new-version.jar")
    target := filepath.Join(appDir, "javaapp.jar")

    // Supprimer le fichier cible s'il existe (pour éviter erreur de move)
    if _, err := os.Stat(target); err == nil {
        err = os.Remove(target)
        if err != nil {
            return fmt.Errorf("impossible de supprimer %s : %w", target, err)
        }
    }

    // Renommer (déplacer) source vers target
    err := os.Rename(source, target)
    if err != nil {
        return fmt.Errorf("impossible de renommer %s en %s : %w", source, target, err)
    }

    fmt.Println("Mise à jour réussie ! Redémarrage requis pour prendre effet.")
    return nil
}

func main() {
    // Trouver le dossier de l'exécutable Go (ici, bin)
    exePath, err := os.Executable()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Impossible de trouver le chemin de l'exécutable : %v\n", err)
        os.Exit(1)
    }
    binDir := filepath.Dir(exePath)

    // Aller dans lib/app à partir de bin
    appDir := filepath.Join(binDir, "..", "lib", "app")
    appDir, err = filepath.Abs(appDir)
    if err != nil {
        fmt.Fprintf(os.Stderr, "Erreur lors de la résolution du chemin absolu : %v\n", err)
        os.Exit(1)
    }

    err = replaceExecutableByNewVersion(appDir)
    if err != nil {
        fmt.Fprintf(os.Stderr, "Erreur lors de la mise à jour : %v\n", err)
        os.Exit(1)
    }
}