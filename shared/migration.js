// Script de migration vers Firebase
class MigrationManager {
    constructor() {
        this.dataManager = new DataManager();
        this.firebaseService = new FirebaseService();
    }

    async migrerToutesLesDonnees() {
        console.log("🔄 Début de la migration vers Firebase...");
        
        try {
            // 1. Créer l'utilisateur Firebase
            console.log("👤 Création de l'utilisateur Firebase...");
            const userCreated = await creerUtilisateurFirebase();
            if (!userCreated) {
                throw new Error("Impossible de créer l'utilisateur Firebase");
            }

            // 2. Attendre l'authentification
            await this.attendreAuthentification();

            // 3. Migrer les commandes
            console.log("📦 Migration des commandes...");
            await this.migrerCommandes();

            // 4. Migrer les notifications
            console.log("🔔 Migration des notifications...");
            await this.migrerNotifications();

            // 5. Migrer les livraisons
            console.log("📤 Migration des livraisons...");
            await this.migrerLivraisons();

            console.log("✅ Migration terminée avec succès !");
            return true;

        } catch (error) {
            console.error("❌ Erreur lors de la migration:", error);
            return false;
        }
    }

    async attendreAuthentification() {
        return new Promise((resolve, reject) => {
            const auth = new FirebaseAuthService();
            let attempts = 0;
            
            const checkAuth = setInterval(() => {
                attempts++;
                if (auth.isAuthenticated()) {
                    clearInterval(checkAuth);
                    resolve();
                } else if (attempts > 10) {
                    clearInterval(checkAuth);
                    reject(new Error("Timeout d'authentification"));
                }
            }, 1000);
        });
    }

    async migrerCommandes() {
        const commandes = this.dataManager.getCommandes();
        let successCount = 0;
        
        for (const commande of commandes) {
            try {
                await this.firebaseService.addCommande(commande);
                successCount++;
            } catch (error) {
                console.error(`❌ Erreur migration commande ${commande.reference}:`, error);
            }
        }
        
        console.log(`✅ Commandes migrées: ${successCount}/${commandes.length}`);
    }

    async migrerNotifications() {
        const notifications = this.dataManager.getNotifications();
        let successCount = 0;
        
        for (const notification of notifications) {
            try {
                await this.firebaseService.addNotification(notification);
                successCount++;
            } catch (error) {
                console.error(`❌ Erreur migration notification:`, error);
            }
        }
        
        console.log(`✅ Notifications migrées: ${successCount}/${notifications.length}`);
    }

    async migrerLivraisons() {
        const livraisons = this.dataManager.getLivraisons();
        let successCount = 0;
        
        for (const livraison of livraisons) {
            try {
                await this.firebaseService.addLivraison(livraison);
                successCount++;
            } catch (error) {
                console.error(`❌ Erreur migration livraison:`, error);
            }
        }
        
        console.log(`✅ Livraisons migrées: ${successCount}/${livraisons.length}`);
    }
}

// Fonction globale pour lancer la migration
async function lancerMigration() {
    if (!confirm('🚀 Lancer la migration vers Firebase ?\n\nCette opération va copier toutes vos données locales vers Firebase.')) {
        return;
    }

    const migrationManager = new MigrationManager();
    const success = await migrationManager.migrerToutesLesDonnees();
    
    if (success) {
        alert('✅ Migration réussie !\n\nToutes vos données sont maintenant synchronisées avec Firebase.');
        // Recharger la page
        location.reload();
    } else {
        alert('❌ Échec de la migration.\n\nVérifiez votre connexion internet et réessayez.');
    }
}

// Exposer la fonction globalement
window.lancerMigration = lancerMigration;