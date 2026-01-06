// Gestionnaire de synchronisation amélioré
class SyncManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.syncInProgress = false;
        this.firebaseService = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.init();
    }

    init() {
        // Initialiser FirebaseService de manière sécurisée
        this.initFirebaseService();
        
        // Écouter la connexion internet
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Charger la file d'attente existante
        this.loadSyncQueue();
        
        // Synchroniser toutes les 2 minutes si online (optimisé)
        setInterval(() => this.trySync(), 120000);
        
        // Synchroniser au chargement si online
        setTimeout(() => this.trySync(), 5000);
        
        console.log("🔄 SyncManager initialisé - En ligne:", this.isOnline);
    }

    // Initialisation sécurisée de FirebaseService
    initFirebaseService() {
        try {
            if (typeof FirebaseService !== 'undefined') {
                this.firebaseService = new FirebaseService();
                console.log("✅ FirebaseService initialisé pour la synchronisation");
            } else {
                console.warn("⚠️ FirebaseService non disponible - Mode standalone");
                this.firebaseService = this.createMockFirebaseService();
            }
        } catch (error) {
            console.error("❌ Erreur initialisation FirebaseService:", error);
            this.firebaseService = this.createMockFirebaseService();
        }
    }

    // Service mock pour le mode standalone
    createMockFirebaseService() {
        return {
            estDisponible: () => false,
            getCommandes: async () => { throw new Error("Firebase non disponible"); },
            addCommande: async () => { throw new Error("Firebase non disponible"); },
            updateCommande: async () => { throw new Error("Firebase non disponible"); },
            getNotifications: async () => [],
            addNotification: async () => { throw new Error("Firebase non disponible"); },
            getLivraisons: async () => [],
            addLivraison: async () => { throw new Error("Firebase non disponible"); },
            getServices: async () => { throw new Error("Firebase non disponible"); },
            addService: async () => { throw new Error("Firebase non disponible"); },
            updateService: async () => { throw new Error("Firebase non disponible"); },
            deleteService: async () => { throw new Error("Firebase non disponible"); },
            getParametres: async () => null,
            saveParametres: async () => { throw new Error("Firebase non disponible"); }
        };
    }

    handleOnline() {
        this.isOnline = true;
        this.retryCount = 0;
        console.log("📶 Connexion rétablie - Lancement synchronisation...");
        
        // Notifier l'application
        this.dispatchSyncEvent('online');
        
        // Synchroniser après un délai pour laisser Firebase s'initialiser
        setTimeout(() => this.trySync(), 2000);
    }

    handleOffline() {
        this.isOnline = false;
        console.log("⚠️ Mode hors ligne");
        this.dispatchSyncEvent('offline');
    }

    // Ajouter une opération à synchroniser
    addToSyncQueue(operation) {
        const operationWithId = {
            ...operation,
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            retryCount: 0
        };
        
        this.syncQueue.push(operationWithId);
        this.saveSyncQueue();
        
        console.log("📋 Opération ajoutée à la file:", operation.type, operationWithId.id);
        
        // Tenter une sync immédiate si online
        if (this.isOnline && this.firebaseService?.estDisponible?.()) {
            setTimeout(() => this.trySync(), 1000);
        }
        
        return this.syncQueue.length;
    }

    // Sauvegarder la file d'attente
    saveSyncQueue() {
        try {
            localStorage.setItem('msn_sync_queue', JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error("❌ Erreur sauvegarde file sync:", error);
        }
    }

    // Charger la file d'attente
    loadSyncQueue() {
        try {
            const queue = localStorage.getItem('msn_sync_queue');
            this.syncQueue = queue ? JSON.parse(queue) : [];
            console.log(`📋 File sync chargée: ${this.syncQueue.length} opérations`);
        } catch (error) {
            console.error("❌ Erreur chargement file sync:", error);
            this.syncQueue = [];
        }
        return this.syncQueue;
    }

    // Synchroniser vers Firebase
    async syncToFirebase() {
        if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
            return { success: false, reason: 'Non applicable' };
        }

        if (!this.firebaseService?.estDisponible?.()) {
            console.warn("🔌 Firebase non disponible - Sync reportée");
            return { success: false, reason: 'Firebase indisponible' };
        }

        this.syncInProgress = true;
        this.dispatchSyncEvent('syncStart');
        
        console.log("🔄 Début synchronisation vers Firebase...");

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // Traiter les opérations dans l'ordre
        const operationsToProcess = [...this.syncQueue];
        
        for (const operation of operationsToProcess) {
            try {
                const success = await this.processOperation(operation);
                
                if (success) {
                    // Retirer de la file
                    this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
                    successCount++;
                } else {
                    // Incrémenter le compteur de tentatives
                    operation.retryCount = (operation.retryCount || 0) + 1;
                    
                    if (operation.retryCount >= this.maxRetries) {
                        console.warn(`🗑️ Opération abandonnée après ${this.maxRetries} tentatives:`, operation.type);
                        this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
                        errors.push(`Opération ${operation.type} abandonnée`);
                    }
                    
                    errorCount++;
                }
            } catch (error) {
                console.error("❌ Erreur opération:", error);
                errorCount++;
                errors.push(error.message);
            }
        }

        this.saveSyncQueue();
        this.syncInProgress = false;

        const result = {
            success: errorCount === 0,
            stats: {
                successCount,
                errorCount,
                total: operationsToProcess.length
            },
            errors: errors.length > 0 ? errors : undefined
        };

        console.log(`✅ Sync vers Firebase: ${successCount} succès, ${errorCount} erreurs`);
        this.dispatchSyncEvent('syncComplete', result);
        
        return result;
    }

    // Traiter une opération (AMÉLIORÉ avec gestion des services)
    async processOperation(operation) {
        try {
            switch (operation.type) {
                case 'ADD_COMMANDE':
                    await this.firebaseService.addCommande(operation.data);
                    break;
                    
                case 'UPDATE_COMMANDE':
                    await this.firebaseService.updateCommande(operation.data.id, operation.data.updates);
                    break;
                    
                case 'ADD_NOTIFICATION':
                    await this.firebaseService.addNotification(operation.data);
                    break;
                    
                case 'ADD_LIVRAISON':
                    await this.firebaseService.addLivraison(operation.data);
                    break;
                    
                // NOUVEAU : Opérations de gestion des services
                case 'ADD_SERVICE':
                    await this.firebaseService.addService(operation.data);
                    break;
                    
                case 'UPDATE_SERVICE':
                    await this.firebaseService.updateService(operation.data.id, operation.data.updates);
                    break;
                    
                case 'DELETE_SERVICE':
                    await this.firebaseService.deleteService(operation.data.id);
                    break;
                    
                case 'SAVE_PARAMETRES':
                    await this.firebaseService.saveParametres(operation.data);
                    break;
                    
                default:
                    console.warn("⚠️ Type d'opération inconnu:", operation.type);
                    return false;
            }
            
            console.log(`✅ Opération ${operation.type} synchronisée`);
            return true;
            
        } catch (error) {
            console.error(`❌ Erreur opération ${operation.type}:`, error);
            
            // Ne pas retenter pour certaines erreurs critiques
            if (error.message.includes('non trouvé') || error.message.includes('permission')) {
                console.warn(`🗑️ Opération ${operation.type} ignorée (erreur critique)`);
                return true; // Marquer comme succès pour retirer de la file
            }
            
            return false;
        }
    }

    // Synchroniser depuis Firebase (AMÉLIORÉ avec résolution de conflits)
    async syncFromFirebase() {
        if (!this.isOnline || this.syncInProgress) {
            return { success: false, reason: 'Non applicable' };
        }

        if (!this.firebaseService?.estDisponible?.()) {
            return { success: false, reason: 'Firebase indisponible' };
        }

        try {
            console.log("📥 Synchronisation depuis Firebase...");
            this.dispatchSyncEvent('syncStart');
            
            // Récupérer toutes les données
            const [commandes, notifications, livraisons, services, parametres] = await Promise.all([
                this.firebaseService.getCommandes().catch(() => []),
                this.firebaseService.getNotifications().catch(() => []),
                this.firebaseService.getLivraisons().catch(() => []),
                this.firebaseService.getServices().catch(() => []),
                this.firebaseService.getParametres().catch(() => null)
            ]);

            // NOUVEAU : Résolution de conflits
            const mergedData = this.resolveConflicts({
                commandes,
                notifications, 
                livraisons,
                services,
                parametres
            });

            // Sauvegarder localement
            localStorage.setItem('msn_online_commandes', JSON.stringify(mergedData.commandes));
            localStorage.setItem('msn_online_notifications', JSON.stringify(mergedData.notifications));
            localStorage.setItem('msn_online_livraisons', JSON.stringify(mergedData.livraisons));
            localStorage.setItem('msn_online_services', JSON.stringify(mergedData.services));
            
            if (mergedData.parametres) {
                localStorage.setItem('msn_online_parametres', JSON.stringify(mergedData.parametres));
            }

            localStorage.setItem('msn_last_sync', new Date().toISOString());
            
            const result = {
                success: true,
                stats: {
                    commandes: mergedData.commandes.length,
                    notifications: mergedData.notifications.length,
                    livraisons: mergedData.livraisons.length,
                    services: mergedData.services.length,
                    parametres: mergedData.parametres ? 1 : 0
                }
            };
            
            console.log(`✅ Sync depuis Firebase: ${mergedData.commandes.length} commandes, ${mergedData.services.length} services`);
            this.dispatchSyncEvent('syncComplete', result);
            
            return result;
            
        } catch (error) {
            console.error("❌ Erreur sync depuis Firebase:", error);
            this.dispatchSyncEvent('syncError', { error: error.message });
            return { success: false, error: error.message };
        }
    }

    // NOUVEAU : Résolution de conflits entre données locales et cloud
    resolveConflicts(cloudData) {
        const resolvedData = { ...cloudData };
        
        try {
            // Résolution des commandes : priorité à la version la plus récente
            const localCommandes = JSON.parse(localStorage.getItem('msn_offline_commandes') || '[]');
            resolvedData.commandes = this.mergeByTimestamp(localCommandes, cloudData.commandes, 'lastUpdated');
            
            // Résolution des services : fusion intelligente
            const localServices = JSON.parse(localStorage.getItem(this.cleServices) || '[]');
            resolvedData.services = this.mergeServices(localServices, cloudData.services);
            
            // Résolution des paramètres : cloud prioritaire sauf modifications locales récentes
            const localParametres = JSON.parse(localStorage.getItem('msn_parametres') || '{}');
            if (localParametres.lastUpdated && cloudData.parametres?.lastUpdated) {
                const localDate = new Date(localParametres.lastUpdated);
                const cloudDate = new Date(cloudData.parametres.lastUpdated);
                resolvedData.parametres = localDate > cloudDate ? localParametres : cloudData.parametres;
            }
            
        } catch (error) {
            console.error("❌ Erreur résolution conflits:", error);
        }
        
        return resolvedData;
    }

    // Fusionner par timestamp
    mergeByTimestamp(localData, cloudData, timestampField = 'lastUpdated') {
        const merged = [...cloudData];
        const cloudIds = new Set(cloudData.map(item => item.id));
        
        localData.forEach(localItem => {
            const existingIndex = merged.findIndex(cloudItem => cloudItem.id === localItem.id);
            
            if (existingIndex !== -1) {
                // Choisir la version la plus récente
                const localTime = new Date(localItem[timestampField] || 0);
                const cloudTime = new Date(merged[existingIndex][timestampField] || 0);
                
                if (localTime > cloudTime) {
                    merged[existingIndex] = localItem;
                }
            } else if (!cloudIds.has(localItem.id)) {
                // Ajouter les éléments locaux non présents dans le cloud
                merged.push(localItem);
            }
        });
        
        return merged;
    }

    // Fusion spéciale pour les services
    mergeServices(localServices, cloudServices) {
        const merged = [...cloudServices];
        const cloudIds = new Set(cloudServices.map(s => s.id));
        
        localServices.forEach(localService => {
            if (!cloudIds.has(localService.id)) {
                merged.push(localService);
            }
        });
        
        return merged;
    }

    // Tenter une synchronisation complète
    async trySync() {
        if (this.syncInProgress || !this.isOnline) {
            return { success: false, reason: 'Sync déjà en cours ou hors ligne' };
        }

        try {
            console.log("🔄 Tentative de synchronisation complète...");
            
            const fromResult = await this.syncFromFirebase();
            const toResult = await this.syncToFirebase();
            
            const result = {
                success: fromResult.success && toResult.success,
                from: fromResult,
                to: toResult
            };
            
            if (result.success) {
                this.retryCount = 0;
                console.log("✅ Synchronisation complète réussie");
            } else {
                this.retryCount++;
                console.warn(`⚠️ Synchronisation partielle (tentative ${this.retryCount})`);
            }
            
            return result;
            
        } catch (error) {
            console.error("❌ Erreur synchronisation complète:", error);
            return { success: false, error: error.message };
        }
    }

    // Synchronisation manuelle
    async forceSync() {
        if (!this.isOnline) {
            throw new Error("Hors ligne - Impossible de synchroniser");
        }
        
        console.log("🔧 Synchronisation manuelle demandée...");
        return await this.trySync();
    }

    // Obtenir le statut détaillé
    getSyncStatus() {
        const lastSync = localStorage.getItem('msn_last_sync');
        
        return {
            online: this.isOnline,
            queueLength: this.syncQueue.length,
            syncInProgress: this.syncInProgress,
            lastSync: lastSync ? new Date(lastSync).toLocaleString() : 'Jamais',
            firebaseAvailable: this.firebaseService?.estDisponible?.() || false,
            retryCount: this.retryCount
        };
    }

    // Vider la file
    clearSyncQueue() {
        const count = this.syncQueue.length;
        this.syncQueue = [];
        this.saveSyncQueue();
        console.log(`🧹 File sync vidée: ${count} opérations supprimées`);
        return count;
    }

    // Émettre des événements de synchronisation
    dispatchSyncEvent(type, detail = {}) {
        const event = new CustomEvent(`sync:${type}`, { 
            detail: { ...detail, timestamp: new Date().toISOString() }
        });
        document.dispatchEvent(event);
    }

    // NOUVEAU : Statistiques détaillées
    getDetailedStats() {
        const status = this.getSyncStatus();
        const queueTypes = this.syncQueue.reduce((acc, op) => {
            acc[op.type] = (acc[op.type] || 0) + 1;
            return acc;
        }, {});

        return {
            ...status,
            queueByType: queueTypes,
            nextAutoSync: new Date(Date.now() + 120000).toLocaleTimeString(),
            storageUsage: this.getStorageUsage()
        };
    }

    getStorageUsage() {
        try {
            const queueSize = JSON.stringify(this.syncQueue).length;
            return {
                queueSize: Math.round(queueSize / 1024 * 100) / 100, // KB
                queueItems: this.syncQueue.length
            };
        } catch (error) {
            return { queueSize: 0, queueItems: 0 };
        }
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', function() {
    // Créer l'instance globale
    if (typeof window.syncManager === 'undefined') {
        window.syncManager = new SyncManager();
    }
});

console.log("🔄 SyncManager chargé - Prêt pour la synchronisation bidirectionnelle");