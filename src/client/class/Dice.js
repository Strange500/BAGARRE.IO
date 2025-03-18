import fs from 'fs';
import path from 'path';

export class Dice {
    static RESOURCE_PATH = path.resolve(__dirname, '../../../res/bonusImage/'); // à faire, faire la gestion des images de bonus

    constructor() {
        this.resourcePath = Dice.RESOURCE_PATH;
    }

    rollDice() {
        try {
            const files = fs.readdirSync(this.resourcePath);
            if (files.length < 3) {
                throw new Error("Il doit y avoir au moins 3 fichiers dans le dossier ressource.");
            }

            // Mélanger le tableau avec Fisher-Yates Shuffle
            for (let i = files.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [files[i], files[j]] = [files[j], files[i]]; // Swap
            }

            // Prendre les 3 premiers éléments du tableau mélangé
            return files.slice(0, 3);

        } catch (error) {
            console.error("Erreur lors du lancement des dés :", error.message);
            return [];
        }
    }
}
