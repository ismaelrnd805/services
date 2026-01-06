// ===== GESTIONNAIRE DE CONFIGURATION - VERSION COMPLÈTE =====

// Gestionnaire de configuration principal
class ConfigurationManager {
    constructor() {
        console.log('🛠️ Initialisation ConfigurationManager...');
        
        this.config = this.chargerConfiguration();
        this.appliquerConfiguration();
        this.mettreAJourInterface();
        
        console.log('✅ ConfigurationManager initialisé');
    }

    chargerConfiguration() {
        console.log('📥 Chargement de la configuration...');
        const configSauvegardee = localStorage.getItem('msn_configuration');
        if (configSauvegardee) {
            try {
                const config = JSON.parse(configSauvegardee);
                console.log('✅ Configuration chargée depuis le stockage');
                return { ...this.getConfigurationDefaut(), ...config };
            } catch (e) {
                console.error('❌ Erreur chargement configuration:', e);
                return this.getConfigurationDefaut();
            }
        }
        console.log('ℹ️ Configuration par défaut utilisée');
        return this.getConfigurationDefaut();
    }

    getConfigurationDefaut() {
        return {
            // Interface
            theme: 'bleu',
            couleurPrimaire: '#2c3e50',
            couleurSecondaire: '#3498db',
            modeSombre: true,
            typeNavigation: 'sidebar',
            densiteAffichage: 'comfort',
            animations: true,

            // Fonctionnalités
            modules: {
                commandes: true,
                clients: true,
                finances: true,
                notifications: true,
                export: true,
                statistiques: true
            },

            // Notifications
            notifications: {
                son: true,
                browser: true,
                duree: 5,
                intervalVerif: 30,
                rappelDevis: true,
                rappelPaiement: true
            },

            // Export/Import
            export: {
                format: 'json',
                inclureCommandes: true,
                inclureClients: true
            },

            // Système
            systeme: {
                intervalActualisation: 30,
                cacheActif: true,
                compression: true,
                delaiDeconnexion: 60,
                verifIntegrite: true,
                sauvegardeAuto: true
            },

            // Métadonnées
            meta: {
                version: '1.0.0',
                derniereSauvegarde: null,
                dateInstallation: new Date().toISOString()
            }
        };
    }

    sauvegarderConfiguration(config = null) {
    if (config) {
        this.config = config;
    }
    
    this.config.meta.derniereSauvegarde = new Date().toISOString();
    
    try {
        localStorage.setItem('msn_configuration', JSON.stringify(this.config));
        
        // FORCER LA RE-APPLICATION DE LA CONFIGURATION
        this.appliquerConfiguration();
        this.mettreAJourInterface();
        
        console.log('✅ Configuration sauvegardée et appliquée');
        return true;
    } catch (e) {
        console.error('❌ Erreur sauvegarde configuration:', e);
        return false;
    }
}

    appliquerConfiguration() {
        console.log('🎨 Application de la configuration...');
        this.appliquerTheme();
        this.appliquerModules();
        this.appliquerParametresSysteme();
    }

    appliquerTheme() {
    try {
        const root = document.documentElement;
        
        console.log('🎨 Application du thème:', this.config.theme);
        console.log('🎨 Couleur primaire:', this.config.couleurPrimaire);
        console.log('🎨 Couleur secondaire:', this.config.couleurSecondaire);
        
        // Appliquer les couleurs CSS aux variables Bootstrap
        root.style.setProperty('--bs-primary', this.config.couleurPrimaire);
        root.style.setProperty('--bs-secondary', this.config.couleurSecondaire);
        
        // Appliquer également aux variables personnalisées
        root.style.setProperty('--primary-color', this.config.couleurPrimaire);
        root.style.setProperty('--secondary-color', this.config.couleurSecondaire);
        
        // Appliquer le thème avec des classes CSS spécifiques
        document.body.className = document.body.className.replace(/\btheme-\w+/g, '');
        document.body.className = document.body.className.replace(/\bmode-sombre\b/g, '');
        document.body.className = document.body.className.replace(/\bno-animations\b/g, '');
        
        // Ajouter la classe du thème
        document.body.classList.add(`theme-${this.config.theme}`);
        
        // Mode sombre
        if (this.config.modeSombre) {
            document.body.classList.add('mode-sombre');
            // Forcer le dark mode de Bootstrap
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-bs-theme', 'light');
        }
        
        // Animations
        if (!this.config.animations) {
            document.body.classList.add('no-animations');
        }
        
        // Appliquer dynamiquement les couleurs aux éléments Bootstrap
        this.appliquerCouleursBootstrap();
        
        console.log('✅ Thème appliqué avec succès');
    } catch (error) {
        console.error('❌ Erreur application thème:', error);
    }
}

appliquerCouleursBootstrap() {
    try {
        // Créer un style dynamique pour les couleurs personnalisées
        let styleElement = document.getElementById('dynamic-theme-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'dynamic-theme-styles';
            document.head.appendChild(styleElement);
        }
        
        const styles = `
            .bg-primary { background-color: ${this.config.couleurPrimaire} !important; }
            .text-primary { color: ${this.config.couleurPrimaire} !important; }
            .btn-primary { 
                background-color: ${this.config.couleurPrimaire} !important;
                border-color: ${this.config.couleurPrimaire} !important;
            }
            .btn-primary:hover {
                background-color: ${this.assombrirCouleur(this.config.couleurPrimaire, 20)} !important;
                border-color: ${this.assombrirCouleur(this.config.couleurPrimaire, 20)} !important;
            }
            .btn-outline-primary {
                color: ${this.config.couleurPrimaire} !important;
                border-color: ${this.config.couleurPrimaire} !important;
            }
            .btn-outline-primary:hover {
                background-color: ${this.config.couleurPrimaire} !important;
                color: white !important;
            }
            .border-primary { border-color: ${this.config.couleurPrimaire} !important; }
            
            .bg-secondary { background-color: ${this.config.couleurSecondaire} !important; }
            .text-secondary { color: ${this.config.couleurSecondaire} !important; }
            .btn-secondary { 
                background-color: ${this.config.couleurSecondaire} !important;
                border-color: ${this.config.couleurSecondaire} !important;
            }
            .nav-link.active {
                background-color: ${this.config.couleurPrimaire} !important;
                color: white !important;
            }
        `;
        
        styleElement.textContent = styles;
        
    } catch (error) {
        console.error('❌ Erreur application couleurs Bootstrap:', error);
    }
}

assombrirCouleur(couleur, pourcentage) {
    // Fonction pour assombrir une couleur hexadécimale
    let R = parseInt(couleur.substring(1, 3), 16);
    let G = parseInt(couleur.substring(3, 5), 16);
    let B = parseInt(couleur.substring(5, 7), 16);

    R = parseInt(R * (100 - pourcentage) / 100);
    G = parseInt(G * (100 - pourcentage) / 100);
    B = parseInt(B * (100 - pourcentage) / 100);

    R = (R < 0) ? 0 : R;
    G = (G < 0) ? 0 : G;
    B = (B < 0) ? 0 : B;

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

    appliquerModules() {
        try {
            const modules = this.config.modules;
            console.log('📦 Application des modules:', modules);
            
            // Masquer les sections désactivées
            const sections = {
                'commandes': modules.commandes,
                'clients': modules.clients,
                'finances': modules.finances,
                'notifications': modules.notifications
            };
            
            Object.keys(sections).forEach(sectionId => {
                const navItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
                const section = document.getElementById(sectionId);
                
                if (navItem && section) {
                    if (sections[sectionId]) {
                        navItem.style.display = '';
                    } else {
                        navItem.style.display = 'none';
                        if (section.classList.contains('active')) {
                            // Rediriger vers le tableau de bord si la section active est désactivée
                            if (typeof showSection === 'function') {
                                showSection('tableau-bord');
                            }
                        }
                    }
                }
            });
            
            console.log('✅ Modules appliqués');
        } catch (error) {
            console.error('❌ Erreur application modules:', error);
        }
    }

    appliquerParametresSysteme() {
        try {
            console.log('⚙️ Application des paramètres système...');
            
            // Intervalle d'actualisation
            if (window.intervalActualisation) {
                clearInterval(window.intervalActualisation);
            }
            
            if (typeof actualiserDonnees === 'function') {
                window.intervalActualisation = setInterval(
                    actualiserDonnees, 
                    this.config.systeme.intervalActualisation * 1000
                );
                console.log(`🔄 Intervalle d'actualisation: ${this.config.systeme.intervalActualisation}s`);
            }

            // Délai de déconnexion automatique
            this.configurerDeconnexionAuto();
            
            console.log('✅ Paramètres système appliqués');
        } catch (error) {
            console.error('❌ Erreur application paramètres système:', error);
        }
    }

    configurerDeconnexionAuto() {
        try {
            let timeoutDeconnexion;
            
            const resetTimer = () => {
                clearTimeout(timeoutDeconnexion);
                if (this.config.systeme.delaiDeconnexion > 0) {
                    timeoutDeconnexion = setTimeout(() => {
                        if (confirm('Session inactive. Voulez-vous vous déconnecter ?')) {
                            if (typeof deconnexion === 'function') {
                                deconnexion();
                            }
                        }
                    }, this.config.systeme.delaiDeconnexion * 60 * 1000);
                }
            };
            
            // Réinitialiser le timer sur les événements utilisateur
            ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
                document.addEventListener(event, resetTimer, false);
            });
            
            resetTimer();
            console.log(`⏰ Déconnexion auto configurée: ${this.config.systeme.delaiDeconnexion}min`);
        } catch (error) {
            console.error('❌ Erreur configuration déconnexion auto:', error);
        }
    }

    mettreAJourInterface() {
        try {
            console.log('🔄 Mise à jour de l\'interface...');
            
            // Remplir les champs du formulaire seulement si la section existe
            if (document.getElementById('theme-principal')) {
                this.remplirFormulaire();
            }
            
            // Mettre à jour les indicateurs seulement si la section existe
            if (document.getElementById('version-app')) {
                this.mettreAJourIndicateurs();
            }
            
            console.log('✅ Interface mise à jour');
        } catch (error) {
            console.error('❌ Erreur mise à jour interface:', error);
        }
    }

    remplirFormulaire() {
        try {
            const setValue = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.value = value;
            };

            const setChecked = (id, checked) => {
                const element = document.getElementById(id);
                if (element) element.checked = checked;
            };

            // Interface
            setValue('theme-principal', this.config.theme);
            setValue('couleur-primaire', this.config.couleurPrimaire);
            setValue('couleur-secondaire', this.config.couleurSecondaire);
            setChecked('mode-sombre', this.config.modeSombre);
            setValue('type-navigation', this.config.typeNavigation);
            setValue('densite-affichage', this.config.densiteAffichage);
            setChecked('animations', this.config.animations);

            // Fonctionnalités
            setChecked('module-commandes', this.config.modules.commandes);
            setChecked('module-clients', this.config.modules.clients);
            setChecked('module-finances', this.config.modules.finances);
            setChecked('module-notifications', this.config.modules.notifications);
            setChecked('module-export', this.config.modules.export);
            setChecked('module-statistiques', this.config.modules.statistiques);

            // Notifications
            setChecked('notif-son', this.config.notifications.son);
            setChecked('notif-browser', this.config.notifications.browser);
            setValue('duree-notifications', this.config.notifications.duree);
            setValue('interval-verif', this.config.notifications.intervalVerif);
            setChecked('rappel-devis', this.config.notifications.rappelDevis);
            setChecked('rappel-paiement', this.config.notifications.rappelPaiement);

            // Export/Import
            setValue('format-export', this.config.export.format);
            setChecked('export-commandes', this.config.export.inclureCommandes);
            setChecked('export-clients', this.config.export.inclureClients);

            // Système
            setValue('interval-actualisation', this.config.systeme.intervalActualisation);
            setChecked('cache-actif', this.config.systeme.cacheActif);
            setChecked('compression', this.config.systeme.compression);
            setValue('delai-deconnexion', this.config.systeme.delaiDeconnexion);
            setChecked('verif-integrite', this.config.systeme.verifIntegrite);
            setChecked('sauvegarde-auto', this.config.systeme.sauvegardeAuto);

            console.log('✅ Formulaire rempli');
        } catch (error) {
            console.error('❌ Erreur remplissage formulaire:', error);
        }
    }

    mettreAJourIndicateurs() {
        try {
            const setText = (id, text) => {
                const element = document.getElementById(id);
                if (element) element.textContent = text;
            };

            setText('version-app', this.config.meta.version);
            setText('derniere-sauvegarde', 
                this.config.meta.derniereSauvegarde ? 
                new Date(this.config.meta.derniereSauvegarde).toLocaleString('fr-FR') : 
                'Jamais'
            );
            
            setText('espace-utilise', this.formatTaille(this.calculerEspaceUtilise()));
            setText('total-commandes', this.compterCommandes());
            setText('total-clients', this.compterClientsUniques());
            setText('total-notifications', this.compterNotifications());

            console.log('✅ Indicateurs mis à jour');
        } catch (error) {
            console.error('❌ Erreur mise à jour indicateurs:', error);
        }
    }

    compterCommandes() {
        try {
            if (typeof dataManager !== 'undefined' && dataManager !== null) {
                const commandes = dataManager.getCommandes();
                const count = Array.isArray(commandes) ? commandes.length : 0;
                console.log(`📊 Commandes comptées: ${count}`);
                return count;
            }
            
            console.log('ℹ️ dataManager non disponible, fallback localStorage');
            try {
                const commandes = localStorage.getItem('msn_commandes');
                return commandes ? JSON.parse(commandes).length : 0;
            } catch (e) {
                return 0;
            }
        } catch (error) {
            console.error('❌ Erreur comptage commandes:', error);
            return 0;
        }
    }

    compterClientsUniques() {
        try {
            let commandes = [];
            
            if (typeof dataManager !== 'undefined' && dataManager !== null) {
                commandes = dataManager.getCommandes();
            } else {
                const commandesSauvegardees = localStorage.getItem('msn_commandes');
                commandes = commandesSauvegardees ? JSON.parse(commandesSauvegardees) : [];
            }
            
            if (!Array.isArray(commandes)) {
                return 0;
            }
            
            const clientsUniques = new Set();
            commandes.forEach(commande => {
                if (commande && commande.client) {
                    clientsUniques.add(commande.client.trim().toLowerCase());
                }
            });
            
            const count = clientsUniques.size;
            console.log(`👥 Clients uniques comptés: ${count}`);
            return count;
        } catch (error) {
            console.error('❌ Erreur comptage clients:', error);
            return 0;
        }
    }

    compterNotifications() {
        try {
            if (typeof dataManager !== 'undefined' && dataManager !== null) {
                if (typeof dataManager.getNotifications === 'function') {
                    const notifications = dataManager.getNotifications();
                    const count = Array.isArray(notifications) ? notifications.length : 0;
                    console.log(`🔔 Notifications comptées: ${count}`);
                    return count;
                }
            }
            
            const notificationsSauvegardees = localStorage.getItem('msn_notifications');
            if (notificationsSauvegardees) {
                try {
                    const notifications = JSON.parse(notificationsSauvegardees);
                    return Array.isArray(notifications) ? notifications.length : 0;
                } catch (e) {
                    return 0;
                }
            }
            
            return 0;
        } catch (error) {
            console.error('❌ Erreur comptage notifications:', error);
            return 0;
        }
    }

    calculerEspaceUtilise() {
        try {
            let tailleTotale = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const valeur = localStorage[key];
                    if (typeof valeur === 'string') {
                        tailleTotale += valeur.length * 2;
                    }
                }
            }
            return tailleTotale;
        } catch (error) {
            console.error('❌ Erreur calcul espace:', error);
            return 0;
        }
    }

    formatTaille(octets) {
        const units = ['o', 'Ko', 'Mo', 'Go'];
        let taille = octets;
        let unitIndex = 0;
        
        while (taille >= 1024 && unitIndex < units.length - 1) {
            taille /= 1024;
            unitIndex++;
        }
        
        return `${taille.toFixed(1)} ${units[unitIndex]}`;
    }

    exporterConfiguration() {
        const configExport = {
            ...this.config,
            meta: {
                ...this.config.meta,
                dateExport: new Date().toISOString()
            }
        };
        
        const blob = new Blob([JSON.stringify(configExport, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `msn-configuration-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importerConfiguration(fichier) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const configImport = JSON.parse(e.target.result);
                    
                    if (!configImport.theme || !configImport.modules) {
                        throw new Error('Format de configuration invalide');
                    }
                    
                    this.config = { ...this.getConfigurationDefaut(), ...configImport };
                    this.sauvegarderConfiguration();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsText(fichier);
        });
    }

    reinitialiserConfiguration() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les configurations ?')) {
            this.config = this.getConfigurationDefaut();
            this.sauvegarderConfiguration();
            return true;
        }
        return false;
    }
}
// ===== FONCTIONS GLOBALES POUR L'INTERFACE =====
// ===== FONCTIONS GLOBALES POUR L'INTERFACE =====

// Instance globale
let configManager = null;

// Fonction pour sauvegarder la configuration - VERSION CORRIGÉE
function sauvegarderConfiguration() {
    try {
        // VÉRIFIER SI configManager EST DISPONIBLE
        if (!configManager) {
            console.error('❌ configManager non initialisé');
            
            // Tentative de récupération de l'instance globale
            if (window.configManager) {
                configManager = window.configManager;
            } else {
                // Créer une instance d'urgence
                console.warn('🔄 Création d\'urgence de ConfigurationManager');
                configManager = new ConfigurationManager();
            }
        }

        // VÉRIFIER SI configManager EST TOUJOURS VALIDE
        if (!configManager || typeof configManager.sauvegarderConfiguration !== 'function') {
            throw new Error('ConfigurationManager non disponible');
        }

        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };

        const getChecked = (id) => {
            const element = document.getElementById(id);
            return element ? element.checked : false;
        };

        // Récupérer les valeurs du formulaire
        const nouvelleConfig = {
            theme: getValue('theme-principal'),
            couleurPrimaire: getValue('couleur-primaire'),
            couleurSecondaire: getValue('couleur-secondaire'),
            modeSombre: getChecked('mode-sombre'),
            typeNavigation: getValue('type-navigation'),
            densiteAffichage: getValue('densite-affichage'),
            animations: getChecked('animations'),
            
            modules: {
                commandes: getChecked('module-commandes'),
                clients: getChecked('module-clients'),
                finances: getChecked('module-finances'),
                notifications: getChecked('module-notifications'),
                export: getChecked('module-export'),
                statistiques: getChecked('module-statistiques')
            },
            
            notifications: {
                son: getChecked('notif-son'),
                browser: getChecked('notif-browser'),
                duree: parseInt(getValue('duree-notifications')) || 5,
                intervalVerif: parseInt(getValue('interval-verif')) || 30,
                rappelDevis: getChecked('rappel-devis'),
                rappelPaiement: getChecked('rappel-paiement')
            },
            
            export: {
                format: getValue('format-export'),
                inclureCommandes: getChecked('export-commandes'),
                inclureClients: getChecked('export-clients')
            },
            
            systeme: {
                intervalActualisation: parseInt(getValue('interval-actualisation')) || 30,
                cacheActif: getChecked('cache-actif'),
                compression: getChecked('compression'),
                delaiDeconnexion: parseInt(getValue('delai-deconnexion')) || 60,
                verifIntegrite: getChecked('verif-integrite'),
                sauvegardeAuto: getChecked('sauvegarde-auto')
            }
        };
        
        // Utiliser la méthode de l'instance
        if (configManager.sauvegarderConfiguration(nouvelleConfig)) {
            showNotification('Configuration sauvegardée avec succès', 'success');
            return true;
        } else {
            showNotification('Erreur lors de la sauvegarde', 'error');
            return false;
        }
        
    } catch (error) {
        console.error('💥 Erreur critique dans sauvegarderConfiguration:', error);
        showNotification('Erreur critique: ' + error.message, 'error');
        return false;
    }
}

// Fonction pour réinitialiser la configuration - VERSION CORRIGÉE
function reinitialiserConfiguration() {
    try {
        if (!configManager) {
            console.warn('🔄 ConfigurationManager non initialisé, création...');
            configManager = new ConfigurationManager();
        }
        
        if (configManager.reinitialiserConfiguration()) {
            showNotification('Configuration réinitialisée', 'success');
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Erreur réinitialisation:', error);
        showNotification('Erreur lors de la réinitialisation', 'error');
        return false;
    }
}

// Fonction de sauvegarde simple (fallback)
function sauvegarderConfigurationSimple() {
    try {
        const configBasique = {
            theme: 'bleu',
            derniereSauvegarde: new Date().toISOString()
        };
        localStorage.setItem('msn_configuration_simple', JSON.stringify(configBasique));
        showNotification('Sauvegarde simple effectuée', 'success');
        return true;
    } catch (error) {
        console.error('❌ Erreur sauvegarde simple:', error);
        showNotification('Erreur sauvegarde simple', 'error');
        return false;
    }
}

// Initialisation SÉCURISÉE
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🚀 Début initialisation ConfigurationManager...');
        
        // Vérifier si la classe existe
        if (typeof ConfigurationManager === 'undefined') {
            throw new Error('Classe ConfigurationManager non définie');
        }
        
        // Créer l'instance
        configManager = new ConfigurationManager();
        
        // Exposer globalement
        window.configManager = configManager;
        
        console.log('🎉 ConfigurationManager initialisé avec succès');
        
    } catch (error) {
        console.error('💥 Erreur initialisation ConfigurationManager:', error);
        
        // Fallback minimal
        configManager = {
            config: {
                meta: { 
                    version: '1.0.0',
                    derniereSauvegarde: null
                }
            },
            mettreAJourIndicateurs: function() {
                console.log('🔄 Mise à jour indicateurs (fallback)');
            },
            sauvegarderConfiguration: function() {
                console.log('💾 Sauvegarde (fallback)');
                return true;
            }
        };
        
        window.configManager = configManager;
        showNotification('ConfigurationManager en mode fallback', 'warning');
    }
});

// ===== EXPOSITION DES FONCTIONS GLOBALES =====

// Exposer les fonctions avec fallback
window.sauvegarderConfiguration = sauvegarderConfiguration;
window.reinitialiserConfiguration = reinitialiserConfiguration;
window.sauvegarderConfigurationSimple = sauvegarderConfigurationSimple;

// Exposer configManager globalement
window.configManager = configManager;

// Fonction pour exporter les données
function exporterDonnees() {
    if (configManager) {
        configManager.exporterConfiguration();
        showNotification('Configuration exportée', 'success');
    }
}

// Fonction pour importer les données
function importerDonnees() {
    const fichierInput = document.getElementById('fichier-import');
    const fichier = fichierInput.files[0];
    
    if (!fichier) {
        showNotification('Veuillez sélectionner un fichier', 'warning');
        return;
    }
    
    if (configManager) {
        configManager.importerConfiguration(fichier)
            .then(() => {
                showNotification('Configuration importée avec succès', 'success');
                fichierInput.value = '';
            })
            .catch(error => {
                showNotification('Erreur lors de l\'import: ' + error.message, 'error');
            });
    }
}

// Fonction pour vider le cache
function viderCache() {
    if (confirm('Vider le cache local ? Les données non sauvegardées seront perdues.')) {
        // Sauvegarder les données essentielles
        const commandes = localStorage.getItem('msn_commandes');
        const clients = localStorage.getItem('msn_clients');
        const configuration = localStorage.getItem('msn_configuration');
        const services = localStorage.getItem('msn_services');
        const notifications = localStorage.getItem('msn_notifications');
        
        // Vider tout
        localStorage.clear();
        
        // Restaurer les données essentielles
        if (commandes) localStorage.setItem('msn_commandes', commandes);
        if (clients) localStorage.setItem('msn_clients', clients);
        if (configuration) localStorage.setItem('msn_configuration', configuration);
        if (services) localStorage.setItem('msn_services', services);
        if (notifications) localStorage.setItem('msn_notifications', notifications);
        
        showNotification('Cache vidé avec succès', 'success');
        setTimeout(() => location.reload(), 1000);
    }
}

// Fonction pour réparer la base de données
function reparerBase() {
    showNotification('Fonction de réparation de la base en développement', 'info');
    
    // Implémentation basique de réparation
    try {
        // Vérifier et réparer les commandes
        const commandes = localStorage.getItem('msn_commandes');
        if (commandes) {
            try {
                JSON.parse(commandes);
            } catch (e) {
                localStorage.removeItem('msn_commandes');
                showNotification('Commandes corrompues - réinitialisées', 'warning');
            }
        }
        
        // Vérifier et réparer les services
        if (typeof servicesManager !== 'undefined') {
            const resultat = servicesManager.reparerDonnees();
            if (resultat.reparation) {
                showNotification('Services réparés: ' + resultat.message, 'success');
            }
        }
        
        showNotification('Vérification de la base terminée', 'success');
    } catch (error) {
        showNotification('Erreur lors de la réparation: ' + error.message, 'error');
    }
}

// Fonction pour générer un rapport système
function genererRapport() {
    try {
        // Récupérer les données
        const commandes = dataManager ? dataManager.getCommandes() : [];
        const clients = dataManager ? Array.from(new Set(commandes.map(c => c.client))).length : 0;
        const services = servicesManager ? servicesManager.getStatistiques() : { total: 0 };
        const configuration = configManager ? configManager.config : {};
        
        // Créer le rapport
        const rapport = `
RAPPORT SYSTÈME MSN - ${new Date().toLocaleString('fr-FR')}

GÉNÉRAL:
- Commandes totales: ${commandes.length}
- Clients uniques: ${clients}
- Services disponibles: ${services.total}

DERNIÈRES COMMANDES:
${commandes.slice(-5).map(c => `- ${c.reference}: ${c.client} (${c.total})`).join('\n')}

CONFIGURATION:
- Thème: ${configuration.theme || 'défaut'}
- Version: ${configuration.meta?.version || '1.0.0'}
- Dernière sauvegarde: ${configuration.meta?.derniereSauvegarde ? 
    new Date(configuration.meta.derniereSauvegarde).toLocaleString('fr-FR') : 'Jamais'}

ESPACE STOCKAGE:
- Utilisé: ${configManager ? configManager.formatTaille(configManager.calculerEspaceUtilise()) : 'N/A'}

GÉNÉRÉ LE: ${new Date().toLocaleString('fr-FR')}
        `.trim();
        
        // Créer et télécharger le fichier
        const blob = new Blob([rapport], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-systeme-msn-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Rapport généré avec succès', 'success');
    } catch (error) {
        showNotification('Erreur génération rapport: ' + error.message, 'error');
    }
}

// ===== FONCTIONS DE TEST DES THÈMES =====

/**
 * Teste un thème spécifique en l'appliquant temporairement
 */
function testerTheme(nomTheme) {
    try {
        console.log(`🎨 Test du thème: ${nomTheme}`);
        
        // Définir les couleurs selon le thème
        let couleurPrimaire, couleurSecondaire;
        
        switch(nomTheme) {
            case 'bleu':
                couleurPrimaire = '#2c3e50';
                couleurSecondaire = '#3498db';
                break;
            case 'vert':
                couleurPrimaire = '#27ae60';
                couleurSecondaire = '#2ecc71';
                break;
            case 'orange':
                couleurPrimaire = '#d35400';
                couleurSecondaire = '#e67e22';
                break;
            case 'violet':
                couleurPrimaire = '#8e44ad';
                couleurSecondaire = '#9b59b6';
                break;
            default:
                couleurPrimaire = '#2c3e50';
                couleurSecondaire = '#3498db';
        }
        
        // Appliquer le thème temporairement
        appliquerThemeTemporaire(nomTheme, couleurPrimaire, couleurSecondaire);
        
        // Mettre à jour les indicateurs visuels
        highlightBoutonActif(nomTheme);
        
        showNotification(`Thème ${nomTheme} appliqué temporairement`, 'success');
        
    } catch (error) {
        console.error('❌ Erreur test thème:', error);
        showNotification('Erreur application thème', 'error');
    }
}

/**
 * Applique un thème temporairement sans sauvegarder
 */
function appliquerThemeTemporaire(theme, primaire, secondaire) {
    try {
        const root = document.documentElement;
        
        // Appliquer les couleurs CSS
        root.style.setProperty('--bs-primary', primaire);
        root.style.setProperty('--bs-secondary', secondaire);
        root.style.setProperty('--primary-color', primaire);
        root.style.setProperty('--secondary-color', secondaire);
        
        // Mettre à jour les styles dynamiques Bootstrap
        let styleElement = document.getElementById('dynamic-theme-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'dynamic-theme-styles';
            document.head.appendChild(styleElement);
        }
        
        const styles = `
            .bg-primary { background-color: ${primaire} !important; }
            .text-primary { color: ${primaire} !important; }
            .btn-primary { 
                background-color: ${primaire} !important;
                border-color: ${primaire} !important;
            }
            .btn-primary:hover {
                background-color: ${assombrirCouleur(primaire, 20)} !important;
                border-color: ${assombrirCouleur(primaire, 20)} !important;
            }
            .btn-outline-primary {
                color: ${primaire} !important;
                border-color: ${primaire} !important;
            }
            .btn-outline-primary:hover {
                background-color: ${primaire} !important;
                color: white !important;
            }
            .border-primary { border-color: ${primaire} !important; }
            
            .bg-secondary { background-color: ${secondaire} !important; }
            .text-secondary { color: ${secondaire} !important; }
            .btn-secondary { 
                background-color: ${secondaire} !important;
                border-color: ${secondaire} !important;
            }
            .nav-link.active {
                background-color: ${primaire} !important;
                color: white !important;
            }
            
            /* Highlight pour le bouton actif */
            .theme-btn-active {
                transform: scale(1.05);
                box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3), 0 0 10px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
            }
        `;
        
        styleElement.textContent = styles;
        
        // Mettre à jour les classes de thème
        document.body.className = document.body.className.replace(/\btheme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
        
        console.log(`✅ Thème temporaire appliqué: ${theme}`);
        
    } catch (error) {
        console.error('❌ Erreur application thème temporaire:', error);
    }
}

/**
 * Bascule entre le mode sombre et clair
 */
function testerModeSombre() {
    try {
        const body = document.body;
        const estModeSombre = body.classList.contains('mode-sombre');
        
        if (estModeSombre) {
            // Passer en mode clair
            body.classList.remove('mode-sombre');
            document.documentElement.setAttribute('data-bs-theme', 'light');
            showNotification('Mode clair activé', 'success');
        } else {
            // Passer en mode sombre
            body.classList.add('mode-sombre');
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            showNotification('Mode sombre activé', 'success');
        }
        
        // Mettre à jour le bouton
        const boutonMode = document.querySelector('[onclick="testerModeSombre()"]');
        if (boutonMode) {
            if (estModeSombre) {
                boutonMode.textContent = 'Basculer Mode Sombre';
                boutonMode.classList.remove('btn-light');
                boutonMode.classList.add('btn-dark');
            } else {
                boutonMode.textContent = 'Basculer Mode Clair';
                boutonMode.classList.remove('btn-dark');
                boutonMode.classList.add('btn-light');
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur bascule mode sombre:', error);
        showNotification('Erreur bascule mode', 'error');
    }
}

/**
 * Met en évidence le bouton de thème actif
 */
function highlightBoutonActif(themeActif) {
    try {
        // Retirer la classe active de tous les boutons
        const boutonsTheme = document.querySelectorAll('[onclick^="testerTheme"]');
        boutonsTheme.forEach(bouton => {
            bouton.classList.remove('theme-btn-active');
            bouton.classList.remove('btn-primary', 'btn-success', 'btn-warning');
            
            // Réappliquer les classes de base selon le thème
            const theme = bouton.getAttribute('onclick').match(/'([^']+)'/)[1];
            switch(theme) {
                case 'bleu':
                    bouton.classList.add('btn-primary');
                    break;
                case 'vert':
                    bouton.classList.add('btn-success');
                    break;
                case 'orange':
                    bouton.classList.add('btn-warning');
                    break;
                case 'violet':
                    bouton.style.backgroundColor = '#8e44ad';
                    bouton.style.color = 'white';
                    break;
            }
        });
        
        // Ajouter la classe active au bouton actif
        const boutonActif = document.querySelector(`[onclick="testerTheme('${themeActif}')"]`);
        if (boutonActif) {
            boutonActif.classList.add('theme-btn-active');
        }
        
    } catch (error) {
        console.error('❌ Erreur highlight bouton:', error);
    }
}

/**
 * Fonction utilitaire pour assombrir une couleur (identique à celle dans ConfigurationManager)
 */
function assombrirCouleur(couleur, pourcentage) {
    let R = parseInt(couleur.substring(1, 3), 16);
    let G = parseInt(couleur.substring(3, 5), 16);
    let B = parseInt(couleur.substring(5, 7), 16);

    R = parseInt(R * (100 - pourcentage) / 100);
    G = parseInt(G * (100 - pourcentage) / 100);
    B = parseInt(B * (100 - pourcentage) / 100);

    R = (R < 0) ? 0 : R;
    G = (G < 0) ? 0 : G;
    B = (B < 0) ? 0 : B;

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

/**
 * Réinitialise les thèmes de test et revient à la configuration sauvegardée
 */
function reinitialiserTestTheme() {
    try {
        if (configManager && configManager.appliquerConfiguration) {
            configManager.appliquerConfiguration();
            showNotification('Configuration restaurée', 'success');
            
            // Réinitialiser les boutons
            const boutonsTheme = document.querySelectorAll('[onclick^="testerTheme"]');
            boutonsTheme.forEach(bouton => {
                bouton.classList.remove('theme-btn-active');
            });
            
            // Réinitialiser le bouton mode sombre
            const boutonMode = document.querySelector('[onclick="testerModeSombre()"]');
            if (boutonMode && configManager.config.modeSombre) {
                boutonMode.textContent = 'Basculer Mode Clair';
                boutonMode.classList.remove('btn-dark');
                boutonMode.classList.add('btn-light');
            } else if (boutonMode) {
                boutonMode.textContent = 'Basculer Mode Sombre';
                boutonMode.classList.remove('btn-light');
                boutonMode.classList.add('btn-dark');
            }
        }
    } catch (error) {
        console.error('❌ Erreur réinitialisation thème:', error);
        showNotification('Erreur réinitialisation', 'error');
    }
}
// ===== GESTION DES THÈMES ET COULEURS =====

/**
 * Initialise les écouteurs d'événements pour la section thèmes et couleurs
 */
/**
 * Initialise les écouteurs d'événements pour la section thèmes et couleurs
 */
function initialiserGestionThemes() {
    try {
        console.log('🎨 Initialisation gestion des thèmes...');
        
        // Attendre que le DOM soit complètement chargé
        setTimeout(() => {
            // Écouteurs pour les sélecteurs de thème
            const selectTheme = document.getElementById('theme-principal');
            if (selectTheme) {
                selectTheme.addEventListener('change', gererChangementTheme);
                console.log('✅ Écouteur thème principal ajouté');
            } else {
                console.warn('❌ Select theme-principal non trouvé');
            }
            
            // Écouteurs pour les sélecteurs de couleur
            const couleurPrimaire = document.getElementById('couleur-primaire');
            const couleurSecondaire = document.getElementById('couleur-secondaire');
            
            if (couleurPrimaire) {
                couleurPrimaire.addEventListener('change', gererChangementCouleur);
                console.log('✅ Écouteur couleur primaire ajouté');
            } else {
                console.warn('❌ Input couleur-primaire non trouvé');
            }
            
            if (couleurSecondaire) {
                couleurSecondaire.addEventListener('change', gererChangementCouleur);
                console.log('✅ Écouteur couleur secondaire ajouté');
            } else {
                console.warn('❌ Input couleur-secondaire non trouvé');
            }
            
            // Écouteur pour le mode sombre
            const modeSombre = document.getElementById('mode-sombre');
            if (modeSombre) {
                modeSombre.addEventListener('change', gererChangementModeSombre);
                console.log('✅ Écouteur mode sombre ajouté');
            } else {
                console.warn('❌ Checkbox mode-sombre non trouvée');
            }
            
            // Prévisualisation en temps réel
            initialiserPrevisualisationThemes();
            
            // Charger les valeurs actuelles depuis configManager si disponible
            chargerValeursActuelles();
            
            console.log('✅ Gestion des thèmes initialisée');
        }, 100);
        
    } catch (error) {
        console.error('❌ Erreur initialisation gestion thèmes:', error);
    }
}

/**
 * Charge les valeurs actuelles depuis configManager
 */
function chargerValeursActuelles() {
    try {
        if (!configManager || !configManager.config) {
            console.warn('⚠️ configManager non disponible pour charger les valeurs');
            return;
        }
        
        const config = configManager.config;
        
        // Mettre à jour les champs avec les valeurs actuelles
        const selectTheme = document.getElementById('theme-principal');
        const couleurPrimaire = document.getElementById('couleur-primaire');
        const couleurSecondaire = document.getElementById('couleur-secondaire');
        const modeSombre = document.getElementById('mode-sombre');
        
        if (selectTheme && config.theme) {
            selectTheme.value = config.theme;
        }
        
        if (couleurPrimaire && config.couleurPrimaire) {
            couleurPrimaire.value = config.couleurPrimaire;
        }
        
        if (couleurSecondaire && config.couleurSecondaire) {
            couleurSecondaire.value = config.couleurSecondaire;
        }
        
        if (modeSombre && typeof config.modeSombre === 'boolean') {
            modeSombre.checked = config.modeSombre;
        }
        
        console.log('✅ Valeurs actuelles chargées depuis configManager');
        
    } catch (error) {
        console.error('❌ Erreur chargement valeurs actuelles:', error);
    }
}

/**
 * Gère le changement de thème principal
 */
function gererChangementTheme(event) {
    try {
        const themeSelectionne = event.target.value;
        console.log(`🎨 Changement de thème: ${themeSelectionne}`);
        
        // Définir les couleurs selon le thème sélectionné
        let couleurs = obtenirCouleursParTheme(themeSelectionne);
        
        // Mettre à jour les sélecteurs de couleur
        mettreAJourSelecteursCouleur(couleurs.primaires, couleurs.secondaires);
        
        // Appliquer le thème temporairement
        appliquerThemeTemporaire(themeSelectionne, couleurs.primaires, couleurs.secondaires);
        
        // Mettre à jour le mode sombre si nécessaire
        if (themeSelectionne === 'sombre') {
            document.getElementById('mode-sombre').checked = true;
            gererChangementModeSombre();
        }
        
        showNotification(`Thème ${themeSelectionne} appliqué`, 'success');
        
    } catch (error) {
        console.error('❌ Erreur changement thème:', error);
        showNotification('Erreur application thème', 'error');
    }
}

/**
 * Retourne les couleurs correspondant à un thème
 */
function obtenirCouleursParTheme(theme) {
    const themes = {
        'bleu': {
            primaires: '#2c3e50',
            secondaires: '#3498db',
            nom: 'Bleu Professionnel'
        },
        'vert': {
            primaires: '#27ae60',
            secondaires: '#2ecc71',
            nom: 'Vert Nature'
        },
        'orange': {
            primaires: '#d35400',
            secondaires: '#e67e22',
            nom: 'Orange Énergique'
        },
        'violet': {
            primaires: '#8e44ad',
            secondaires: '#9b59b6',
            nom: 'Violet Créatif'
        },
        'sombre': {
            primaires: '#34495e',
            secondaires: '#95a5a6',
            nom: 'Mode Sombre'
        }
    };
    
    return themes[theme] || themes['bleu'];
}

/**
 * Met à jour les sélecteurs de couleur avec les nouvelles valeurs
 */
function mettreAJourSelecteursCouleur(primaire, secondaire) {
    try {
        const inputPrimaire = document.getElementById('couleur-primaire');
        const inputSecondaire = document.getElementById('couleur-secondaire');
        
        if (inputPrimaire) inputPrimaire.value = primaire;
        if (inputSecondaire) inputSecondaire.value = secondaire;
        
        console.log(`🔄 Couleurs mises à jour: primaire=${primaire}, secondaire=${secondaire}`);
    } catch (error) {
        console.error('❌ Erreur mise à jour sélecteurs couleur:', error);
    }
}

/**
 * Gère le changement des couleurs personnalisées
 */
function gererChangementCouleur(event) {
    try {
        const couleurId = event.target.id;
        const nouvelleCouleur = event.target.value;
        
        console.log(`🎨 Changement couleur ${couleurId}: ${nouvelleCouleur}`);
        
        // Mettre à jour le thème en cours avec les couleurs personnalisées
        const primaire = document.getElementById('couleur-primaire').value;
        const secondaire = document.getElementById('couleur-secondaire').value;
        const themeActuel = document.getElementById('theme-principal').value;
        
        // Changer le thème en "personnalisé" si ce n'est pas déjà le cas
        if (themeActuel !== 'personnalise') {
            document.getElementById('theme-principal').value = 'personnalise';
            // Ajouter l'option personnalisée si elle n'existe pas
            ajouterOptionPersonnalisee();
        }
        
        // Appliquer les couleurs personnalisées
        appliquerCouleursPersonnalisees(primaire, secondaire);
        
        showNotification('Couleurs personnalisées appliquées', 'success');
        
    } catch (error) {
        console.error('❌ Erreur changement couleur:', error);
        showNotification('Erreur application couleur', 'error');
    }
}

/**
 * Ajoute l'option de thème personnalisé au sélecteur
 */
function ajouterOptionPersonnalisee() {
    try {
        const selectTheme = document.getElementById('theme-principal');
        const optionExistante = selectTheme.querySelector('option[value="personnalise"]');
        
        if (!optionExistante) {
            const option = document.createElement('option');
            option.value = 'personnalise';
            option.textContent = 'Personnalisé';
            selectTheme.appendChild(option);
        }
        
        selectTheme.value = 'personnalise';
        
    } catch (error) {
        console.error('❌ Erreur ajout option personnalisée:', error);
    }
}

/**
 * Applique des couleurs personnalisées
 */
function appliquerCouleursPersonnalisees(primaire, secondaire) {
    try {
        const root = document.documentElement;
        
        // Appliquer les couleurs CSS
        root.style.setProperty('--bs-primary', primaire);
        root.style.setProperty('--bs-secondary', secondaire);
        root.style.setProperty('--primary-color', primaire);
        root.style.setProperty('--secondary-color', secondaire);
        
        // Mettre à jour les styles dynamiques Bootstrap
        mettreAJourStylesCouleurs(primaire, secondaire);
        
        console.log(`✅ Couleurs personnalisées appliquées: ${primaire}, ${secondaire}`);
        
    } catch (error) {
        console.error('❌ Erreur application couleurs personnalisées:', error);
    }
}

/**
 * Gère le changement du mode sombre
 */
function gererChangementModeSombre() {
    try {
        const modeSombreCheckbox = document.getElementById('mode-sombre');
        const estModeSombre = modeSombreCheckbox.checked;
        
        console.log(`🌙 Changement mode sombre: ${estModeSombre}`);
        
        // Appliquer le mode sombre
        if (estModeSombre) {
            document.body.classList.add('mode-sombre');
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        } else {
            document.body.classList.remove('mode-sombre');
            document.documentElement.setAttribute('data-bs-theme', 'light');
        }
        
        showNotification(`Mode sombre ${estModeSombre ? 'activé' : 'désactivé'}`, 'success');
        
    } catch (error) {
        console.error('❌ Erreur changement mode sombre:', error);
        showNotification('Erreur changement mode sombre', 'error');
    }
}

/**
 * Initialise la prévisualisation des thèmes
 */
function initialiserPrevisualisationThemes() {
    try {
        // Créer un conteneur de prévisualisation si il n'existe pas
        let previewContainer = document.getElementById('theme-preview-container');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'theme-preview-container';
            previewContainer.className = 'mt-3 p-3 border rounded';
            previewContainer.innerHTML = `
                <h6 class="mb-2">Aperçu du thème</h6>
                <div class="d-flex gap-2 flex-wrap" id="theme-preview-elements">
                    <button class="btn btn-primary btn-sm">Bouton Primaire</button>
                    <button class="btn btn-secondary btn-sm">Bouton Secondaire</button>
                    <span class="badge bg-primary">Badge</span>
                    <div class="text-primary">Texte primaire</div>
                    <div class="text-secondary">Texte secondaire</div>
                </div>
            `;
            
            // Insérer après la section thèmes
            const themeSection = document.querySelector('.card-header:has(h5:contains("Thèmes et Couleurs"))').closest('.card-body');
            if (themeSection) {
                themeSection.appendChild(previewContainer);
            }
        }
        
        console.log('✅ Prévisualisation thèmes initialisée');
    } catch (error) {
        console.error('❌ Erreur initialisation prévisualisation:', error);
    }
}

/**
 * Met à jour les styles de couleur dynamiques
 */
function mettreAJourStylesCouleurs(primaire, secondaire) {
    try {
        let styleElement = document.getElementById('dynamic-theme-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'dynamic-theme-styles';
            document.head.appendChild(styleElement);
        }
        
        const styles = `
            .bg-primary { background-color: ${primaire} !important; }
            .text-primary { color: ${primaire} !important; }
            .btn-primary { 
                background-color: ${primaire} !important;
                border-color: ${primaire} !important;
            }
            .btn-primary:hover {
                background-color: ${assombrirCouleur(primaire, 20)} !important;
                border-color: ${assombrirCouleur(primaire, 20)} !important;
            }
            .btn-outline-primary {
                color: ${primaire} !important;
                border-color: ${primaire} !important;
            }
            .btn-outline-primary:hover {
                background-color: ${primaire} !important;
                color: white !important;
            }
            .border-primary { border-color: ${primaire} !important; }
            
            .bg-secondary { background-color: ${secondaire} !important; }
            .text-secondary { color: ${secondaire} !important; }
            .btn-secondary { 
                background-color: ${secondaire} !important;
                border-color: ${secondaire} !important;
            }
            .btn-secondary:hover {
                background-color: ${assombrirCouleur(secondaire, 20)} !important;
                border-color: ${assombrirCouleur(secondaire, 20)} !important;
            }
            .nav-link.active {
                background-color: ${primaire} !important;
                color: white !important;
            }
            
            /* Styles pour la prévisualisation */
            #theme-preview-container {
                border-color: ${secondaire} !important;
            }
        `;
        
        styleElement.textContent = styles;
        
    } catch (error) {
        console.error('❌ Erreur mise à jour styles couleurs:', error);
    }
}

/**
 * Réinitialise les thèmes aux valeurs par défaut
 */
function reinitialiserThemes() {
    try {
        // Réinitialiser les sélecteurs
        document.getElementById('theme-principal').value = 'bleu';
        document.getElementById('couleur-primaire').value = '#2c3e50';
        document.getElementById('couleur-secondaire').value = '#3498db';
        document.getElementById('mode-sombre').checked = true;
        
        // Réappliquer le thème par défaut
        gererChangementTheme({ target: document.getElementById('theme-principal') });
        gererChangementModeSombre();
        
        showNotification('Thèmes réinitialisés aux valeurs par défaut', 'success');
        
    } catch (error) {
        console.error('❌ Erreur réinitialisation thèmes:', error);
        showNotification('Erreur réinitialisation thèmes', 'error');
    }
}

// ===== INITIALISATION AMÉLIORÉE =====

document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🚀 Début initialisation ConfigurationManager...');
        
        // Vérifier si la classe existe
        if (typeof ConfigurationManager === 'undefined') {
            throw new Error('Classe ConfigurationManager non définie');
        }
        
        // Créer l'instance
        configManager = new ConfigurationManager();
        
        // Exposer globalement
        window.configManager = configManager;
        
        // Initialiser la gestion des thèmes de manière différée
        initialiserGestionThemesDifferee();
        
        console.log('🎉 ConfigurationManager initialisé avec succès');
        
    } catch (error) {
        console.error('💥 Erreur initialisation ConfigurationManager:', error);
        
        // Fallback robuste
        configManager = creerFallbackConfiguration();
        window.configManager = configManager;
        
        showNotification('ConfigurationManager en mode sécurisé', 'warning');
    }
});

/**
 * Initialise la gestion des thèmes de manière différée et sécurisée
 */
function initialiserGestionThemesDifferee() {
    let tentatives = 0;
    const maxTentatives = 10;
    
    const essayerInitialisation = () => {
        tentatives++;
        console.log(`🔄 Tentative d'initialisation thèmes ${tentatives}/${maxTentatives}...`);
        
        // Vérifier si les éléments de thème existent
        if (verifierElementsThemes()) {
            console.log('✅ Tous les éléments de thème sont présents, initialisation...');
            initialiserGestionThemes();
            chargerValeursActuelles();
            console.log('🎉 Gestion des thèmes initialisée avec succès');
            return;
        }
        
        // Si pas tous trouvés et qu'on peut encore réessayer
        if (tentatives < maxTentatives) {
            console.log('⏳ Éléments de thème non trouvés, nouvelle tentative dans 500ms...');
            setTimeout(essayerInitialisation, 500);
        } else {
            console.error('❌ Échec initialisation thèmes après', maxTentatives, 'tentatives');
            // Essayer quand même d'initialiser avec les éléments disponibles
            initialiserGestionThemes();
        }
    };
    
    // Démarrer la première tentative après un court délai
    setTimeout(essayerInitialisation, 300);
}

/**
 * Vérifie que tous les éléments nécessaires existent
 */
function verifierElementsThemes() {
    const elements = [
        'theme-principal',
        'couleur-primaire', 
        'couleur-secondaire',
        'mode-sombre'
    ];
    
    let tousPresents = true;
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Élément manquant: #${id}`);
            tousPresents = false;
        } else {
            console.log(`✅ Élément présent: #${id}`);
        }
    });
    
    return tousPresents;
}

/**
 * Version robuste de initialiserGestionThemes qui fonctionne même si certains éléments manquent
 */
function initialiserGestionThemes() {
    try {
        console.log('🎨 Début initialisation gestion des thèmes...');
        
        // Écouteurs pour les sélecteurs de thème
        const selectTheme = document.getElementById('theme-principal');
        if (selectTheme) {
            selectTheme.addEventListener('change', gererChangementTheme);
            console.log('✅ Écouteur thème principal ajouté');
        }
        
        // Écouteurs pour les sélecteurs de couleur
        const couleurPrimaire = document.getElementById('couleur-primaire');
        const couleurSecondaire = document.getElementById('couleur-secondaire');
        
        if (couleurPrimaire) {
            couleurPrimaire.addEventListener('change', gererChangementCouleur);
            console.log('✅ Écouteur couleur primaire ajouté');
        }
        
        if (couleurSecondaire) {
            couleurSecondaire.addEventListener('change', gererChangementCouleur);
            console.log('✅ Écouteur couleur secondaire ajouté');
        }
        
        // Écouteur pour le mode sombre
        const modeSombre = document.getElementById('mode-sombre');
        if (modeSombre) {
            modeSombre.addEventListener('change', gererChangementModeSombre);
            console.log('✅ Écouteur mode sombre ajouté');
        }
        
        // Prévisualisation en temps réel (optionnelle)
        try {
            initialiserPrevisualisationThemes();
        } catch (previewError) {
            console.warn('⚠️ Prévisualisation thèmes non initialisée:', previewError);
        }
        
        console.log('✅ Gestion des thèmes initialisée');
        
    } catch (error) {
        console.error('❌ Erreur initialisation gestion thèmes:', error);
    }
}

/**
 * Initialise la prévisualisation des thèmes (version sécurisée)
 */
function initialiserPrevisualisationThemes() {
    try {
        // Vérifier si le conteneur existe déjà
        let previewContainer = document.getElementById('theme-preview-container');
        if (previewContainer) {
            console.log('✅ Prévisualisation déjà existante');
            return;
        }
        
        // Créer un nouveau conteneur
        previewContainer = document.createElement('div');
        previewContainer.id = 'theme-preview-container';
        previewContainer.className = 'mt-3 p-3 border rounded';
        previewContainer.innerHTML = `
            <h6 class="mb-2"><i class="bi bi-eye me-1"></i>Aperçu du thème</h6>
            <div class="d-flex gap-2 flex-wrap align-items-center" id="theme-preview-elements">
                <button class="btn btn-primary btn-sm">Bouton Primaire</button>
                <button class="btn btn-secondary btn-sm">Bouton Secondaire</button>
                <span class="badge bg-primary">Badge</span>
                <span class="text-primary">Texte primaire</span>
                <span class="text-secondary">Texte secondaire</span>
            </div>
        `;
        
        // Trouver la section thèmes de manière sécurisée
        const themeSection = trouverSectionThemes();
        if (themeSection) {
            themeSection.appendChild(previewContainer);
            console.log('✅ Prévisualisation thèmes ajoutée');
        } else {
            console.warn('⚠️ Section thèmes non trouvée pour la prévisualisation');
        }
        
    } catch (error) {
        console.error('❌ Erreur initialisation prévisualisation:', error);
    }
}

/**
 * Trouve la section des thèmes de manière compatible
 */
function trouverSectionThemes() {
    try {
        // Méthode 1: Chercher par l'ID du select theme-principal
        const selectTheme = document.getElementById('theme-principal');
        if (selectTheme) {
            const cardBody = selectTheme.closest('.card-body');
            if (cardBody) {
                console.log('✅ Section thèmes trouvée via select theme-principal');
                return cardBody;
            }
        }
        
        // Méthode 2: Chercher par les inputs de couleur
        const couleurPrimaire = document.getElementById('couleur-primaire');
        if (couleurPrimaire) {
            const cardBody = couleurPrimaire.closest('.card-body');
            if (cardBody) {
                console.log('✅ Section thèmes trouvée via input couleur');
                return cardBody;
            }
        }
        
        // Méthode 3: Chercher dans tous les card-body
        const cardBodies = document.querySelectorAll('.card-body');
        for (let body of cardBodies) {
            // Vérifier si ce card-body contient des éléments de thème
            if (body.querySelector('#theme-principal') || 
                body.querySelector('#couleur-primaire') || 
                body.querySelector('#couleur-secondaire')) {
                console.log('✅ Section thèmes trouvée via recherche card-body');
                return body;
            }
        }
        
        console.warn('❌ Section thèmes non trouvée');
        return null;
        
    } catch (error) {
        console.error('❌ Erreur recherche section thèmes:', error);
        return null;
    }
}

/**
 * Fallback configuration sécurisé
 */
function creerFallbackConfiguration() {
    console.log('🔄 Création configuration fallback...');
    
    return {
        config: chargerConfigurationFallback(),
        
        sauvegarderConfiguration: function(nouvelleConfig) {
            try {
                if (nouvelleConfig) {
                    this.config = { ...this.config, ...nouvelleConfig };
                }
                this.config.meta.derniereSauvegarde = new Date().toISOString();
                localStorage.setItem('msn_configuration', JSON.stringify(this.config));
                appliquerConfigurationImmediate(this.config);
                return true;
            } catch (error) {
                console.error('❌ Erreur sauvegarde fallback:', error);
                return false;
            }
        },
        
        appliquerConfiguration: function() {
            try {
                appliquerConfigurationImmediate(this.config);
            } catch (error) {
                console.error('❌ Erreur application configuration fallback:', error);
            }
        },
        
        mettreAJourInterface: function() {
            console.log('🔄 Mise à jour interface (fallback)');
        },
        
        chargerConfiguration: function() {
            return this.config;
        }
    };
}

function chargerConfigurationFallback() {
    try {
        const configSauvegardee = localStorage.getItem('msn_configuration');
        if (configSauvegardee) {
            const config = JSON.parse(configSauvegardee);
            console.log('✅ Configuration chargée depuis localStorage');
            return config;
        }
    } catch (e) {
        console.error('❌ Erreur chargement fallback:', e);
    }
    
    // Configuration par défaut
    console.log('ℹ️ Utilisation configuration par défaut fallback');
    return {
        theme: 'bleu',
        couleurPrimaire: '#2c3e50',
        couleurSecondaire: '#3498db',
        modeSombre: true,
        meta: {
            version: '1.0.0',
            derniereSauvegarde: null,
            dateInstallation: new Date().toISOString()
        }
    };
}
// ===== FONCTION DE SAUVEGARDE CORRIGÉE =====

function sauvegarderConfiguration() {
    try {
        console.log('💾 Début sauvegarde configuration...');
        
        // VÉRIFIER SI configManager EST DISPONIBLE
        if (!configManager) {
            console.warn('🔄 configManager non initialisé, tentative de récupération...');
            
            if (window.configManager) {
                configManager = window.configManager;
            } else {
                // Créer une instance d'urgence
                console.warn('🔄 Création d\'urgence de ConfigurationManager');
                configManager = new ConfigurationManager();
                window.configManager = configManager;
            }
        }

        // VÉRIFIER SI configManager EST TOUJOURS VALIDE
        if (!configManager || typeof configManager.sauvegarderConfiguration !== 'function') {
            throw new Error('ConfigurationManager non disponible');
        }

        // RÉCUPÉRER LES VALEURS ACTUELLES DU FORMULAIRE
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };

        const getChecked = (id) => {
            const element = document.getElementById(id);
            return element ? element.checked : false;
        };

        // Récupérer les valeurs du formulaire
        const nouvelleConfig = {
            theme: getValue('theme-principal'),
            couleurPrimaire: getValue('couleur-primaire'),
            couleurSecondaire: getValue('couleur-secondaire'),
            modeSombre: getChecked('mode-sombre'),
            typeNavigation: getValue('type-navigation') || 'sidebar',
            densiteAffichage: getValue('densite-affichage') || 'comfort',
            animations: getChecked('animations') !== false,
            
            modules: {
                commandes: getChecked('module-commandes') !== false,
                clients: getChecked('module-clients') !== false,
                finances: getChecked('module-finances') !== false,
                notifications: getChecked('module-notifications') !== false,
                export: getChecked('module-export') !== false,
                statistiques: getChecked('module-statistiques') !== false
            },
            
            notifications: {
                son: getChecked('notif-son') !== false,
                browser: getChecked('notif-browser') !== false,
                duree: parseInt(getValue('duree-notifications')) || 5,
                intervalVerif: parseInt(getValue('interval-verif')) || 30,
                rappelDevis: getChecked('rappel-devis') !== false,
                rappelPaiement: getChecked('rappel-paiement') !== false
            },
            
            export: {
                format: getValue('format-export') || 'json',
                inclureCommandes: getChecked('export-commandes') !== false,
                inclureClients: getChecked('export-clients') !== false
            },
            
            systeme: {
                intervalActualisation: parseInt(getValue('interval-actualisation')) || 30,
                cacheActif: getChecked('cache-actif') !== false,
                compression: getChecked('compression') !== false,
                delaiDeconnexion: parseInt(getValue('delai-deconnexion')) || 60,
                verifIntegrite: getChecked('verif-integrite') !== false,
                sauvegardeAuto: getChecked('sauvegarde-auto') !== false
            },
            
            meta: {
                ...configManager.config.meta,
                derniereSauvegarde: new Date().toISOString()
            }
        };
        
        console.log('📋 Configuration à sauvegarder:', nouvelleConfig);
        
        // UTILISER LA MÉTHODE DE L'INSTANCE POUR SAUVEGARDER
        const resultat = configManager.sauvegarderConfiguration(nouvelleConfig);
        
        if (resultat) {
            showNotification('Configuration sauvegardée avec succès', 'success');
            
            // Forcer le rechargement des données si nécessaire
            if (typeof actualiserDonnees === 'function') {
                setTimeout(actualiserDonnees, 500);
            }
            
            return true;
        } else {
            showNotification('Erreur lors de la sauvegarde', 'error');
            return false;
        }
        
    } catch (error) {
        console.error('💥 Erreur critique dans sauvegarderConfiguration:', error);
        showNotification('Erreur critique: ' + error.message, 'error');
        
        // Fallback: sauvegarde simple
        return sauvegarderConfigurationFallback();
    }
}

// ===== FONCTION DE FALLBACK =====

function sauvegarderConfigurationFallback() {
    try {
        console.log('🔄 Utilisation du mode fallback pour la sauvegarde...');
        
        // Récupérer les valeurs essentielles
        const theme = document.getElementById('theme-principal')?.value || 'bleu';
        const couleurPrimaire = document.getElementById('couleur-primaire')?.value || '#2c3e50';
        const couleurSecondaire = document.getElementById('couleur-secondaire')?.value || '#3498db';
        const modeSombre = document.getElementById('mode-sombre')?.checked || true;

        // Configuration minimale
        const configMinimale = {
            theme: theme,
            couleurPrimaire: couleurPrimaire,
            couleurSecondaire: couleurSecondaire,
            modeSombre: modeSombre,
            modules: {
                commandes: true,
                clients: true,
                finances: true,
                notifications: true,
                export: true,
                statistiques: true
            },
            meta: {
                version: '1.0.0',
                derniereSauvegarde: new Date().toISOString(),
                dateInstallation: new Date().toISOString()
            }
        };
        
        // Sauvegarder dans localStorage
        localStorage.setItem('msn_configuration', JSON.stringify(configMinimale));
        
        // Appliquer immédiatement
        appliquerConfigurationImmediate(configMinimale);
        
        showNotification('Configuration sauvegardée (mode secours)', 'success');
        return true;
        
    } catch (error) {
        console.error('💥 Erreur même en mode fallback:', error);
        showNotification('Échec complet de la sauvegarde', 'error');
        return false;
    }
}

// ===== FONCTION D'APPLICATION IMMÉDIATE =====

function appliquerConfigurationImmediate(config) {
    try {
        console.log('⚡ Application immédiate de la configuration...');
        
        // Appliquer le thème
        const root = document.documentElement;
        root.style.setProperty('--bs-primary', config.couleurPrimaire);
        root.style.setProperty('--bs-secondary', config.couleurSecondaire);
        root.style.setProperty('--primary-color', config.couleurPrimaire);
        root.style.setProperty('--secondary-color', config.couleurSecondaire);
        
        // Appliquer le thème CSS
        document.body.className = document.body.className.replace(/\btheme-\w+/g, '');
        document.body.classList.add(`theme-${config.theme}`);
        
        // Mode sombre
        if (config.modeSombre) {
            document.body.classList.add('mode-sombre');
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        } else {
            document.body.classList.remove('mode-sombre');
            document.documentElement.setAttribute('data-bs-theme', 'light');
        }
        
        // Mettre à jour les styles Bootstrap
        mettreAJourStylesCouleurs(config.couleurPrimaire, config.couleurSecondaire);
        
        console.log('✅ Configuration appliquée immédiatement');
        
    } catch (error) {
        console.error('❌ Erreur application immédiate:', error);
    }
}

// ===== INITIALISATION AMÉLIORÉE =====

document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🚀 Début initialisation ConfigurationManager...');
        
        // Vérifier si la classe existe
        if (typeof ConfigurationManager === 'undefined') {
            throw new Error('Classe ConfigurationManager non définie');
        }
        
        // Créer l'instance
        configManager = new ConfigurationManager();
        
        // Exposer globalement
        window.configManager = configManager;
        
        // Initialiser la gestion des thèmes
        setTimeout(() => {
            initialiserGestionThemes();
            
            // Vérifier que la configuration est bien chargée
            console.log('🔍 Vérification configuration chargée:', configManager.config);
        }, 100);
        
        console.log('🎉 ConfigurationManager initialisé avec succès');
        
    } catch (error) {
        console.error('💥 Erreur initialisation ConfigurationManager:', error);
        
        // Fallback robuste
        configManager = creerFallbackConfiguration();
        window.configManager = configManager;
        
        showNotification('ConfigurationManager en mode sécurisé', 'warning');
    }
});

function creerFallbackConfiguration() {
    return {
        config: chargerConfigurationFallback(),
        
        sauvegarderConfiguration: function(nouvelleConfig) {
            if (nouvelleConfig) {
                this.config = { ...this.config, ...nouvelleConfig };
            }
            this.config.meta.derniereSauvegarde = new Date().toISOString();
            localStorage.setItem('msn_configuration', JSON.stringify(this.config));
            appliquerConfigurationImmediate(this.config);
            return true;
        },
        
        appliquerConfiguration: function() {
            appliquerConfigurationImmediate(this.config);
        },
        
        mettreAJourInterface: function() {
            console.log('🔄 Mise à jour interface (fallback)');
        }
    };
}

function chargerConfigurationFallback() {
    try {
        const configSauvegardee = localStorage.getItem('msn_configuration');
        if (configSauvegardee) {
            return JSON.parse(configSauvegardee);
        }
    } catch (e) {
        console.error('❌ Erreur chargement fallback:', e);
    }
    
    // Configuration par défaut
    return {
        theme: 'bleu',
        couleurPrimaire: '#2c3e50',
        couleurSecondaire: '#3498db',
        modeSombre: true,
        meta: {
            version: '1.0.0',
            derniereSauvegarde: null,
            dateInstallation: new Date().toISOString()
        }
    };
}

// ===== EXPOSITION DES FONCTIONS =====

window.sauvegarderConfiguration = sauvegarderConfiguration;
window.sauvegarderConfigurationFallback = sauvegarderConfigurationFallback;
window.appliquerConfigurationImmediate = appliquerConfigurationImmediate;
// ===== EXPOSITION DES FONCTIONS GLOBALES =====

window.initialiserGestionThemes = initialiserGestionThemes;
window.gererChangementTheme = gererChangementTheme;
window.gererChangementCouleur = gererChangementCouleur;
window.gererChangementModeSombre = gererChangementModeSombre;
window.reinitialiserThemes = reinitialiserThemes;
// ===== EXPOSITION DES FONCTIONS GLOBALES =====

// Exposer les fonctions globalement
window.testerTheme = testerTheme;
window.testerModeSombre = testerModeSombre;
window.reinitialiserTestTheme = reinitialiserTestTheme;
window.assombrirCouleur = assombrirCouleur;
// Fonction pour réparer les services (déjà définie dans services-manager.js)
// function reparerServices() { ... }

// Initialisation

// ... le reste du code avec les fonctions globales reste inchangé ...