// Système de sauvegarde locale pour Multi-Services Numériques
class SauvegardeLocale {
    constructor() {
        this.cleSauvegarde = 'msn_sauvegarde';
        this.chargerSauvegarde();
    }

    chargerSauvegarde() {
        const sauvegarde = localStorage.getItem(this.cleSauvegarde);
        if (sauvegarde) {
            this.donnees = JSON.parse(sauvegarde);
        } else {
            // Initialiser avec des données par défaut
            this.donnees = {
                dernierNumeroSequence: 0,
                references: [],
                commandes: [],
                dateDerniereSauvegarde: new Date().toISOString()
            };
            this.sauvegarder();
        }
    }

    sauvegarder() {
        this.donnees.dateDerniereSauvegarde = new Date().toISOString();
        localStorage.setItem(this.cleSauvegarde, JSON.stringify(this.donnees));
    }

    genererNouvelleReference(type = 'DEV') {
        const now = new Date();
        const annee = now.getFullYear().toString().substr(-2);
        const mois = (now.getMonth() + 1).toString().padStart(2, '0');
        const jour = now.getDate().toString().padStart(2, '0');
        
        // Incrémenter le numéro de séquence
        this.donnees.dernierNumeroSequence++;
        const sequence = this.donnees.dernierNumeroSequence.toString().padStart(3, '0');
        
        const reference = `${type}-${annee}${mois}${jour}-${sequence}`;
        
        // Sauvegarder la référence
        this.donnees.references.push({
            reference: reference,
            type: type,
            date: now.toISOString(),
            numeroSequence: this.donnees.dernierNumeroSequence
        });
        
        this.sauvegarder();
        return reference;
    }

    sauvegarderCommande(commandeData) {
        const commande = {
            id: Date.now(),
            reference: commandeData.reference,
            client: commandeData.client,
            total: commandeData.total,
            services: commandeData.services,
            dateCreation: new Date().toISOString(),
            statut: 'devis'
        };
        
        this.donnees.commandes.push(commande);
        this.sauvegarder();
        return commande;
    }

    mettreAJourCommande(reference, nouvellesDonnees) {
        const commande = this.donnees.commandes.find(cmd => cmd.reference === reference);
        if (commande) {
            Object.assign(commande, nouvellesDonnees);
            this.sauvegarder();
            return true;
        }
        return false;
    }

    getDerniereReference() {
        if (this.donnees.references.length > 0) {
            return this.donnees.references[this.donnees.references.length - 1];
        }
        return null;
    }

    getNombreCommandesAujourdhui() {
        const aujourdhui = new Date().toDateString();
        return this.donnees.commandes.filter(cmd => 
            new Date(cmd.dateCreation).toDateString() === aujourdhui
        ).length;
    }

    getStatistiques() {
        const aujourdhui = new Date().toDateString();
        const commandesAujourdhui = this.donnees.commandes.filter(cmd => 
            new Date(cmd.dateCreation).toDateString() === aujourdhui
        );
        
        return {
            totalCommandes: this.donnees.commandes.length,
            commandesAujourdhui: commandesAujourdhui.length,
            dernierNumeroSequence: this.donnees.dernierNumeroSequence,
            dateDerniereSauvegarde: this.donnees.dateDerniereSauvegarde
        };
    }

    exporterSauvegarde() {
        const dataStr = JSON.stringify(this.donnees, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `sauvegarde_msn_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    importerSauvegarde(fichier) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const donneesImportees = JSON.parse(e.target.result);
                this.donnees = donneesImportees;
                this.sauvegarder();
                alert('Sauvegarde importée avec succès !');
                location.reload();
            } catch (error) {
                alert('Erreur lors de l\'importation : ' + error.message);
            }
        };
        reader.readAsText(fichier);
    }
}

// Créer une instance globale
const sauvegardeMSN = new SauvegardeLocale();