// Gestionnaire de synchronisation des bases de données
class SyncManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.syncInProgress = false;
        this.init();
    }

    init() {
        // Écouter les changements de connexion
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Vérifier l'état initial
        this.checkConnection();
        
        // Synchronisation automatique périodique
        setInterval(() => this.trySync(), 30000); // Toutes les 30 secondes
    }

    // Vérifier la connexion
    checkConnection() {
        this.isOnline = navigator.onLine;
        console.log(`Statut connexion: ${this.isOnline ? 'En ligne' : 'Hors ligne'}`);
        
        if (this.isOnline) {
            this.trySync();
        }
    }

    // Gérer le retour en ligne
    handleOnline() {
        this.isOnline = true;
        showNotification('📶 Connexion internet rétablie', 'success');
        this.trySync();
    }

    // Gérer la perte de connexion
    handleOffline() {
        this.isOnline = false;
        showNotification('⚠️ Mode hors ligne activé', 'warning');
    }

    // Obtenir la base de données active
    getActiveDatabase() {
        return this.isOnline ? 'online' : 'offline';
    }

    // Ajouter une opération à la file de synchronisation
    addToSyncQueue(operation) {
        this.syncQueue.push({
            ...operation,
            timestamp: new Date().toISOString(),
            id: Date.now() + Math.random()
        });
        
        // Sauvegarder la file d'attente
        this.saveSyncQueue();
        
        // Tenter une synchronisation immédiate si en ligne
        if (this.isOnline) {
            this.trySync();
        }
        
        return this.syncQueue.length;
    }

    // Sauvegarder la file d'attente
    saveSyncQueue() {
        try {
            localStorage.setItem('msn_sync_queue', JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('Erreur sauvegarde file sync:', error);
        }
    }

    // Charger la file d'attente
    loadSyncQueue() {
        try {
            const queue = localStorage.getItem('msn_sync_queue');
            this.syncQueue = queue ? JSON.parse(queue) : [];
            return this.syncQueue;
        } catch (error) {
            console.error('Erreur chargement file sync:', error);
            this.syncQueue = [];
            return [];
        }
    }

    // Tenter une synchronisation
    async trySync() {
        if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
            return false;
        }

        this.syncInProgress = true;
        showNotification('🔄 Synchronisation en cours...', 'info');

        try {
            const success = await this.processSyncQueue();
            
            if (success) {
                showNotification('✅ Synchronisation terminée', 'success');
            } else {
                showNotification('❌ Erreur de synchronisation', 'error');
            }
            
            return success;
        } catch (error) {
            console.error('Erreur synchronisation:', error);
            showNotification('❌ Erreur de synchronisation', 'error');
            return false;
        } finally {
            this.syncInProgress = false;
        }
    }

    // Traiter la file de synchronisation
    async processSyncQueue() {
        const queue = [...this.syncQueue];
        let successCount = 0;
        let errorCount = 0;

        for (const operation of queue) {
            try {
                // Simuler l'envoi vers le serveur
                const success = await this.sendToServer(operation);
                
                if (success) {
                    // Retirer de la file
                    this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error('Erreur traitement opération:', error);
                errorCount++;
            }
        }

        // Sauvegarder la file mise à jour
        this.saveSyncQueue();

        console.log(`Sync: ${successCount} succès, ${errorCount} erreurs`);
        return errorCount === 0;
    }

    // Simuler l'envoi au serveur
    async sendToServer(operation) {
        return new Promise((resolve) => {
            // Simuler un délai réseau
            setTimeout(() => {
                // Dans une vraie implémentation, ici on enverrait à l'API
                console.log('Envoi au serveur:', operation);
                
                // Pour la démo, on simule un succès 90% du temps
                const success = Math.random() > 0.1;
                resolve(success);
            }, 500);
        });
    }

    // Forcer une synchronisation manuelle
    async forceSync() {
        if (!this.isOnline) {
            showNotification('❌ Impossible de synchroniser - Hors ligne', 'error');
            return false;
        }

        return await this.trySync();
    }

    // Obtenir les statistiques de synchronisation
    getSyncStats() {
        return {
            online: this.isOnline,
            queueLength: this.syncQueue.length,
            lastSync: localStorage.getItem('msn_last_sync') || 'Jamais',
            syncInProgress: this.syncInProgress
        };
    }

    // Nettoyer la file de synchronisation
    clearSyncQueue() {
        this.syncQueue = [];
        this.saveSyncQueue();
        showNotification('🗑️ File de synchronisation vidée', 'success');
    }
}