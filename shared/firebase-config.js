// Configuration Firebase - Multi-Services Numériques
const firebaseConfig = {
    apiKey: "AIzaSyCjG19rwN8_ZEtdZDYTBAdtY0gzqp-Dpp0",
    authDomain: "multi-services-numeriques.firebaseapp.com",
    projectId: "multi-services-numeriques",
    storageBucket: "multi-services-numeriques.appspot.com",
    messagingSenderId: "636624340673",
    appId: "1:636624340673:web:a4fd4d32a22f29c4217640" // ✅ Clé complétée
};

// État global Firebase
let firebaseApp = null;
let firestore = null;
let auth = null;
let firebaseDisponible = false;

// Initialisation sécurisée de Firebase
function initialiserFirebase() {
    try {
        // Vérifier si Firebase est chargé
        if (typeof firebase === 'undefined' || !firebase.app) {
            console.warn('🚫 Firebase SDK non disponible - Mode hors ligne');
            return null;
        }
        
        // Votre configuration Firebase existante
        const firebaseConfig = {
            apiKey: "AIzaSyCjG19rwN8_ZEtdZDYTBAdtY0gzqp-Dpp0",
            authDomain: "multi-services-numeriques.firebaseapp.com",
            projectId: "multi-services-numeriques",
            storageBucket: "multi-services-numeriques.appspot.com",
            messagingSenderId: "636624340673",
            appId: "1:636624340673:web:a4fd4d32a22f29c4217640" 
        };

        // Initialiser Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        console.log('✅ Firebase initialisé avec succès');
        return firebase;
        
    } catch (error) {
        console.warn('🚫 Erreur initialisation Firebase - Mode hors ligne:', error);
        return null;
    }
}

// Service d'authentification amélioré avec fallback
class FirebaseAuthService {
    constructor() {
        this.estInitialise = false;
        this.initialiser();
    }

    initialiser() {
        this.estInitialise = initialiserFirebase();
    }

    async login(email, password) {
        if (!this.estInitialise || !auth) {
            console.warn("🔌 Mode offline - Authentification locale");
            throw new Error("Firebase non disponible - Utilisez le système local");
        }
        
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log("✅ Connexion Firebase réussie:", userCredential.user.email);
            return { 
                success: true, 
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    emailVerified: userCredential.user.emailVerified
                }
            };
        } catch (error) {
            console.error("❌ Erreur connexion Firebase:", error.message);
            return { 
                success: false, 
                error: this.traduireErreurAuth(error.code),
                code: error.code
            };
        }
    }

    async createUser(email, password, donneesUtilisateur = {}) {
        if (!this.estInitialise || !auth) {
            throw new Error("Firebase non disponible");
        }
        
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Sauvegarder les données supplémentaires dans Firestore
            if (firestore) {
                await firestore.collection('utilisateurs').doc(userCredential.user.uid).set({
                    email: email,
                    nom: donneesUtilisateur.nom || '',
                    role: donneesUtilisateur.role || 'user',
                    dateCreation: new Date().toISOString(),
                    ...donneesUtilisateur
                });
            }
            
            console.log("✅ Utilisateur Firebase créé:", email);
            return { 
                success: true, 
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email
                }
            };
        } catch (error) {
            console.error("❌ Erreur création utilisateur:", error.message);
            return { 
                success: false, 
                error: this.traduireErreurAuth(error.code),
                code: error.code
            };
        }
    }

    async logout() {
        if (auth) {
            await auth.signOut();
            console.log("✅ Déconnexion Firebase");
        }
    }

    isAuthenticated() {
        return auth && auth.currentUser;
    }

    getCurrentUser() {
        return auth ? auth.currentUser : null;
    }

    // Surveiller les changements d'authentification
    onAuthStateChanged(callback) {
        if (auth) {
            return auth.onAuthStateChanged(callback);
        }
        return () => {};
    }

    // Traduction des erreurs d'authentification
    traduireErreurAuth(code) {
        const erreurs = {
            'auth/invalid-email': 'Adresse email invalide',
            'auth/user-disabled': 'Compte désactivé',
            'auth/user-not-found': 'Utilisateur non trouvé',
            'auth/wrong-password': 'Mot de passe incorrect',
            'auth/email-already-in-use': 'Email déjà utilisé',
            'auth/weak-password': 'Mot de passe trop faible',
            'auth/network-request-failed': 'Erreur réseau'
        };
        return erreurs[code] || 'Erreur d\'authentification';
    }
}

// Service Firestore amélioré avec synchronisation
class FirebaseService {
    constructor() {
        this.auth = new FirebaseAuthService();
        this.collections = {
            commandes: 'commandes',
            notifications: 'notifications',
            livraisons: 'livraisons',
            services: 'services', // NOUVEAU : Collection services
            parametres: 'parametres',
            utilisateurs: 'utilisateurs'
        };
    }

    // Vérifier la disponibilité
    estDisponible() {
        return firebaseDisponible && this.auth.isAuthenticated();
    }

    // COMMANDES
    async getCommandes() {
        if (!this.estDisponible()) {
            throw new Error("Firebase non disponible");
        }

        try {
            const snapshot = await firestore
                .collection(this.collections.commandes)
                .where('userId', '==', this.auth.getCurrentUser().uid)
                .orderBy('dateCreation', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("❌ Erreur récupération commandes:", error);
            throw error;
        }
    }

    async addCommande(commande) {
        if (!this.estDisponible()) {
            throw new Error("Firebase non disponible");
        }

        try {
            const commandeWithUser = {
                ...commande,
                userId: this.auth.getCurrentUser().uid,
                dateCreation: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            const docRef = await firestore.collection(this.collections.commandes).add(commandeWithUser);
            console.log("✅ Commande sauvegardée Firebase:", docRef.id);
            return { ...commande, id: docRef.id };
        } catch (error) {
            console.error("❌ Erreur sauvegarde commande:", error);
            throw error;
        }
    }

    async updateCommande(id, updates) {
        if (!this.estDisponible()) {
            throw new Error("Firebase non disponible");
        }

        try {
            await firestore.collection(this.collections.commandes).doc(id).update({
                ...updates,
                lastUpdated: new Date().toISOString()
            });
            console.log("✅ Commande mise à jour Firebase:", id);
            return true;
        } catch (error) {
            console.error("❌ Erreur mise à jour commande:", error);
            throw error;
        }
    }

    // NOTIFICATIONS
    async getNotifications() {
        if (!this.estDisponible()) return [];
        
        try {
            const snapshot = await firestore
                .collection(this.collections.notifications)
                .where('userId', '==', this.auth.getCurrentUser().uid)
                .orderBy('dateCreation', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("❌ Erreur récupération notifications:", error);
            return [];
        }
    }

    async addNotification(notification) {
        if (!this.estDisponible()) {
            throw new Error("Firebase non disponible");
        }

        try {
            const notifWithUser = {
                ...notification,
                userId: this.auth.getCurrentUser().uid,
                dateCreation: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            const docRef = await firestore.collection(this.collections.notifications).add(notifWithUser);
            console.log("✅ Notification sauvegardée Firebase:", notification.titre);
            return { ...notification, id: docRef.id };
        } catch (error) {
            console.error("❌ Erreur sauvegarde notification:", error);
            throw error;
        }
    }

    // LIVRAISONS
    async getLivraisons() {
        if (!this.estDisponible()) return [];
        
        try {
            const snapshot = await firestore
                .collection(this.collections.livraisons)
                .where('userId', '==', this.auth.getCurrentUser().uid)
                .orderBy('dateEnvoi', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("❌ Erreur récupération livraisons:", error);
            return [];
        }
    }

    async addLivraison(livraison) {
        if (!this.estDisponible()) {
            throw new Error("Firebase non disponible");
        }

        try {
            const livraisonWithUser = {
                ...livraison,
                userId: this.auth.getCurrentUser().uid,
                dateCreation: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            const docRef = await firestore.collection(this.collections.livraisons).add(livraisonWithUser);
            console.log("✅ Livraison sauvegardée Firebase:", livraison.commandeReference);
            return { ...livraison, id: docRef.id };
        } catch (error) {
            console.error("❌ Erreur sauvegarde livraison:", error);
            throw error;
        }
    }

    // NOUVEAU : SERVICES
    async getServices() {
        if (!this.estDisponible()) {
            throw new Error("Firebase non disponible");
        }

        try {
            const snapshot = await firestore
                .collection(this.collections.services)
                .where('userId', '==', this.auth.getCurrentUser().uid)
                .where('active', '==', true)
                .orderBy('categorie')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("❌ Erreur récupération services:", error);
            throw error;
        }
    }

    async addService(service) {
        if (!this.estDisponible()) {
            throw new Error("Firebase non disponible");
        }

        try {
            const serviceWithUser = {
                ...service,
                userId: this.auth.getCurrentUser().uid,
                dateCreation: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            const docRef = await firestore.collection(this.collections.services).add(serviceWithUser);
            console.log("✅ Service sauvegardé Firebase:", service.nom);
            return { ...service, id: docRef.id };
        } catch (error) {
            console.error("❌ Erreur sauvegarde service:", error);
            throw error;
        }
    }

    async updateService(id, updates) {
        if (!this.estDisponible()) {
            throw new Error("Firebase non disponible");
        }

        try {
            await firestore.collection(this.collections.services).doc(id).update({
                ...updates,
                lastUpdated: new Date().toISOString()
            });
            console.log("✅ Service mis à jour Firebase:", id);
            return true;
        } catch (error) {
            console.error("❌ Erreur mise à jour service:", error);
            throw error;
        }
    }

    async deleteService(id) {
        if (!this.estDisponible()) {
            throw new Error("Firebase non disponible");
        }

        try {
            await firestore.collection(this.collections.services).doc(id).update({
                active: false,
                lastUpdated: new Date().toISOString()
            });
            console.log("✅ Service désactivé Firebase:", id);
            return true;
        } catch (error) {
            console.error("❌ Erreur désactivation service:", error);
            throw error;
        }
    }

    // PARAMÈTRES
    async getParametres() {
        if (!this.estDisponible()) {
            throw new Error("Firebase non disponible");
        }

        try {
            const doc = await firestore
                .collection(this.collections.parametres)
                .doc(this.auth.getCurrentUser().uid)
                .get();

            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error("❌ Erreur récupération paramètres:", error);
            throw error;
        }
    }

    async saveParametres(parametres) {
        if (!this.estDisponible()) {
            throw new Error("Firebase non disponible");
        }

        try {
            await firestore
                .collection(this.collections.parametres)
                .doc(this.auth.getCurrentUser().uid)
                .set({
                    ...parametres,
                    lastUpdated: new Date().toISOString()
                });
            console.log("✅ Paramètres sauvegardés Firebase");
            return true;
        } catch (error) {
            console.error("❌ Erreur sauvegarde paramètres:", error);
            throw error;
        }
    }
}

// Fonction utilitaire pour créer l'utilisateur principal
async function creerUtilisateurFirebase() {
    const firebaseAuth = new FirebaseAuthService();
    
    try {
        const result = await firebaseAuth.createUser(
            "ismael@multiservices.com", 
            "414011Z39t95",
            {
                nom: "Ismael",
                role: "admin",
                entreprise: "Multi-Services Numériques"
            }
        );
        
        if (result.success) {
            console.log("✅ Utilisateur admin créé dans Firebase");
            
            // Initialiser les données par défaut
            const firebaseService = new FirebaseService();
            await initialiserDonneesParDefaut(firebaseService);
            
            return true;
        } else {
            console.log("❌ Erreur création utilisateur:", result.error);
            return false;
        }
    } catch (error) {
        console.error("❌ Erreur création utilisateur Firebase:", error);
        return false;
    }
}

// Initialiser les données par défaut dans Firebase
async function initialiserDonneesParDefaut(firebaseService) {
    try {
        // Services par défaut
        const servicesDefaut = [
            {
                nom: "Saisie de données",
                categorie: "saisie",
                prix: 700,
                unite: "page",
                description: "Saisie de données textuelles",
                active: true,
                particulier: false
            },
            {
                nom: "Service Personnalisé",
                categorie: "autre",
                prix: 0,
                unite: "personnalisé",
                description: "Service sur mesure avec prix libre",
                active: true,
                particulier: true
            }
        ];

        for (const service of servicesDefaut) {
            await firebaseService.addService(service);
        }

        console.log("✅ Données par défaut initialisées dans Firebase");
    } catch (error) {
        console.error("❌ Erreur initialisation données:", error);
    }
}

// Détecter les changements de connexion
function surveillerConnexion() {
    if (firestore) {
        firestore.enableNetwork()
            .then(() => {
                console.log("🌐 Connecté à Firebase");
                document.dispatchEvent(new CustomEvent('firebaseConnected'));
            })
            .catch(err => {
                console.warn("🔌 Déconnecté de Firebase");
                document.dispatchEvent(new CustomEvent('firebaseDisconnected'));
            });
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', function() {
    initialiserFirebase();
    surveillerConnexion();
});

// Exposer les fonctions globalement
window.creerUtilisateurFirebase = creerUtilisateurFirebase;
window.FirebaseAuthService = FirebaseAuthService;
window.FirebaseService = FirebaseService;
window.firebaseDisponible = firebaseDisponible;

console.log("🔥 Firebase config chargée - Prêt pour la synchronisation");