// ===== GESTIONNAIRE DES SERVICES - CORRIGÉ =====
class ServicesManager {
    constructor() {
        this.services = this.chargerServices();
        this.categories = this.getCategoriesDefaut();
    }

    // Services par défaut
    getServicesDefaut() {
        return [
            {
                id: 1,
                nom: "Création de logo",
                description: "Design de logo professionnel avec plusieurs propositions",
                prixUnitaire: 50000,
                unite: "forfait",
                categorie: "design",
                actif: true,
                dateCreation: new Date().toISOString(),
                utilisations: 12
            },
            {
                id: 2,
                nom: "Site vitrine",
                description: "Développement de site web responsive",
                prixUnitaire: 300000,
                unite: "projet",
                categorie: "developpement",
                actif: true,
                dateCreation: new Date().toISOString(),
                utilisations: 8
            },
            {
                id: 3,
                nom: "Rédaction article",
                description: "Rédaction d'article optimisé SEO",
                prixUnitaire: 15000,
                unite: "page",
                categorie: "redaction",
                actif: true,
                dateCreation: new Date().toISOString(),
                utilisations: 25
            }
        ];
    }

    // Catégories par défaut
    getCategoriesDefaut() {
        return {
            'design': { nom: 'Design Graphique', couleur: '#e74c3c' },
            'developpement': { nom: 'Développement Web', couleur: '#3498db' },
            'redaction': { nom: 'Rédaction', couleur: '#27ae60' },
            'marketing': { nom: 'Marketing Digital', couleur: '#f39c12' },
            'video': { nom: 'Audio-Visuel', couleur: '#9b59b6' },
            'conseil': { nom: 'Conseil', couleur: '#1abc9c' },
            'autre': { nom: 'Autre', couleur: '#95a5a6' }
        };
    }

    // Charger les services
    chargerServices() {
        try {
            const servicesSauvegardes = localStorage.getItem('msn_services');
            if (servicesSauvegardes) {
                const services = JSON.parse(servicesSauvegardes);
                // S'assurer que tous les services ont les propriétés requises
                return services.map(service => this.normaliserService(service));
            }
        } catch (e) {
            console.error('Erreur chargement services:', e);
        }
        return this.getServicesDefaut();
    }

    // Normaliser un service (s'assurer qu'il a toutes les propriétés)
    normaliserService(service) {
        return {
            id: service.id || Date.now(),
            nom: service.nom || 'Service sans nom',
            description: service.description || '',
            prixUnitaire: Number(service.prixUnitaire) || 0,
            unite: service.unite || 'unité',
            categorie: service.categorie || 'autre',
            actif: service.actif !== false, // true par défaut
            dateCreation: service.dateCreation || new Date().toISOString(),
            utilisations: Number(service.utilisations) || 0
        };
    }

    // Sauvegarder les services
    sauvegarderServices() {
        try {
            localStorage.setItem('msn_services', JSON.stringify(this.services));
            return true;
        } catch (e) {
            console.error('Erreur sauvegarde services:', e);
            return false;
        }
    }

    // Ajouter un nouveau service
    ajouterService(serviceData) {
        // Validation des données
        if (!serviceData.nom || !serviceData.nom.trim()) {
            throw new Error('Le nom du service est requis');
        }

        const prix = Number(serviceData.prixUnitaire);
        if (isNaN(prix) || prix < 0) {
            throw new Error('Le prix doit être un nombre positif');
        }

        if (!serviceData.unite) {
            throw new Error('L\'unité est requise');
        }

        const nouveauService = this.normaliserService({
            nom: serviceData.nom.trim(),
            description: serviceData.description ? serviceData.description.trim() : '',
            prixUnitaire: prix,
            unite: serviceData.unite,
            categorie: serviceData.categorie || 'autre',
            actif: serviceData.actif !== false
        });

        // Vérifier si le service existe déjà
        const existeDeja = this.services.some(service => 
            service.nom.toLowerCase() === nouveauService.nom.toLowerCase()
        );

        if (existeDeja) {
            throw new Error('Un service avec ce nom existe déjà');
        }

        this.services.push(nouveauService);
        
        if (this.sauvegarderServices()) {
            return nouveauService;
        } else {
            throw new Error('Erreur lors de la sauvegarde');
        }
    }

    // Modifier un service
    modifierService(id, modifications) {
        const index = this.services.findIndex(service => service.id === id);
        
        if (index === -1) {
            throw new Error('Service non trouvé');
        }

        // Validation du prix si modifié
        if (modifications.prixUnitaire !== undefined) {
            const prix = Number(modifications.prixUnitaire);
            if (isNaN(prix) || prix < 0) {
                throw new Error('Le prix doit être un nombre positif');
            }
            modifications.prixUnitaire = prix;
        }

        // Mettre à jour seulement les champs fournis
        this.services[index] = { 
            ...this.services[index], 
            ...modifications,
            // S'assurer que l'ID ne change pas
            id: this.services[index].id
        };
        
        if (this.sauvegarderServices()) {
            return this.services[index];
        } else {
            throw new Error('Erreur lors de la sauvegarde');
        }
    }

    // Supprimer un service
    supprimerService(id) {
        const index = this.services.findIndex(service => service.id === id);
        
        if (index === -1) {
            throw new Error('Service non trouvé');
        }

        // Vérifier si le service est utilisé dans des commandes
        if (this.estServiceUtilise(id)) {
            throw new Error('Ce service est utilisé dans des commandes et ne peut pas être supprimé');
        }

        this.services.splice(index, 1);
        return this.sauvegarderServices();
    }

    // Vérifier si un service est utilisé
    estServiceUtilise(idService) {
        try {
            // Vérifier si dataManager existe
            if (typeof dataManager === 'undefined') {
                return false;
            }
            
            const commandes = dataManager.getCommandes();
            if (!Array.isArray(commandes)) {
                return false;
            }

            return commandes.some(commande => {
                if (!commande.services || !Array.isArray(commande.services)) {
                    return false;
                }
                return commande.services.some(service => {
                    // Gérer différents formats de service
                    const serviceId = service.id || service.serviceId;
                    return serviceId === idService;
                });
            });
        } catch (e) {
            console.error('Erreur vérification utilisation service:', e);
            return false; // En cas d'erreur, considérer comme non utilisé
        }
    }

    // Obtenir un service par ID
    getServiceParId(id) {
        const service = this.services.find(service => service.id === id);
        return service ? this.normaliserService(service) : null;
    }

    // Filtrer les services
    filtrerServices(filtre = '') {
        if (!filtre) {
            return this.services;
        }

        const filtreLower = filtre.toLowerCase();
        return this.services.filter(service => {
            const serviceNormalise = this.normaliserService(service);
            return (
                serviceNormalise.nom.toLowerCase().includes(filtreLower) ||
                (serviceNormalise.description && serviceNormalise.description.toLowerCase().includes(filtreLower)) ||
                serviceNormalise.categorie.toLowerCase().includes(filtreLower)
            );
        });
    }

    // Obtenir les services par catégorie
    getServicesParCategorie() {
        const parCategorie = {};
        
        this.services.forEach(service => {
            const serviceNormalise = this.normaliserService(service);
            const categorie = serviceNormalise.categorie;
            
            if (!parCategorie[categorie]) {
                parCategorie[categorie] = [];
            }
            parCategorie[categorie].push(serviceNormalise);
        });
        
        return parCategorie;
    }

    // Obtenir les statistiques
    getStatistiques() {
        const servicesActifs = this.services.filter(s => s.actif !== false).length;
        const categoriesUniques = new Set(this.services.map(s => this.normaliserService(s).categorie)).size;
        const totalUtilisations = this.services.reduce((sum, service) => sum + (Number(service.utilisations) || 0), 0);
        
        return {
            total: this.services.length,
            actifs: servicesActifs,
            categories: categoriesUniques,
            utilisations: totalUtilisations
        };
    }

    // Incrémenter le compteur d'utilisations
    incrementerUtilisations(idService) {
        const service = this.getServiceParId(idService);
        if (service) {
            service.utilisations = (Number(service.utilisations) || 0) + 1;
            this.sauvegarderServices();
        }
    }

    // Obtenir les services pour les formulaires de commande
    getServicesPourFormulaire() {
        return this.services
            .filter(service => service.actif !== false)
            .map(service => {
                const serviceNormalise = this.normaliserService(service);
                return {
                    id: serviceNormalise.id,
                    nom: serviceNormalise.nom,
                    description: serviceNormalise.description,
                    prixUnitaire: serviceNormalise.prixUnitaire,
                    unite: serviceNormalise.unite,
                    categorie: serviceNormalise.categorie
                };
            });
    }

    // Vérifier l'intégrité des données
    verifierIntegrite() {
        const problemes = [];
        
        this.services.forEach((service, index) => {
            const serviceNormalise = this.normaliserService(service);
            
            if (!serviceNormalise.nom || serviceNormalise.nom.trim() === '') {
                problemes.push(`Service ${index}: nom manquant`);
            }
            
            if (isNaN(serviceNormalise.prixUnitaire) || serviceNormalise.prixUnitaire < 0) {
                problemes.push(`Service ${index}: prix invalide`);
            }
            
            if (!serviceNormalise.unite) {
                problemes.push(`Service ${index}: unité manquante`);
            }
        });
        
        return problemes;
    }

    // Réparer les données corrompues
    reparerDonnees() {
        const problemes = this.verifierIntegrite();
        
        if (problemes.length === 0) {
            return { reparation: false, message: 'Aucun problème détecté' };
        }
        
        try {
            // Normaliser tous les services
            this.services = this.services.map(service => this.normaliserService(service));
            this.sauvegarderServices();
            
            return { 
                reparation: true, 
                message: `${problemes.length} problème(s) corrigé(s)` 
            };
        } catch (error) {
            return { reparation: false, message: 'Erreur lors de la réparation' };
        }
    }
}

// Initialiser le gestionnaire de services
let servicesManager;

// Fonctions globales pour l'interface
function afficherFormulaireService() {
    const formulaire = document.getElementById('formulaire-service');
    const message = document.getElementById('message-ajout-service');
    
    if (formulaire && message) {
        formulaire.style.display = 'block';
        message.style.display = 'none';
        
        const inputNom = document.getElementById('service-nom');
        if (inputNom) inputNom.focus();
    }
}

function cacherFormulaireService() {
    const formulaire = document.getElementById('formulaire-service');
    const message = document.getElementById('message-ajout-service');
    
    if (formulaire && message) {
        formulaire.style.display = 'none';
        message.style.display = 'block';
        formulaire.reset();
        
        // Réinitialiser le bouton de soumission
        const submitBtn = formulaire.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Enregistrer';
            submitBtn.onclick = function(e) {
                e.preventDefault();
                ajouterService(e);
            };
        }
    }
}

function chargerServices() {
    if (!servicesManager) {
        console.error('ServicesManager non initialisé');
        return;
    }

    const container = document.getElementById('liste-services');
    if (!container) {
        console.error('Container liste-services non trouvé');
        return;
    }

    const services = servicesManager.services;
    const stats = servicesManager.getStatistiques();

    // Mettre à jour les compteurs de manière sécurisée
    const elements = {
        'total-services': `${services.length} service${services.length > 1 ? 's' : ''}`,
        'stats-total-services': stats.total,
        'stats-services-actifs': stats.actifs,
        'stats-categories': stats.categories,
        'stats-utilisation': stats.utilisations
    };

    Object.entries(elements).forEach(([id, valeur]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = valeur;
        }
    });

    if (services.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📋</div>
                <h3>Aucun service</h3>
                <p>Ajoutez votre premier service pour commencer</p>
            </div>
        `;
        return;
    }

    // Afficher les services de manière sécurisée
    container.innerHTML = services.map(service => {
        const serviceNormalise = servicesManager.normaliserService(service);
        const estUtilise = servicesManager.estServiceUtilise(serviceNormalise.id);
        const categorieInfo = servicesManager.categories[serviceNormalise.categorie];
        const nomCategorie = categorieInfo ? categorieInfo.nom : serviceNormalise.categorie;
        
        // Formater le prix de manière sécurisée
        let prixFormate = '0';
        try {
            prixFormate = serviceNormalise.prixUnitaire.toLocaleString('fr-MG');
        } catch (e) {
            console.error('Erreur formatage prix:', e);
            prixFormate = String(serviceNormalise.prixUnitaire || 0);
        }

        return `
            <div class="service-item ${serviceNormalise.actif ? '' : 'inactif'}">
                <div class="service-header">
                    <h6 class="service-nom">${this.escapeHtml(serviceNormalise.nom)}</h6>
                    <div class="service-prix">${prixFormate} Ar</div>
                </div>
                <div class="service-description">${this.escapeHtml(serviceNormalise.description) || 'Aucune description'}</div>
                <div class="service-meta">
                    <span class="badge-categorie">${this.escapeHtml(nomCategorie)}</span>
                    <span>${this.escapeHtml(serviceNormalise.unite)} • ${serviceNormalise.utilisations || 0} utilisation(s)</span>
                </div>
                <div class="service-actions">
                    <button onclick="modifierService(${serviceNormalise.id})" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-pencil"></i> Modifier
                    </button>
                    <button onclick="toggleServiceActif(${serviceNormalise.id})" class="btn btn-sm ${serviceNormalise.actif ? 'btn-warning' : 'btn-success'}">
                        <i class="bi bi-power"></i> ${serviceNormalise.actif ? 'Désactiver' : 'Activer'}
                    </button>
                    <button onclick="supprimerService(${serviceNormalise.id})" class="btn btn-sm btn-outline-danger" ${estUtilise ? 'disabled title="Service utilisé dans des commandes"' : ''}>
                        <i class="bi bi-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Fonction utilitaire pour échapper le HTML
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return String(unsafe);
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function ajouterService(event) {
    if (event) event.preventDefault();
    
    if (!servicesManager) {
        showNotification('Erreur: Gestionnaire de services non disponible', 'error');
        return;
    }

    // Récupérer les valeurs de manière sécurisée
    const getValue = (id) => {
        const element = document.getElementById(id);
        return element ? element.value : '';
    };

    const formData = {
        nom: getValue('service-nom'),
        description: getValue('service-description'),
        prixUnitaire: getValue('service-prix'),
        unite: getValue('service-unite'),
        categorie: getValue('service-categorie'),
        actif: document.getElementById('service-actif') ? document.getElementById('service-actif').checked : true
    };

    try {
        servicesManager.ajouterService(formData);
        showNotification('Service ajouté avec succès', 'success');
        cacherFormulaireService();
        chargerServices();
        
        // Recharger les listes de services dans les autres modules si nécessaire
        if (typeof actualiserListesServices === 'function') {
            actualiserListesServices();
        }
    } catch (error) {
        showNotification('Erreur: ' + error.message, 'error');
    }
}

function modifierService(id) {
    if (!servicesManager) {
        showNotification('Erreur: Gestionnaire de services non disponible', 'error');
        return;
    }

    const service = servicesManager.getServiceParId(id);
    if (!service) {
        showNotification('Service non trouvé', 'error');
        return;
    }

    // Remplir le formulaire avec les données du service
    const setValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    };

    setValue('service-nom', service.nom);
    setValue('service-description', service.description);
    setValue('service-prix', service.prixUnitaire);
    setValue('service-unite', service.unite);
    setValue('service-categorie', service.categorie);
    
    const checkboxActif = document.getElementById('service-actif');
    if (checkboxActif) {
        checkboxActif.checked = service.actif;
    }

    // Changer le formulaire en mode édition
    afficherFormulaireService();
    
    // Changer le bouton de soumission
    const form = document.getElementById('formulaire-service');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Modifier';
        submitBtn.onclick = function(e) {
            e.preventDefault();
            sauvegarderModificationService(id);
        };
    }
}

function sauvegarderModificationService(id) {
    if (!servicesManager) {
        showNotification('Erreur: Gestionnaire de services non disponible', 'error');
        return;
    }

    const getValue = (id) => {
        const element = document.getElementById(id);
        return element ? element.value : '';
    };

    const formData = {
        nom: getValue('service-nom'),
        description: getValue('service-description'),
        prixUnitaire: getValue('service-prix'),
        unite: getValue('service-unite'),
        categorie: getValue('service-categorie'),
        actif: document.getElementById('service-actif') ? document.getElementById('service-actif').checked : true
    };

    try {
        servicesManager.modifierService(id, formData);
        showNotification('Service modifié avec succès', 'success');
        cacherFormulaireService();
        chargerServices();
        
        // Réinitialiser le formulaire
        const form = document.getElementById('formulaire-service');
        if (form) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Enregistrer';
                submitBtn.onclick = function(e) {
                    e.preventDefault();
                    ajouterService(e);
                };
            }
        }
    } catch (error) {
        showNotification('Erreur: ' + error.message, 'error');
    }
}

function toggleServiceActif(id) {
    if (!servicesManager) {
        showNotification('Erreur: Gestionnaire de services non disponible', 'error');
        return;
    }

    const service = servicesManager.getServiceParId(id);
    if (!service) return;

    try {
        servicesManager.modifierService(id, { actif: !service.actif });
        showNotification(`Service ${!service.actif ? 'activé' : 'désactivé'}`, 'success');
        chargerServices();
    } catch (error) {
        showNotification('Erreur: ' + error.message, 'error');
    }
}

function supprimerService(id) {
    if (!servicesManager) {
        showNotification('Erreur: Gestionnaire de services non disponible', 'error');
        return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
        return;
    }

    try {
        servicesManager.supprimerService(id);
        showNotification('Service supprimé avec succès', 'success');
        chargerServices();
    } catch (error) {
        showNotification('Erreur: ' + error.message, 'error');
    }
}

// Recherche en temps réel
function configurerRechercheServices() {
    const rechercheInput = document.getElementById('recherche-service');
    if (rechercheInput) {
        rechercheInput.addEventListener('input', function() {
            if (!servicesManager) return;
            
            const resultats = servicesManager.filtrerServices(this.value);
            afficherResultatsRecherche(resultats);
        });
    }
}

function afficherResultatsRecherche(services) {
    const container = document.getElementById('liste-services');
    if (!container) return;
    
    if (!services || services.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🔍</div>
                <h3>Aucun résultat</h3>
                <p>Aucun service ne correspond à votre recherche</p>
            </div>
        `;
        return;
    }

    container.innerHTML = services.map(service => {
        const serviceNormalise = servicesManager.normaliserService(service);
        const estUtilise = servicesManager.estServiceUtilise(serviceNormalise.id);
        const categorieInfo = servicesManager.categories[serviceNormalise.categorie];
        const nomCategorie = categorieInfo ? categorieInfo.nom : serviceNormalise.categorie;
        
        let prixFormate = '0';
        try {
            prixFormate = serviceNormalise.prixUnitaire.toLocaleString('fr-MG');
        } catch (e) {
            prixFormate = String(serviceNormalise.prixUnitaire || 0);
        }

        return `
            <div class="service-item ${serviceNormalise.actif ? '' : 'inactif'}">
                <div class="service-header">
                    <h6 class="service-nom">${escapeHtml(serviceNormalise.nom)}</h6>
                    <div class="service-prix">${prixFormate} Ar</div>
                </div>
                <div class="service-description">${escapeHtml(serviceNormalise.description) || 'Aucune description'}</div>
                <div class="service-meta">
                    <span class="badge-categorie">${escapeHtml(nomCategorie)}</span>
                    <span>${escapeHtml(serviceNormalise.unite)} • ${serviceNormalise.utilisations || 0} utilisation(s)</span>
                </div>
                <div class="service-actions">
                    <button onclick="modifierService(${serviceNormalise.id})" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-pencil"></i> Modifier
                    </button>
                    <button onclick="toggleServiceActif(${serviceNormalise.id})" class="btn btn-sm ${serviceNormalise.actif ? 'btn-warning' : 'btn-success'}">
                        <i class="bi bi-power"></i> ${serviceNormalise.actif ? 'Désactiver' : 'Activer'}
                    </button>
                    <button onclick="supprimerService(${serviceNormalise.id})" class="btn btn-sm btn-outline-danger" ${estUtilise ? 'disabled title="Service utilisé dans des commandes"' : ''}>
                        <i class="bi bi-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Fonction pour recharger les services depuis d'autres modules
function actualiserListesServices() {
    if (typeof chargerServices === 'function') {
        chargerServices();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    try {
        servicesManager = new ServicesManager();
        
        // Configurer le formulaire
        const formulaire = document.getElementById('formulaire-service');
        if (formulaire) {
            formulaire.addEventListener('submit', ajouterService);
        }
        
        // Configurer la recherche
        configurerRechercheServices();
        
        console.log('ServicesManager initialisé avec succès');
    } catch (error) {
        console.error('Erreur initialisation ServicesManager:', error);
    }
});

// ... le code existant de services-manager.js ...

// AJOUTER CETTE FONCTION À LA FIN DU FICHIER
function reparerServices() {
    if (!servicesManager) {
        showNotification('ServicesManager non disponible', 'error');
        return;
    }
    
    if (!confirm('Voulez-vous réparer les données des services ? Cette opération corrigera les éventuelles incohérences.')) {
        return;
    }
    
    const resultat = servicesManager.reparerDonnees();
    showNotification(resultat.message, resultat.reparation ? 'success' : 'error');
    
    if (resultat.reparation) {
        // Recharger l'affichage des services
        if (typeof chargerServices === 'function') {
            chargerServices();
        }
        
        // Actualiser les indicateurs
        if (typeof configManager !== 'undefined' && typeof configManager.mettreAJourIndicateurs === 'function') {
            configManager.mettreAJourIndicateurs();
        }
    }
}

// Initialisation (garder le code d'initialisation existant)
document.addEventListener('DOMContentLoaded', function() {
    try {
        servicesManager = new ServicesManager();
        
        // Configurer le formulaire
        const formulaire = document.getElementById('formulaire-service');
        if (formulaire) {
            formulaire.addEventListener('submit', ajouterService);
        }
        
        // Configurer la recherche
        configurerRechercheServices();
        
        console.log('ServicesManager initialisé avec succès');
    } catch (error) {
        console.error('Erreur initialisation ServicesManager:', error);
    }
});

// ... le code existant de services-manager.js ...

// AJOUTER CETTE FONCTION À LA FIN DU FICHIER
function reparerServices() {
    if (!servicesManager) {
        showNotification('ServicesManager non disponible', 'error');
        return;
    }
    
    if (!confirm('Voulez-vous réparer les données des services ? Cette opération corrigera les éventuelles incohérences.')) {
        return;
    }
    
    const resultat = servicesManager.reparerDonnees();
    showNotification(resultat.message, resultat.reparation ? 'success' : 'error');
    
    if (resultat.reparation) {
        // Recharger l'affichage des services
        if (typeof chargerServices === 'function') {
            chargerServices();
        }
        
        // Actualiser les indicateurs
        if (typeof configManager !== 'undefined' && typeof configManager.mettreAJourIndicateurs === 'function') {
            configManager.mettreAJourIndicateurs();
        }
    }
}

// Initialisation (garder le code d'initialisation existant)
document.addEventListener('DOMContentLoaded', function() {
    try {
        servicesManager = new ServicesManager();
        
        // Configurer le formulaire
        const formulaire = document.getElementById('formulaire-service');
        if (formulaire) {
            formulaire.addEventListener('submit', ajouterService);
        }
        
        // Configurer la recherche
        configurerRechercheServices();
        
        console.log('ServicesManager initialisé avec succès');
    } catch (error) {
        console.error('Erreur initialisation ServicesManager:', error);
    }
});