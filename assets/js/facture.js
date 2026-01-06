// Configuration de l'entreprise
const entreprise = {
    nom: "Multi-Services Numériques",
    telephone: "+261 34 396 77 44 / 033 18 444 53 / 032 26 803 69",
    email: "multi.snumerique@gmail.com",
    whatsapp: "+261 34 396 77 44",
    mobileMoney: {
        mvola: "034 39 677 44",
        airtel: "033 18 444 53",
        orange: "032 26 803 69"
    }
};


// Variables globales
let currentDevisData = null;
let commandesChargees = [];
let dataManager = null;

// Système de sauvegarde simplifié
class SauvegardeSimple {
    constructor() {
        this.cle = 'msn_sauvegarde_simple';
        this.charger();
    }

    charger() {
        try {
            const data = localStorage.getItem(this.cle);
            if (data) {
                this.donnees = JSON.parse(data);
            } else {
                this.donnees = {
                    dernierNumero: 0,
                    dateDerniereSauvegarde: new Date().toISOString()
                };
                this.sauvegarder();
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la sauvegarde:', error);
            this.donnees = {
                dernierNumero: 0,
                dateDerniereSauvegarde: new Date().toISOString()
            };
        }
    }

    sauvegarder() {
        try {
            this.donnees.dateDerniereSauvegarde = new Date().toISOString();
            localStorage.setItem(this.cle, JSON.stringify(this.donnees));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }

    genererNumero() {
        this.donnees.dernierNumero++;
        this.sauvegarder();
        return this.donnees.dernierNumero;
    }

    getNumeroActuel() {
        return this.donnees.dernierNumero;
    }
}

const sauvegarde = new SauvegardeSimple();

// DataManager basique si non disponible
function creerDataManagerBasique() {
    return {
        getCommandes: function() { 
            const commandes = JSON.parse(localStorage.getItem('msn_commandes')) || [];
            console.log('📋 Commandes chargées:', commandes.length);
            return commandes;
        },
        ajouterCommande: function(commande) { 
            console.log('💾 Sauvegarde commande:', commande);
            const commandes = this.getCommandes();
            commande.id = Date.now();
            commandes.push(commande);
            localStorage.setItem('msn_commandes', JSON.stringify(commandes));
            return { success: true, id: commande.id };
        },
        getStatistiques: function() {
            const commandes = this.getCommandes();
            return {
                totalCommandes: commandes.length,
                caMensuel: commandes.reduce((sum, cmd) => {
                    const total = parseInt(cmd.total?.replace(/[^0-9]/g, '') || '0');
                    return sum + total;
                }, 0),
                clientsUniques: new Set(commandes.map(cmd => cmd.client)).size
            };
        }
    };
}

// Fonctions helper sécurisées
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`⚠️ Élément non trouvé: ${id}`);
    }
    return element;
}

function getValue(id, defaultValue = '') {
    const element = getElement(id);
    return element ? element.value : defaultValue;
}

function setValue(id, value) {
    const element = getElement(id);
    if (element) {
        element.value = value;
    }
}

function getText(id, defaultValue = '') {
    const element = getElement(id);
    return element ? element.textContent : defaultValue;
}

function setText(id, value) {
    const element = getElement(id);
    if (element) {
        element.textContent = value;
    }
}

function getSafeValue(id, defaultValue = 0) {
    const element = getElement(id);
    if (!element) return defaultValue;
    
    if (element.type === 'select-one') {
        return parseInt(element.options[element.selectedIndex]?.value) || defaultValue;
    }
    
    if (element.type === 'number' || element.type === 'text') {
        return parseInt(element.value) || defaultValue;
    }
    
    return defaultValue;
}

function getSafeChecked(id) {
    const element = getElement(id);
    return element ? element.checked : false;
}

// Initialisation sécurisée
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation de la page facture...');
    
    try {
        // Vérifier si DataManager existe
        if (typeof DataManager !== 'undefined') {
            dataManager = new DataManager();
            console.log('✅ DataManager initialisé');
        } else {
            console.warn('⚠️ DataManager non trouvé, création d\'une instance basique');
            dataManager = creerDataManagerBasique();
        }
        
        // Initialiser les composants
        genererReferenceFacture();
        initialiserEcouteurs();
        togglePaiementDetails();
        creerBadgeStatistiques();
        chargerListeCommandes();
        
        console.log('✅ Page facture initialisée avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
});

// Fonctions pour la gestion des commandes
function chargerListeCommandes() {
    try {
        commandesChargees = dataManager.getCommandes();
        const select = getElement('liste-commandes');
        
        if (!select) return;
        
        // Vider les options existantes
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        if (commandesChargees.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Aucune commande trouvée";
            select.appendChild(option);
            return;
        }
        
        // Ajouter les commandes
        commandesChargees.forEach(commande => {
            const option = document.createElement('option');
            option.value = commande.id;
            const date = new Date(commande.dateCreation).toLocaleDateString('fr-FR');
            option.textContent = `${commande.reference} - ${commande.client} - ${commande.total} - ${date}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
    }
}

function toggleChargementCommande() {
    const section = getElement('chargement-commande');
    if (section) {
        const isVisible = section.style.display === 'block';
        section.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            chargerListeCommandes();
        }
    }
}

function previsualiserCommande() {
    const select = getElement('liste-commandes');
    const preview = getElement('preview-commande');
    
    if (!select || !preview) return;
    
    const commandeId = parseInt(select.value);
    
    if (!commandeId) {
        preview.style.display = 'none';
        return;
    }
    
    const commande = commandesChargees.find(c => c.id === commandeId);
    
    if (!commande) {
        preview.style.display = 'none';
        return;
    }
    
    // Afficher les informations
    setText('preview-client', commande.client);
    setText('preview-services', commande.services.map(s => s.nom).join(', '));
    setText('preview-total', commande.total);
    setText('preview-date', new Date(commande.dateCreation).toLocaleDateString('fr-FR'));
    
    preview.style.display = 'block';
}

function chargerCommande() {
    const select = getElement('liste-commandes');
    if (!select) return;
    
    const commandeId = parseInt(select.value);
    
    if (!commandeId) {
        afficherAlerte('Veuillez sélectionner une commande', 'error');
        return;
    }
    
    const commande = commandesChargees.find(c => c.id === commandeId);
    
    if (!commande) {
        afficherAlerte('Commande non trouvée', 'error');
        return;
    }
    
    // Réinitialiser et remplir
    reinitialiserDevis();
    remplirServices(commande.services);
    
    // Remplir les informations client
    setValue('clientName', commande.client);
    setValue('clientContact', commande.contact || '');
    
    if (commande.duree) {
        setValue('dureeTraitement', commande.duree);
    }
    
    // Fermer les sections
    const chargementSection = getElement('chargement-commande');
    const previewSection = getElement('preview-commande');
    if (chargementSection) chargementSection.style.display = 'none';
    if (previewSection) previewSection.style.display = 'none';
    
    afficherAlerte(`Commande ${commande.reference} chargée avec succès`, 'success');
    showTab('devis');
}

function remplirServices(servicesCommande) {
    // Réinitialiser tous les services
    document.querySelectorAll('input[id^="service"]').forEach(cb => {
        cb.checked = false;
        const item = cb.closest('.service-item');
        const details = item ? item.querySelector('.service-details') : null;
        if (details) details.style.display = 'none';
    });
    document.querySelectorAll('input[type="number"]').forEach(input => input.value = '');

    // Pour chaque service dans la commande, trouver et remplir le champ correspondant
    servicesCommande.forEach(service => {
        if (!service || !service.nom) return;
        const nom = service.nom.toLowerCase();

        // Détection robuste du service
        const servicesMapping = {
            'saisie': { id: 'serviceSaisie', type: 'multiple-saisie' },
            'mise en forme': { id: 'serviceMiseEnForme', type: 'multiple-mise-en-forme' },
            'tableau': { id: 'serviceTableau', pagesId: 'nbTableaux', prixId: 'prixTableau', type: 'simple' },
            'figure': { id: 'serviceFigure', pagesId: 'nbFigures', prixId: null, type: 'simple' },
            'graphique': { id: 'serviceGraphique', pagesId: 'nbGraphiques', prixId: null, type: 'simple' },
            'organigramme': { id: 'serviceGraphique', pagesId: 'nbGraphiques', prixId: null, type: 'simple' },
            'logo': { id: 'serviceLogo', pagesId: 'nbLogos', prixId: null, type: 'simple' },
            'vector': { id: 'serviceVector', pagesId: 'nbVectors', prixId: null, type: 'simple' },
            'vectorisation': { id: 'serviceVector', pagesId: 'nbVectors', prixId: null, type: 'simple' },
            'affiche basique': { id: 'serviceAfficheBasique', pagesId: 'nbAffichesBasique', prixId: null, type: 'simple' },
            'affiche standard': { id: 'serviceAfficheStandard', pagesId: 'nbAffichesStandard', prixId: null, type: 'simple' },
            'affiche pro': { id: 'serviceAffichePro', pagesId: 'nbAffichesPro', prixId: null, type: 'simple' }
        };

        for (const [keyword, config] of Object.entries(servicesMapping)) {
            if (nom.includes(keyword)) {
                const cb = getElement(config.id);
                if (cb) {
                    cb.checked = true;
                    const details = cb.closest('.service-item')?.querySelector('.service-details');
                    if (details) details.style.display = 'block';
                    
                    // Gestion des champs multiples pour Saisie
                    if (config.type === 'multiple-saisie' && service.quantite) {
                        const pagesInputs = details.querySelectorAll('.pages-saisie');
                        const prixSelects = details.querySelectorAll('.prix-saisie');
                        
                        if (pagesInputs.length > 0) {
                            const pagesParChamp = Math.ceil(service.quantite / pagesInputs.length);
                            
                            pagesInputs.forEach((input, index) => {
                                const pagesRestantes = service.quantite - (index * pagesParChamp);
                                const pagesAInserer = Math.min(pagesParChamp, pagesRestantes);
                                if (pagesAInserer > 0) {
                                    input.value = pagesAInserer;
                                }
                            });
                        }
                        
                        if (service.prixUnitaire && prixSelects.length > 0) {
                            prixSelects.forEach(select => {
                                select.value = service.prixUnitaire;
                            });
                        }
                    }
                    
                    // Gestion des champs multiples pour Mise en forme
                    else if (config.type === 'multiple-mise-en-forme' && service.quantite) {
                        const pagesInputs = details.querySelectorAll('.pages-mise-en-forme');
                        const prixSelects = details.querySelectorAll('.prix-mise-en-forme');
                        
                        if (pagesInputs.length > 0) {
                            const pagesParChamp = Math.ceil(service.quantite / pagesInputs.length);
                            
                            pagesInputs.forEach((input, index) => {
                                const pagesRestantes = service.quantite - (index * pagesParChamp);
                                const pagesAInserer = Math.min(pagesParChamp, pagesRestantes);
                                if (pagesAInserer > 0) {
                                    input.value = pagesAInserer;
                                }
                            });
                        }
                        
                        if (service.prixUnitaire && prixSelects.length > 0) {
                            prixSelects.forEach(select => {
                                select.value = service.prixUnitaire;
                            });
                        }
                    }
                    
                    // Gestion des champs simples
                    else if (config.type === 'simple') {
                        if (service.quantite && config.pagesId) {
                            setValue(config.pagesId, service.quantite);
                        }
                        if (service.prixUnitaire && config.prixId) {
                            setValue(config.prixId, service.prixUnitaire);
                        }
                    }
                }
                break;
            }
        }
    });

    // Recalculer après remplissage
    calculerTotal();
}

function fermerPreview() {
    const preview = getElement('preview-commande');
    const select = getElement('liste-commandes');
    
    if (preview) preview.style.display = 'none';
    if (select) select.value = '';
}

// Fonctions d'affichage et d'alerte
function afficherAlerte(message, type = 'info') {
    // Supprimer les alertes existantes
    const alertesExistantes = document.querySelectorAll('.alert-custom');
    alertesExistantes.forEach(alerte => alerte.remove());
    
    // Créer la nouvelle alerte
    const alerte = document.createElement('div');
    alerte.className = `alert-custom alert-${type}`;
    alerte.textContent = message;
    alerte.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        background: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1'};
        color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'};
        border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : '#bee5eb'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(alerte);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        if (alerte.parentNode) {
            alerte.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => alerte.remove(), 300);
        }
    }, 3000);
}

// Gestion des références
function genererReferenceFacture(type = 'DEV') {
    const now = new Date();
    const annee = now.getFullYear().toString().substr(-2);
    const mois = (now.getMonth() + 1).toString().padStart(2, '0');
    const jour = now.getDate().toString().padStart(2, '0');
    
    const numero = sauvegarde.genererNumero();
    const sequence = numero.toString().padStart(3, '0');
    const ref = `${type}-${annee}${mois}${jour}-${sequence}`;
    
    setValue('refFacture', ref);
    return ref;
}

function genererReferenceFactureFinale() {
    return genererReferenceFacture('FAC');
}

// Badge de statistiques
function creerBadgeStatistiques() {
    // Vérifier si le badge existe déjà
    let badge = document.getElementById('badge-sauvegarde');
    
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'badge-sauvegarde';
        badge.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #3498db;
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 1000;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            border: 2px solid white;
            animation: pulse 2s infinite;
        `;
        document.body.appendChild(badge);
    }
    
    // Mettre à jour le contenu du badge
    const stats = dataManager.getStatistiques();
    badge.innerHTML = `📋 ${stats.totalCommandes} cmd`;
    badge.title = `Commandes: ${stats.totalCommandes}\nCA: ${stats.caMensuel.toLocaleString()} Ar\nClients: ${stats.clientsUniques}\nCliquez pour plus d'infos`;
    badge.onclick = afficherInfosSauvegarde;
    
    console.log('✅ Badge de statistiques créé/mis à jour');
}

function afficherInfosSauvegarde() {
    const stats = dataManager.getStatistiques();
    const message = `💾 État du système

📊 Statistiques:
• Commandes totales: ${stats.totalCommandes}
• CA mensuel: ${stats.caMensuel.toLocaleString('fr-FR')} Ar
• Clients uniques: ${stats.clientsUniques}

🔢 Numérotation:
• Dernier numéro: ${sauvegarde.getNumeroActuel()}`;
    
    alert(message);
}

// Initialisation des écouteurs
function initialiserEcouteurs() {
    console.log('🎯 Initialisation des écouteurs...');
    
    // Écouteurs pour les cases à cocher
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const details = this.closest('.service-item')?.querySelector('.service-details');
            if (details) {
                details.style.display = this.checked ? 'block' : 'none';
                if (this.checked) {
                    const inputs = details.querySelectorAll('input[type="number"]');
                    inputs.forEach(input => {
                        if (!input.value) {
                            input.value = input.min || '1';
                        }
                    });
                }
            }
            calculerTotal();
        });
    });

    // Écouteurs pour les quantités
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', calculerTotal);
    });
    
    // Écouteurs pour les sélecteurs de prix
    document.querySelectorAll('.price-select').forEach(select => {
        select.addEventListener('change', calculerTotal);
    });
    
    // Écouteurs spéciaux pour les champs multiples
    document.querySelectorAll('.pages-saisie, .prix-saisie').forEach(element => {
        element.addEventListener('input', calculerTotal);
    });
    
    // Écouteurs pour les champs multiples de mise en forme
    document.querySelectorAll('.pages-mise-en-forme, .prix-mise-en-forme').forEach(element => {
        element.addEventListener('input', calculerTotal);
    });
    
    console.log('✅ Écouteurs initialisés');
}

// Calcul du total avec vérifications
function calculerTotal() {
    let total = 0;

    // Calcul pour Saisie document - CHAMP MULTIPLE
    if (getSafeChecked('serviceSaisie')) {
        const pagesInputs = document.querySelectorAll('.pages-saisie');
        const prixSelects = document.querySelectorAll('.prix-saisie');
        
        for (let i = 0; i < Math.min(pagesInputs.length, prixSelects.length); i++) {
            const pages = parseInt(pagesInputs[i].value) || 0;
            const prix = parseInt(prixSelects[i].value) || 700;
            total += pages * prix;
        }
    }

    // Calcul pour Mise en forme - 3 CHAMPS
    if (getSafeChecked('serviceMiseEnForme')) {
        const pagesInputs = document.querySelectorAll('.pages-mise-en-forme');
        const prixSelects = document.querySelectorAll('.prix-mise-en-forme');
        
        for (let i = 0; i < Math.min(pagesInputs.length, prixSelects.length); i++) {
            const pages = parseInt(pagesInputs[i].value) || 0;
            const prix = parseInt(prixSelects[i].value) || 400;
            total += pages * prix;
        }
    }

    // Services avec champs simples
    if (getSafeChecked('serviceTableau')) {
        const nb = getSafeValue('nbTableaux');
        const prix = getSafeValue('prixTableau', 1000);
        total += nb * prix;
    }

    // Services avec prix fixes
    const servicesFixes = [
        { id: 'serviceFigure', qtyId: 'nbFigures', prix: 1500 },
        { id: 'serviceGraphique', qtyId: 'nbGraphiques', prix: 1500 },
        { id: 'serviceLogo', qtyId: 'nbLogos', prix: 50000 },
        { id: 'serviceVector', qtyId: 'nbVectors', prix: 25000 },
        { id: 'serviceAfficheBasique', qtyId: 'nbAffichesBasique', prix: 10000 },
        { id: 'serviceAfficheStandard', qtyId: 'nbAffichesStandard', prix: 20000 },
        { id: 'serviceAffichePro', qtyId: 'nbAffichesPro', prix: 30000 }
    ];

    servicesFixes.forEach(service => {
        if (getSafeChecked(service.id)) {
            const nb = getSafeValue(service.qtyId, 1);
            total += nb * service.prix;
        }
    });

    // Services personnalisés
    document.querySelectorAll('.custom-service input[type="checkbox"]:checked').forEach(checkbox => {
        const slug = checkbox.id.replace('serviceCustom_', '');
        const qtyInput = document.getElementById('qtyCustom_' + slug);
        const priceInput = document.getElementById('priceCustom_' + slug);
        
        if (qtyInput && priceInput) {
            const quantite = parseInt(qtyInput.value) || 0;
            const prix = parseInt(priceInput.value) || 0;
            total += quantite * prix;
        }
    });

    // Affichage du total
    setText('totalAmount', total.toLocaleString('fr-FR') + ' Ar');
    return total;
}

// Gestion des onglets
function showTab(tabName) {
    console.log(`📑 Navigation vers l'onglet: ${tabName}`);
    
    // Désactiver tous les onglets
    document.querySelectorAll('.tab-pane').forEach(tab => {
        tab.classList.remove('show', 'active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Activer l'onglet sélectionné
    const targetTab = getElement(tabName);
    const targetLink = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    
    if (targetTab) targetTab.classList.add('show', 'active');
    if (targetLink) targetLink.classList.add('active');
    
    // Actions spécifiques par onglet
    if (tabName === 'facture' && typeof togglePaiementDetails === 'function') {
        setTimeout(togglePaiementDetails, 100);
    }
}

// FONCTION MANQUANTE AJOUTÉE : getServicesSelectionnes()
function getServicesSelectionnes() {
    const servicesSelectionnes = [];
    console.log('🔍 Recherche des services sélectionnés...');

    try {
        // SAISIE DOCUMENT - Nouvelle interface
        if (document.getElementById('serviceSaisie')?.checked) {
            const pagesSimple = parseInt(document.querySelector('.pages-saisie-simple')?.value) || 0;
            const pagesStandard = parseInt(document.querySelector('.pages-saisie-standard')?.value) || 0;
            const pagesComplexe = parseInt(document.querySelector('.pages-saisie-complexe')?.value) || 0;
            
            console.log('📄 Saisie document - Simple:', pagesSimple, 'Standard:', pagesStandard, 'Complexe:', pagesComplexe);
            
            if (pagesSimple > 0) {
                servicesSelectionnes.push({ 
                    nom: 'Saisie document - Pages Simples', 
                    quantite: pagesSimple, 
                    unite: 'page', // AJOUT DE L'UNITÉ
                    prixUnitaire: 500,
                    sousTotal: pagesSimple * 500
                });
            }
            if (pagesStandard > 0) {
                servicesSelectionnes.push({ 
                    nom: 'Saisie document - Pages Standard', 
                    quantite: pagesStandard, 
                    unite: 'page', // AJOUT DE L'UNITÉ
                    prixUnitaire: 700,
                    sousTotal: pagesStandard * 700
                });
            }
            if (pagesComplexe > 0) {
                servicesSelectionnes.push({ 
                    nom: 'Saisie document - Pages Complexes', 
                    quantite: pagesComplexe, 
                    unite: 'page', // AJOUT DE L'UNITÉ
                    prixUnitaire: 1000,
                    sousTotal: pagesComplexe * 1000
                });
            }
        }

        // MISE EN FORME - Nouvelle interface
        if (document.getElementById('serviceMiseEnForme')?.checked) {
            const pagesBasique = parseInt(document.querySelector('.pages-mise-basique')?.value) || 0;
            const pagesMiseStandard = parseInt(document.querySelector('.pages-mise-standard')?.value) || 0;
            const pagesAvancee = parseInt(document.querySelector('.pages-mise-avancee')?.value) || 0;
            
            console.log('🎨 Mise en forme - Basique:', pagesBasique, 'Standard:', pagesMiseStandard, 'Avancée:', pagesAvancee);
            
            if (pagesBasique > 0) {
                servicesSelectionnes.push({ 
                    nom: 'Mise en forme - Basique', 
                    quantite: pagesBasique, 
                    unite: 'page', // AJOUT DE L'UNITÉ
                    prixUnitaire: 300,
                    sousTotal: pagesBasique * 300
                });
            }
            if (pagesMiseStandard > 0) {
                servicesSelectionnes.push({ 
                    nom: 'Mise en forme - Standard', 
                    quantite: pagesMiseStandard, 
                    unite: 'page', // AJOUT DE L'UNITÉ
                    prixUnitaire: 400,
                    sousTotal: pagesMiseStandard * 400
                });
            }
            if (pagesAvancee > 0) {
                servicesSelectionnes.push({ 
                    nom: 'Mise en forme - Avancée', 
                    quantite: pagesAvancee, 
                    unite: 'page', // AJOUT DE L'UNITÉ
                    prixUnitaire: 600,
                    sousTotal: pagesAvancee * 600
                });
            }
        }

        // TABLEAUX - Nouvelle interface
        if (document.getElementById('serviceTableau')?.checked) {
            const nbTableaux = parseInt(document.getElementById('nbTableaux')?.value) || 0;
            const prixTableau = parseInt(document.getElementById('prixTableau')?.value) || 1000;
            
            if (nbTableaux > 0) {
                servicesSelectionnes.push({
                    nom: 'Tableau',
                    quantite: nbTableaux,
                    unite: 'tableau', // AJOUT DE L'UNITÉ
                    prixUnitaire: prixTableau,
                    sousTotal: nbTableaux * prixTableau
                });
            }
        }

        // SERVICES AVEC PRIX FIXES - Nouvelle interface
        const servicesFixes = [
            { id: 'serviceFigure', nom: 'Figure complexe', qtyId: 'nbFigures', prix: 1500, unite: 'figure' },
            { id: 'serviceGraphique', nom: 'Graphique/Organigramme', qtyId: 'nbGraphiques', prix: 1500, unite: 'élément' },
            { id: 'serviceLogo', nom: 'Conception logo', qtyId: 'nbLogos', prix: 50000, unite: 'logo' },
            { id: 'serviceVector', nom: 'Vectorisation d\'image', qtyId: 'nbVectors', prix: 25000, unite: 'image' },
            { id: 'serviceAfficheBasique', nom: 'Affiche Basique', qtyId: 'nbAffichesBasique', prix: 10000, unite: 'affiche' },
            { id: 'serviceAfficheStandard', nom: 'Affiche Standard', qtyId: 'nbAffichesStandard', prix: 20000, unite: 'affiche' },
            { id: 'serviceAffichePro', nom: 'Affiche PRO', qtyId: 'nbAffichesPro', prix: 30000, unite: 'affiche' }
        ];

        servicesFixes.forEach(service => {
            const serviceEl = document.getElementById(service.id);
            if (serviceEl && serviceEl.checked) {
                const qtyEl = document.getElementById(service.qtyId);
                const quantite = qtyEl ? parseInt(qtyEl.value) || 0 : 0;
                
                if (quantite > 0) {
                    servicesSelectionnes.push({
                        nom: service.nom,
                        quantite: quantite,
                        unite: service.unite, // UTILISATION DE L'UNITÉ DÉFINIE
                        prixUnitaire: service.prix,
                        sousTotal: quantite * service.prix
                    });
                }
            }
        });

        // SERVICES PERSONNALISÉS - Nouvelle interface
        document.querySelectorAll('.custom-service').forEach(serviceElement => {
            const checkbox = serviceElement.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                const serviceId = serviceElement.id;
                const qtyInput = document.getElementById(`qty${serviceId}`);
                const priceInput = document.getElementById(`price${serviceId}`);
                const label = serviceElement.querySelector('label');
                const uniteInput = serviceElement.querySelector('input[type="text"][readonly]'); // Récupérer le champ unité
                
                if (qtyInput && priceInput && label) {
                    const quantite = parseInt(qtyInput.value) || 0;
                    const prix = parseInt(priceInput.value) || 0;
                    const unite = uniteInput ? uniteInput.value : 'unité'; // Récupérer l'unité ou utiliser "unité" par défaut
                    
                    if (quantite > 0 && prix > 0) {
                        const labelText = label.textContent.trim();
                        let nomComplet = labelText;
                        
                        // Extraire le nom sans la description
                        if (labelText.includes('\n')) {
                            const parts = labelText.split('\n');
                            nomComplet = parts[0].trim();
                        }
                        
                        servicesSelectionnes.push({
                            nom: nomComplet,
                            quantite: quantite,
                            unite: unite, // UTILISATION DE L'UNITÉ RÉCUPÉRÉE
                            prixUnitaire: prix,
                            sousTotal: quantite * prix
                        });
                    }
                }
            }
        });

        console.log('📦 Services trouvés:', servicesSelectionnes.length, servicesSelectionnes);

    } catch (error) {
        console.error('❌ Erreur dans getServicesSelectionnes:', error);
    }

    return servicesSelectionnes;
}

// Fonction générerDevis
function genererDevis() {
    console.log('🚀 Début de génération du devis...');
    
    const servicesSelectionnes = getServicesSelectionnes();
    console.log('📦 Services sélectionnés:', servicesSelectionnes);
    
    if (servicesSelectionnes.length === 0) {
        afficherAlerte('Veuillez sélectionner au moins un service', 'error');
        return;
    }

    const clientName = getValue('clientName');
    if (!clientName || !clientName.trim()) {
        afficherAlerte('Veuillez saisir le nom du client', 'error');
        return;
    }

    const referenceDevis = genererReferenceFacture();
    const referenceFacture = genererReferenceFactureFinale();

    currentDevisData = {
        client: clientName.trim(),
        contact: getValue('clientContact') || 'Non spécifié',
        services: servicesSelectionnes,
        duree: getValue('dureeTraitement'),
        total: getText('totalAmount').replace(' Ar', ''),
        reference: referenceDevis,
        referenceFacture: referenceFacture,
        date: new Date().toLocaleDateString('fr-FR'),
        dateCreation: new Date().toISOString()
    };

    console.log('💾 Données du devis:', currentDevisData);

    // ✅ SAUVEGARDER DANS LE SYSTÈME POUR LE DASHBOARD
    const resultatSauvegarde = dataManager.ajouterCommande(currentDevisData);
    console.log('💾 Résultat sauvegarde:', resultatSauvegarde);

    // Générer l'aperçu HTML
    const devisHTML = genererHTMLDevis(currentDevisData);
    console.log('📄 HTML généré avec succès');

    const apercu = getElement('apercuDevis');
    if (apercu) {
        apercu.innerHTML = devisHTML;
        apercu.style.display = 'block';
        console.log('👁️ Aperçu affiché');
    }

    // Afficher le bouton d'export
    toggleBoutonExport(true);

    // Mettre à jour le badge
    creerBadgeStatistiques();

    
    afficherAlerte('Devis généré avec succès ! Passez à l\'onglet "Facture Finale" pour finaliser.', 'success');
    console.log('🎉 Devis généré avec succès !');
}

// Fonction pour générer les détails des options (Saisie et Mise en forme)
function genererDetailsOptions(devisData) {
    let detailsHTML = '';
    
    // Détails pour Saisie document
    const serviceSaisie = devisData.services.find(s => s.nom === 'Saisie document');
    if (serviceSaisie && serviceSaisie.detailsOptions && serviceSaisie.detailsOptions.length > 0) {
        detailsHTML += `
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <h4 style="color: #2c3e50; margin-top: 0; margin-bottom: 10px;">
                <i class="fa fa-file-text"></i> Détails Saisie Document
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                ${serviceSaisie.detailsOptions.map(option => `
                    <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #dee2e6;">
                        <strong style="color: #2c3e50;">${option.type}</strong>
                        <p style="margin: 5px 0 0 0; color: #666;">
                            ${option.pages} pages × ${option.prix.toLocaleString('fr-FR')} Ar = 
                            <strong>${(option.pages * option.prix).toLocaleString('fr-FR')} Ar</strong>
                        </p>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }
    
    // Détails pour Mise en forme
    const serviceMiseEnForme = devisData.services.find(s => s.nom === 'Mise en forme');
    if (serviceMiseEnForme && serviceMiseEnForme.detailsOptions && serviceMiseEnForme.detailsOptions.length > 0) {
        detailsHTML += `
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <h4 style="color: #2c3e50; margin-top: 0; margin-bottom: 10px;">
                <i class="fa fa-paint-brush"></i> Détails Mise en Forme
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                ${serviceMiseEnForme.detailsOptions.map(option => `
                    <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #dee2e6;">
                        <strong style="color: #2c3e50;">${option.type}</strong>
                        <p style="margin: 5px 0 0 0; color: #666;">
                            ${option.pages} pages × ${option.prix.toLocaleString('fr-FR')} Ar = 
                            <strong>${(option.pages * option.prix).toLocaleString('fr-FR')} Ar</strong>
                        </p>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }
    
    return detailsHTML;
}
// =============================================
// FONCTIONS D'EXPORTATION EN IMAGE JPG
// =============================================

/**
 * Exporte le devis en image JPG
 */
function exporterDevisEnImage() {
    console.log('📸 Début export devis en image...');
    
    if (!currentDevisData) {
        afficherAlerte('Veuillez d\'abord générer un devis', 'error');
        return;
    }

    const apercuElement = document.getElementById('apercuDevis');
    if (!apercuElement || apercuElement.style.display === 'none') {
        afficherAlerte('Aucun aperçu de devis à exporter', 'error');
        return;
    }

    // Afficher le chargement
    afficherAlerte('Génération de l\'image en cours...', 'info');

    // Utiliser html2canvas pour capturer l'aperçu
    html2canvas(apercuElement, {
        scale: 2, // Haute qualité
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        width: apercuElement.scrollWidth,
        height: apercuElement.scrollHeight,
        onclone: function(clonedDoc) {
            // Masquer les boutons d'action dans le clone
            const buttons = clonedDoc.querySelectorAll('.no-print');
            buttons.forEach(btn => btn.style.display = 'none');
        }
    }).then(canvas => {
        // Convertir en JPG
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Télécharger l'image
        const fileName = `devis_${currentDevisData.reference}_${new Date().toISOString().split('T')[0]}.jpg`;
        telechargerImage(imageData, fileName);
        
        afficherAlerte('Devis exporté en JPG avec succès!', 'success');
        console.log('✅ Devis exporté en image:', fileName);
    }).catch(error => {
        console.error('❌ Erreur lors de l\'export image:', error);
        afficherAlerte('Erreur lors de l\'exportation', 'error');
    });
}

/**
 * Exporte la facture en image JPG
 */
function exporterFactureEnImage() {
    console.log('📸 Début export facture en image...');
    
    if (!currentDevisData) {
        afficherAlerte('Veuillez d\'abord générer une facture', 'error');
        return;
    }

    const apercuElement = document.getElementById('apercuFacture');
    if (!apercuElement || apercuElement.style.display === 'none') {
        afficherAlerte('Aucun aperçu de facture à exporter', 'error');
        return;
    }

    // Afficher le chargement
    afficherAlerte('Génération de l\'image en cours...', 'info');

    // Utiliser html2canvas pour capturer l'aperçu
    html2canvas(apercuElement, {
        scale: 2, // Haute qualité
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        width: apercuElement.scrollWidth,
        height: apercuElement.scrollHeight,
        onclone: function(clonedDoc) {
            // Masquer les boutons d'action dans le clone
            const buttons = clonedDoc.querySelectorAll('.no-print');
            buttons.forEach(btn => btn.style.display = 'none');
        }
    }).then(canvas => {
        // Convertir en JPG
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Télécharger l'image
        const fileName = `facture_${currentDevisData.referenceFacture}_${new Date().toISOString().split('T')[0]}.jpg`;
        telechargerImage(imageData, fileName);
        
        afficherAlerte('Facture exportée en JPG avec succès!', 'success');
        console.log('✅ Facture exportée en image:', fileName);
    }).catch(error => {
        console.error('❌ Erreur lors de l\'export image:', error);
        afficherAlerte('Erreur lors de l\'exportation', 'error');
    });
}

/**
 * Fonction utilitaire pour télécharger une image
 */
function telechargerImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exporte l'élément HTML spécifique en image
 */
function exporterElementEnImage(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ Élément non trouvé:', elementId);
        return;
    }

    html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
    }).then(canvas => {
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        telechargerImage(imageData, filename);
        afficherAlerte('Image exportée avec succès!', 'success');
    });
}

// Génération HTML pour le devis
function genererHTMLDevis(devisData) {
    // Calculer le total
    const total = devisData.services.reduce((sum, service) => sum + (service.sousTotal || 0), 0);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devis ${devisData.reference}</title>
  <link rel="stylesheet" href="assets/css/bootstrap-icons.css">
  <style>
   @page {
  margin: 10mm;
  size: A4;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #fff;
  color: #2c3e50;
  line-height: 1.4;
  font-size: 12px;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
}

.page-break {
  page-break-before: always;
  break-before: page;
}

.avoid-break {
  page-break-inside: avoid;
  break-inside: avoid;
}

h1, h2, h3, h4 {
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

h1 { 
  font-size: 22px; 
  margin-bottom: 8px;
}
h2 { 
  font-size: 18px; 
  margin-bottom: 6px;
}
h3 { 
  font-size: 16px; 
  margin-bottom: 5px;
}
h4 { 
  font-size: 14px; 
  margin-bottom: 4px;
}

.header, .footer {
  border-top: 4px solid #2c3e50;
  border-bottom: 4px solid #2c3e50;
  padding: 15px 0;
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.header h1 {
  font-size: 24px;
  margin-bottom: 5px;
  color: #2c3e50;
}

.header p {
  margin: 3px 0;
  font-size: 12px;
  color: #555;
}

.section {
  margin-top: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.compact-section {
  margin-top: 12px;
  padding: 12px;
}

.info-table, .services-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 11px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.info-table td, .services-table th, .services-table td {
  border: 1px solid #ddd;
  padding: 8px 6px;
  text-align: left;
}

.info-table td {
  background: #fafafa;
}

.services-table th {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  font-weight: 600;
  font-size: 11px;
  padding: 10px 6px;
  text-align: center;
}

.services-table td {
  text-align: center;
  font-size: 11px;
  padding: 8px 6px;
  background: #fff;
}

.services-table td:first-child {
  text-align: left;
  font-weight: 500;
}

.services-table tr:nth-child(even) td {
  background: #f8f9fa;
}

.note {
  font-size: 11px;
  margin-top: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #2c3e50;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.note p {
  margin: 5px 0;
  line-height: 1.5;
}

.contact {
  margin-top: 20px;
  font-size: 11px;
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.contact p {
  margin: 3px 0;
}

.payment-methods {
  text-align: center;
  margin: 15px 0;
  padding: 15px;
}

.payment-logos {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 12px 0;
  flex-wrap: wrap;
}

.operator-logo {
  height: 30px;
  width: auto;
  filter: grayscale(100%);
  transition: all 0.3s ease;
}

.operator-logo:hover {
  filter: grayscale(0%);
  transform: scale(1.05);
}

.devis-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
}

.total-row {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%) !important;
  font-weight: 700;
  color: #155724;
  font-size: 12px;
}

.total-row td {
  border-color: #c3e6cb !important;
}

.payment-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.payment-method {
  background: white;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.payment-method:hover {
  border-color: #2c3e50;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.operator-name {
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 12px;
}

.operator-number {
  color: #e74c3c;
  font-weight: 700;
  font-size: 13px;
  margin: 8px 0;
  background: #fff5f5;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ffe3e3;
}

.account-info {
  font-size: 10px;
  color: #666;
  margin-top: 5px;
  line-height: 1.4;
}

.payment-instructions {
  background: linear-gradient(135deg, #e7f3ff 0%, #d1e7ff 100%);
  border: 2px solid #b3d9ff;
  border-radius: 6px;
  padding: 15px;
  margin: 20px 0;
  font-size: 11px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.conditions-list {
  margin: 15px 0;
  padding-left: 20px;
}

.conditions-list li {
  margin-bottom: 8px;
  font-size: 11px;
  line-height: 1.5;
}

.total-amount {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border: 2px solid #c3e6cb;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  margin: 15px 0;
  font-weight: 700;
  font-size: 16px;
  color: #155724;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* Styles pour l'impression */
@media print {
  .no-print {
    display: none !important;
  }
  
  .page-break {
    page-break-before: always;
  }
  
  body {
    font-size: 11px;
    background: white;
  }
  
  .header h1 {
    font-size: 22px;
  }
  
  .section {
    box-shadow: none;
    border: 1px solid #ddd;
  }
  
  .payment-methods-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  
  .payment-logos {
    gap: 15px;
  }
  
  .payment-section {
    border-width: 1px;
    box-shadow: none;
  }
  
  .operator-logo {
    filter: grayscale(100%);
  }
}

/* Réduction des marges pour économiser de l'espace */
.compact {
  margin-bottom: 10px;
}

.compact-p {
  margin: 4px 0;
  line-height: 1.4;
}

/* Améliorations pour la lisibilité sur mobile */
@media (max-width: 768px) {
  .devis-container {
    padding: 15px;
    max-width: 100%;
  }
  
  .payment-methods-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-logos {
    gap: 15px;
  }
  
  .operator-logo {
    height: 25px;
  }
}

/* Styles pour les totaux */
.subtotal {
  background: #f8f9fa !important;
  font-weight: 600;
}

.grand-total {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%) !important;
  color: white;
  font-weight: 700;
  font-size: 13px;
}

.grand-total td {
  border-color: #2c3e50 !important;
}

/* Badges et états */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-paid {
  background: #d4edda;
  color: #155724;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-overdue {
  background: #f8d7da;
  color: #721c24;
}
    }
  </style>
</head>
<body>

  <!-- PREMIÈRE PAGE : DEVIS -->
  <div class="devis-container">
    <div class="header avoid-break">
      <h1>${entreprise.nom}</h1>
      <p class="compact-p">Saisie & Conception Graphique Professionnelle</p>
      <p class="compact-p">${entreprise.email} | ${entreprise.telephone}</p>
    </div>

    <div class="section avoid-break">
      <h2>Devis N° ${devisData.reference}</h2>
      <table class="info-table">
        <tr>
          <td><strong><i class="bi bi-person"></i> Client :</strong> ${devisData.client}</td>
          <td><strong><i class="bi bi-calendar"></i> Date :</strong> ${devisData.date}</td>
        </tr>
        <tr>
          <td><strong><i class="bi bi-phone"></i> Contact :</strong> ${devisData.contact || 'Non spécifié'}</td>
          <td><strong><i class="bi bi-clock"></i> Délai :</strong> ${devisData.duree}</td>
        </tr>
      </table>
    </div>

    <div class="section avoid-break">
      <h3>Détails des prestations</h3>
      <table class="services-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantité</th>
            <th>Prix Unitaire</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${devisData.services.map(service => `
            <tr>
              <td>${service.nom}</td>
              <td>${service.quantite} ${service.unite}</td>
              <td>${service.prixUnitaire.toLocaleString('fr-FR')} Ar</td>
              <td>${service.sousTotal.toLocaleString('fr-FR')} Ar</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3" style="text-align:right;"><strong>ESTIMATION</strong></td>
            <td><strong>${total.toLocaleString('fr-FR')} Ar</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="note avoid-break">
      <p class="compact-p"><strong><i class="bi bi-info-circle"></i> Conditions générales :</strong></p>
      <p class="compact-p"><i class="bi bi-check-circle"></i> Fichiers sources après validation du paiement</p>
      <p class="compact-p"><i class="bi bi-check-circle"></i> Aucun acompte - Paiement à la livraison</p>
      <p class="compact-p"><i class="bi bi-check-circle"></i> Aperçu avant règlement final</p>
      <p class="compact-p"><i class="bi bi-check-circle"></i> Service après-vente inclus</p>
    </div>

    <div class="footer contact avoid-break">
      <p class="compact-p">Document généré le ${devisData.date} - ${entreprise.nom}</p>
      <p class="compact-p"><i class="bi bi-telephone"></i> ${entreprise.telephone}</p>
    </div>
  </div>

  <!-- DEUXIÈME PAGE : INFORMATIONS DE PAIEMENT -->
  <div class="page-break"></div>

  <div class="devis-container">
    <div class="header">
      <h1>${entreprise.nom}</h1>
      <p class="compact-p">Informations de Paiement</p>
      <p class="compact-p">Devis N° ${devisData.reference} - Client: ${devisData.client}</p>
    </div>

    <div class="payment-section">
      <h3><i class="bi bi-credit-card"></i> Modes de paiement acceptés</h3>
      <div class="payment-logos">
        <div>
          <img src="assets/image/logo-mvola.png" class="operator-logo" alt="Mvola">
        </div>
        <div>
          <img src="assets/image/logo-airtelmoney.png" class="operator-logo" alt="Airtel Money">
        </div>
        <div>
          <img src="assets/image/logo-orangemoney.png" class="operator-logo" alt="Orange Money">
        </div>
      </div>
      </div>
    </div>

    <div class="note compact">
      <h4><i class="bi bi-shield-check"></i> Conditions de Livraison</h4>
      <ul class="conditions-list">
        <li>Fichiers sources après validation du paiement</li>
        <li>Aucun acompte - Paiement à la livraison</li>
        <li>Délai de traitement : ${devisData.duree}</li>
        <li>Support après-vente inclus</li>
        <li>Traitement confidentiel des documents</li>
        <li>Aperçu avant règlement final</li>
      </ul>
    </div>

    <div class="footer contact">
      <p class="compact-p">Pour toute question, contactez-nous :</p>
      <p class="compact-p"><i class="bi bi-telephone"></i> ${entreprise.telephone}</p>
      <p class="compact-p"><i class="bi bi-envelope"></i> ${entreprise.email} | <i class="bi bi-whatsapp"></i> ${entreprise.whatsapp}</p>
      <p class="compact-p" style="color: #7f8c8d; font-size: 9px;">
        Merci pour votre confiance ! Service de qualité garanti.
      </p>
    </div>
  </div>

  <!-- BOUTONS D'ACTION (visible seulement à l'écran) -->
  <div class="no-print" style="text-align: center; margin-top: 20px; padding: 15px;">
    <div class="d-flex flex-wrap justify-content-center gap-2">
      <button onclick="window.print()" class="btn btn-success btn-sm">
        <i class="bi bi-printer me-1"></i>Imprimer
      </button>
      <button onclick="allerVersFacture()" class="btn btn-primary btn-sm">
        <i class="bi bi-credit-card me-1"></i>Facture
      </button>
      <button onclick="fermerApercuDevis()" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-x me-1"></i>Fermer
      </button>
      // Dans la section des boutons d'action, ajoutez ce bouton :
<div class="no-print" style="text-align: center; margin-top: 20px; padding: 15px;">
    <div class="d-flex flex-wrap justify-content-center gap-2">
        <button onclick="window.print()" class="btn btn-success btn-sm">
            <i class="bi bi-printer me-1"></i>Imprimer
        </button>
        <!-- AJOUTEZ CE BOUTON -->
        <button onclick="exporterDevisEnImage()" class="btn btn-info btn-sm">
            <i class="bi bi-image me-1"></i>Exporter en JPG
        </button>
        <button onclick="allerVersFacture()" class="btn btn-primary btn-sm">
            <i class="bi bi-credit-card me-1"></i>Facture
        </button>
        <button onclick="fermerApercuDevis()" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-x me-1"></i>Fermer
        </button>
            </div>
        </div>
    </div>
  </div>

</body>
</html>
    `;
}
// Fonctions pour la gestion de la facture
function togglePaiementDetails() {
    const statutPaiement = getValue('statutPaiement');
    const refSection = getElement('refPaiementSection');
    const mobileSection = getElement('mobileMoneySection');
    
    if (!refSection || !mobileSection) {
        console.log('ℹ️ Sections de paiement non trouvées');
        return;
    }
    
    if (statutPaiement === 'paye') {
        refSection.style.display = 'block';
        mobileSection.style.display = 'none';
    } else {
        refSection.style.display = 'none';
        mobileSection.style.display = 'block';
    }
    
    console.log('✅ Affichage des détails de paiement mis à jour');
}

function fermerApercuDevis() {
    const apercuElement = document.getElementById('apercuDevis');
    if (apercuElement) {
        apercuElement.style.display = 'none';
        console.log('👁️ Aperçu du devis fermé');
    }
}

function genererFactureFinale() {
    if (!currentDevisData) {
        afficherAlerte('Veuillez d\'abord générer un devis', 'error');
        return;
    }

    const statutPaiement = getValue('statutPaiement');
    const statutLivraison = getValue('statutLivraison');
    const referencePaiement = getValue('refPaiement');

    // Mettre à jour les données avec le statut de paiement
    currentDevisData.statutPaiement = statutPaiement;
    currentDevisData.statutLivraison = statutLivraison;
    currentDevisData.referencePaiement = referencePaiement;

    // Générer l'aperçu HTML de la facture
    const factureHTML = genererHTMLFacture(currentDevisData);
    
    const apercu = getElement('apercuFacture');
    if (apercu) {
        apercu.innerHTML = factureHTML;
        apercu.style.display = 'block';
    }

    afficherAlerte('Facture finale générée avec succès !', 'success');
}

function genererHTMLFacture(factureData) {
    const estPaye = factureData.statutPaiement === 'paye';
    const total = factureData.services.reduce((sum, service) => sum + (service.sousTotal || 0), 0);
    const nombreServices = factureData.services.length;

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${factureData.referenceFacture}</title>
  <link rel="stylesheet" href="assets/css/bootstrap-icons.css">
 <style>
    @page {
        margin: 5mm;
        size: A4;
    }
    
    body {
        font-family: Arial, Helvetica, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #fff;
        color: #000;
        line-height: 1.4;
        font-size: 28px; /* Taille augmentée pour mobile */
        width: 100%;
        max-width: 100%;
        -webkit-text-size-adjust: 100%;
    }

    .page-break {
        page-break-before: always;
        break-before: page;
    }

    .avoid-break {
        page-break-inside: avoid;
        break-inside: avoid;
    }

    h1, h2, h3 {
        color: #000;
        margin: 0;
        page-break-after: avoid;
        font-weight: bold;
    }

    h1 { 
        font-size: 40px; 
        margin-bottom: 8px;
    }
    h2 { 
        font-size: 36px; 
        margin-bottom: 6px;
    }
    h3 { 
        font-size: 32px; 
        margin-bottom: 4px;
    }

    .header, .footer {
        border-top: 2px solid #000;
        border-bottom: 2px solid #000;
        padding: 12px 0;
        text-align: center;
        page-break-inside: avoid;
        margin-bottom: 15px;
    }

    .header h1 {
        font-size: 44px;
        margin-bottom: 5px;
    }

    .header p {
        margin: 3px 0;
        font-size: 13px;
    }

    .section {
        margin-top: 15px;
        page-break-inside: avoid;
        width: 100%;
    }

    .compact-section {
        margin-top: 12px;
        page-break-inside: avoid;
    }

    /* Tables simplifiées comme JIRAMA */
    .info-table, .services-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 28px; /* Taille augmentée */
        page-break-inside: avoid;
    }

    .info-table td, .services-table th, .services-table td {
        border: 1px solid #000;
        padding: 8px 6px; /* Padding augmenté */
        text-align: left;
        vertical-align: top;
    }

    .services-table th {
        background-color: #000;
        color: white;
        font-weight: bold;
        font-size: 28px;
        padding: 10px 6px;
    }

    .services-table td {
        text-align: left;
        font-size: 28px;
    }

    /* Style spécifique pour les données importantes */
    .montant-important {
        font-size: 16px;
        font-weight: bold;
        color: #000;
        background-color: #f8f9fa;
        padding: 10px;
        border: 2px solid #000;
    }

    .total-row {
        background-color: #e9ecef;
        font-weight: bold;
        font-size: 28px;
    }

    .payment-section {
        background: #fff;
        border: 2px solid #000;
        border-radius: 0; /* Style plus carré comme JIRAMA */
        padding: 15px;
        margin: 15px 0;
        page-break-inside: avoid;
    }

    .payment-methods-grid {
        display: block; /* Passer en block pour mobile */
        margin: 12px 0;
    }

    .payment-method {
        background: white;
        padding: 12px;
        border: 1px solid #000;
        border-radius: 0;
        text-align: center;
        margin-bottom: 10px;
        page-break-inside: avoid;
    }

    .operator-logo {
        height: 35px; /* Légèrement plus grand */
        margin-bottom: 10px;
    }

    .operator-name {
        font-weight: bold;
        color: #000;
        margin-bottom: 5px;
        font-size: 14px;
    }

    .operator-number {
        color: #000;
        font-weight: bold;
        font-size: 15px;
        margin: 5px 0;
    }

    .account-info {
        font-size: 12px;
        color: #000;
        margin-top: 5px;
    }

    .facture-container {
        max-width: 100%; /* Pleine largeur */
        margin: 0 auto;
        padding: 10px;
        box-sizing: border-box;
    }

    .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 3px;
        font-size: 12px;
        font-weight: bold;
        margin-left: 8px;
    }

    .status-paye {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #155724;
    }

    .status-attente {
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #856404;
    }

    .status-livre {
        background-color: #cce7ff;
        color: #004085;
        border: 1px solid #004085;
    }

    .conditions {
        background: #fff;
        border: 2px solid #000;
        border-radius: 0;
        padding: 15px;
        margin: 15px 0;
        page-break-inside: avoid;
        font-size: 13px;
    }

    .conditions ul {
        margin: 10px 0;
        padding-left: 20px;
    }

    .conditions li {
        margin-bottom: 5px;
        font-size: 13px;
    }

    .payment-note {
        background: #fff;
        border: 1px solid #000;
        border-radius: 0;
        padding: 12px;
        margin-top: 15px;
        font-size: 13px;
    }

    .contact {
        margin-top: 20px;
        font-size: 13px;
        text-align: center;
        page-break-before: avoid;
        border-top: 1px solid #000;
        padding-top: 15px;
    }

    .contact p {
        margin: 4px 0;
    }

    /* Styles spécifiques pour la lisibilité mobile */
    .mobile-optimized {
        width: 100%;
        box-sizing: border-box;
    }

    .text-important {
        font-size: 16px;
        font-weight: bold;
        margin: 10px 0;
    }

    .text-secondary {
        font-size: 13px;
        color: #000;
    }

    /* Pour les longs contenus dans les cellules */
    .break-word {
        word-break: break-word;
        overflow-wrap: break-word;
    }

    /* Espacement amélioré */
    .spacing-sm { margin-bottom: 5px; }
    .spacing-md { margin-bottom: 10px; }
    .spacing-lg { margin-bottom: 15px; }

    /* Alignement spécifique pour les montants */
    .align-right {
        text-align: right;
    }

    .align-center {
        text-align: center;
    }

    /* Style pour les lignes de séparation */
    .separator {
        border-top: 1px solid #000;
        margin: 10px 0;
    }

    /* Media query pour l'impression */
    @media print {
        body {
            font-size: 13px;
        }
        
        .header, .footer {
            border-color: #000;
        }
        
        .services-table th {
            background-color: #000 !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }

    /* Media query pour mobile */
    @media screen and (max-width: 768px) {
        body {
            font-size: 16px; /* Plus grand sur mobile */
            padding: 5px;
        }
        
        .facture-container {
            padding: 5px;
        }
        
        h1 { font-size: 22px; }
        h2 { font-size: 20px; }
        h3 { font-size: 18px; }
        
        .services-table, .info-table {
            font-size: 14px;
        }
        
        .montant-important {
            font-size: 18px;
        }
    }
</style>
</head>
<body>

  <div class="facture-container">
    
    <!-- PREMIÈRE PAGE -->
    <div class="header avoid-break">
      <h1>${entreprise.nom}</h1>
      <p>Saisie & Conception Graphique Professionnelle</p>
      <p>${entreprise.email} | ${entreprise.telephone}</p>
    </div>

    <div class="section avoid-break">
      <h2>Facture N° ${factureData.referenceFacture}</h2>
      <table class="info-table">
        <tr>
          <td><strong><i class="bi bi-person"></i> Client :</strong> ${factureData.client}</td>
          <td><strong><i class="bi bi-calendar"></i> Date :</strong> ${factureData.date}</td>
        </tr>
        <tr>
          <td><strong><i class="bi bi-phone"></i> Contact :</strong> ${factureData.contact || 'Non spécifié'}</td>
          <td>
            <strong><i class="bi bi-clock"></i> Délai :</strong> ${factureData.duree}
            <span class="status-badge ${factureData.statutLivraison === 'livre' ? 'status-livre' : 'status-attente'}">
              ${factureData.statutLivraison === 'livre' ? 'LIVRÉ' : 'EN COURS'}
            </span>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <strong><i class="bi bi-credit-card"></i> Statut Paiement :</strong> 
            <span class="status-badge ${estPaye ? 'status-paye' : 'status-attente'}">
              ${estPaye ? 'PAYÉ' : 'EN ATTENTE DE PAIEMENT'}
            </span>
            ${factureData.referencePaiement ? ` - Référence: ${factureData.referencePaiement}` : ''}
          </td>
        </tr>
      </table>
    </div>

    <div class="section ${nombreServices > 6 ? 'keep-together' : ''}">
      <h3><i class="bi bi-list-check"></i> Détails des prestations</h3>
      <div class="table-container">
        <table class="services-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantité</th>
              <th>Prix Unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${factureData.services.map(service => `
              <tr>
                <td>${service.nom}</td>
                <td>${service.quantite} ${service.unite}</td>
                <td>${service.prixUnitaire.toLocaleString('fr-FR')} Ar</td>
                <td>${service.sousTotal.toLocaleString('fr-FR')} Ar</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" style="text-align:right;"><strong>TOTAL ${estPaye ? 'PAYÉ' : 'À PAYER'}</strong></td>
              <td>
                <strong>${total.toLocaleString('fr-FR')} Ar</strong>
                ${estPaye ? '<div class="status-badge status-paye" style="margin-top: 3px;">✓ PAIEMENT CONFIRMÉ</div>' : ''}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    ${!estPaye && nombreServices <= 6 ? `
    <div class="payment-section avoid-break">
      <h3><i class="bi bi-credit-card-2-front"></i> Paiement par Mobile Money</h3>
      <p style="margin: 0 0 12px 0; font-size: 11px;">Veuillez effectuer le paiement via l'un des opérateurs suivants :</p>
      
      <div class="payment-methods-grid">
        <!-- Mvola -->
        <div class="payment-method">
          <img src="assets/image/logo-mvola.png" class="operator-logo" alt="Mvola">
          <div class="operator-name">Mvola</div>
          <div class="operator-number">${entreprise.mobileMoney.mvola}</div>
          <div class="account-info">Compte au nom de Ismael Randrianasoavina</div>
        </div>
        
        <!-- Airtel Money -->
        <div class="payment-method">
          <img src="assets/image/logo-airtelmoney.png" class="operator-logo" alt="Airtel Money">
          <div class="operator-name">Airtel Money</div>
          <div class="operator-number">${entreprise.mobileMoney.airtel}</div>
          <div class="account-info">Compte au nom de Ismael Randrianasoavina</div>
        </div>
        
        <!-- Orange Money -->
        <div class="payment-method">
          <img src="assets/image/logo-orangemoney.png" class="operator-logo" alt="Orange Money">
          <div class="operator-name">Orange Money</div>
          <div class="operator-number">${entreprise.mobileMoney.orange}</div>
          <div class="account-info">Compte au nom de Ismael Randrianasoavina</div>
        </div>
      </div>

      <div class="payment-note">
        <p style="margin: 0; color: #004085;">
          <i class="bi bi-info-circle"></i> <strong>Important :</strong> Après paiement, veuillez nous communiquer la référence de transaction par WhatsApp au ${entreprise.whatsapp}
        </p>
      </div>
    </div>
    ` : ''}

    ${!estPaye && nombreServices > 6 ? `
    <!-- DEUXIÈME PAGE - Si beaucoup de services -->
    <div class="page-break"></div>
    
    <div class="payment-section">
      <h3><i class="bi bi-credit-card-2-front"></i> Paiement par Mobile Money</h3>
      <p style="margin: 0 0 12px 0; font-size: 11px;">Veuillez effectuer le paiement via l'un des opérateurs suivants :</p>
      
      <div class="payment-methods-grid">
        <!-- Mvola -->
        <div class="payment-method">
          <img src="assets/image/logo-mvola.png" class="operator-logo" alt="Mvola">
          <div class="operator-name">Mvola</div>
          <div class="operator-number">${entreprise.mobileMoney.mvola}</div>
          <div class="account-info">Compte au nom de Ismael Randrianasoavina</div>
        </div>
        
        <!-- Airtel Money -->
        <div class="payment-method">
          <img src="assets/image/logo-airtelmoney.png" class="operator-logo" alt="Airtel Money">
          <div class="operator-name">Airtel Money</div>
          <div class="operator-number">${entreprise.mobileMoney.airtel}</div>
          <div class="account-info">Compte au nom de Ismael Randrianasoavina</div>
        </div>
        
        <!-- Orange Money -->
        <div class="payment-method">
          <img src="assets/image/logo-orangemoney.png" class="operator-logo" alt="Orange Money">
          <div class="operator-name">Orange Money</div>
          <div class="operator-number">${entreprise.mobileMoney.orange}</div>
          <div class="account-info">Compte au nom de Ismael Randrianasoavina</div>
        </div>
      </div>

      <div class="payment-note">
        <p style="margin: 0; color: #004085;">
          <i class="bi bi-info-circle"></i> <strong>Important :</strong> Après paiement, veuillez nous communiquer la référence de transaction par WhatsApp au ${entreprise.whatsapp}
        </p>
      </div>
    </div>
    ` : ''}

    <div class="conditions avoid-break">
      <h3><i class="bi bi-shield-check"></i> Conditions Générales</h3>
      <ul>
        <li>Les fichiers sources sont envoyés après paiement complet</li>
        <li>Aucun acompte n'est obligatoire - Paiement à la livraison</li>
        <li>Droit de voir un aperçu avant paiement final</li>
        <li>Service après-vente gratuit inclus pour corrections mineures</li>
        <li>Durée de traitement estimée: ${factureData.duree}</li>
        <li>Support continu par WhatsApp: ${entreprise.whatsapp}</li>
        <li>Traitement confidentiel de tous vos documents</li>
      </ul>
    </div>

    <div class="footer contact avoid-break">
      <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} - ${entreprise.nom}</p>
      <p><i class="bi bi-telephone"></i> ${entreprise.telephone} | <i class="bi bi-envelope"></i> ${entreprise.email} | <i class="bi bi-whatsapp"></i> ${entreprise.whatsapp}</p>
      <p style="margin-top: 8px; font-size: 9px; color: #7f8c8d;">
        Merci pour votre confiance ! Pour toute question, contactez-nous sur WhatsApp.
      </p>
    </div>

  </div>

</body>
</html>
    `;
}

// Fonctions de réinitialisation
function reinitialiserDevis() {
    // Réinitialiser les champs client
    setValue('clientName', '');
    setValue('clientContact', '');
    
    // Réinitialiser tous les services
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        const details = cb.closest('.service-item')?.querySelector('.service-details');
        if (details) details.style.display = 'none';
    });
    
    // Réinitialiser tous les champs de saisie
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.value = '';
    });
    
    // Réinitialiser les sélecteurs de prix
    document.querySelectorAll('.price-select').forEach(select => {
        select.selectedIndex = 0;
    });
    
    // Réinitialiser la durée
    setValue('dureeTraitement', '3 jours');
    
    // Réinitialiser l'aperçu
    const apercu = getElement('apercuDevis');
    if (apercu) apercu.style.display = 'none';
    
    // Cacher le bouton d'export
    toggleBoutonExport(false);
    
    // Réinitialiser les données
    currentDevisData = null;
    
    // Recalculer le total
    calculerTotal();
    
    afficherAlerte('Devis réinitialisé', 'info');
}

function reinitialiserFacture() {
    // Réinitialiser les champs de facture
    setValue('statutPaiement', 'en-cours');
    setValue('statutLivraison', 'en-cours');
    setValue('refPaiement', '');
    
    // Réinitialiser l'aperçu
    const apercu = getElement('apercuFacture');
    if (apercu) apercu.style.display = 'none';
    
    // Mettre à jour l'affichage
    togglePaiementDetails();
    
    afficherAlerte('Facture réinitialisée', 'info');
}

function imprimerFacture() {
    const apercu = getElement('apercuFacture');
    if (!apercu || !apercu.innerHTML) {
        afficherAlerte('Aucun aperçu de facture à imprimer', 'error');
        return;
    }
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Facture ${currentDevisData?.referenceFacture || ''}</title>
        <meta charset="utf-8">
        <style>body{font-family: Arial, sans-serif; padding:20px;}</style>
        </head><body>${apercu.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
}

// Fonction pour exporter le devis en PDF
function exporterDevisPDF() {
    if (!currentDevisData) {
        afficherAlerte('Veuillez d\'abord générer un devis', 'error');
        return;
    }

    console.log('📤 Export PDF du devis:', currentDevisData);

    // Créer une fenêtre d'impression
    const printWindow = window.open('', '_blank');
    const date = new Date().toISOString().split('T')[0];
    const cleanClientName = currentDevisData.client.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const fileName = `Devis_${cleanClientName}_${date}`;

    // Générer le HTML pour l'export
    const exportHTML = genererHTMLDevis(currentDevisData);

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Devis - ${currentDevisData.client} - Multi-Services Numériques</title>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                    line-height: 1.4;
                    background: white;
                }
                .facture-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th {
                    background-color: #34495e !important;
                    color: white !important;
                    font-weight: bold !important;
                    padding: 12px !important;
                    text-align: left !important;
                }
                td {
                    padding: 12px !important;
                    border-bottom: 1px solid #ecf0f1 !important;
                }
                @media print {
                    body { 
                        margin: 0;
                        padding: 15px;
                        background: white;
                    }
                    .no-print { 
                        display: none !important; 
                    }
                    @page {
                        margin: 1cm;
                        size: A4;
                    }
                    .facture-container {
                        max-width: 100% !important;
                        margin: 0 !important;
                    }
                    table {
                        page-break-inside: avoid;
                    }
                }
                @media screen and (max-width: 768px) {
                    body {
                        padding: 10px;
                    }
                    table {
                        font-size: 12px;
                    }
                    th, td {
                        padding: 8px !important;
                    }
                }
            </style>
        </head>
        <body>
            ${exportHTML}
            <div style="text-align: center; margin-top: 30px; font-size: 0.8em; color: #666; border-top: 1px solid #ddd; padding-top: 20px;" class="no-print">
                Document généré le ${new Date().toLocaleDateString('fr-FR')} - Multi-Services Numériques<br>
                Tél: ${entreprise.telephone} | Email: ${entreprise.email} | WhatsApp: ${entreprise.whatsapp}
            </div>
            <script>
                document.title = "${fileName}";
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                    
                    window.onafterprint = function() {
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    };
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();

    afficherAlerte('Devis exporté en PDF avec succès', 'success');
}

// Fonction pour afficher/masquer le bouton d'export
function toggleBoutonExport(visible) {
    const btnExport = document.getElementById('btnExportDevis');
    if (btnExport) {
        btnExport.style.display = visible ? 'block' : 'none';
    }
}

// Fonctions pour la gestion des services personnalisés
function ajouterService() {
    // Le modal s'ouvre via data-bs-toggle
    console.log('📝 Ouverture du modal d\'ajout de service');
}

function ajouterServicePersonnalise() {
    const nom = getValue('customName');
    const desc = getValue('customDesc');
    const prix = parseInt(getValue('customPrice'));
    const quantite = parseInt(getValue('customQuantity')) || 1;
    const unite = getValue('customUnite') || 'unité';
    const categorie = getValue('customCategory');

    // Validation
    if (!nom || !prix || prix < 0) {
        afficherAlerte('Veuillez remplir le nom et le prix du service', 'error');
        return false;
    }

    // Créer un ID unique
    const slug = 'custom_' + Date.now();
    const serviceId = 'serviceCustom_' + slug;
    const qtyId = 'qtyCustom_' + slug;
    const priceId = 'priceCustom_' + slug;

    // HTML du service personnalisé
    const serviceHTML = `
        <div class="service-item custom-service card mb-3" id="serviceItem_${slug}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="form-check flex-grow-1">
                        <input class="form-check-input" type="checkbox" id="${serviceId}" 
                               onchange="toggleCustomService('${slug}')">
                        <label class="form-check-label fw-semibold" for="${serviceId}">
                            ${nom}
                            ${desc ? `<br><small class="text-muted">${desc}</small>` : ''}
                        </label>
                    </div>
                    <button type="button" class="btn btn-outline-danger btn-sm ms-2" 
                            onclick="supprimerServicePersonnalise('${slug}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="service-details" id="details_${slug}" style="display: none;">
                    <div class="row g-2 align-items-center">
                        <div class="col-md-4">
                            <label class="form-label small mb-1">Quantité</label>
                            <input type="number" id="${qtyId}" class="form-control form-control-sm" 
                                   value="${quantite}" min="1" oninput="calculerTotal()">
                        </div>
                        <div class="col-md-5">
                            <label class="form-label small mb-1">Prix unitaire (Ar)</label>
                            <input type="number" id="${priceId}" class="form-control form-control-sm" 
                                   value="${prix}" min="0" oninput="calculerTotal()">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small mb-1">Unité</label>
                            <input type="text" class="form-control form-control-sm" value="${unite}" readonly>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter au conteneur approprié
    let container;
    switch(categorie) {
        case 'conception':
        case 'affiche':
            container = document.querySelector('#devis .col-lg-8 .row:last-child .col-md-6:last-child');
            break;
        case 'autre':
            container = document.getElementById('customServicesList');
            break;
        default:
            container = document.querySelector('#devis .col-lg-8 .row:last-child .col-md-6:first-child');
    }

    if (container) {
        container.insertAdjacentHTML('beforeend', serviceHTML);
    }

    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAddService'));
    if (modal) modal.hide();

    // Réinitialiser le formulaire
    document.getElementById('formAddService').reset();

    afficherAlerte(`Service "${nom}" ajouté avec succès!`, 'success');
    
    return slug;
}

function toggleCustomService(slug) {
    const checkbox = document.getElementById('serviceCustom_' + slug);
    const details = document.getElementById('details_' + slug);
    
    if (checkbox && details) {
        details.style.display = checkbox.checked ? 'block' : 'none';
        calculerTotal();
    }
}

function supprimerServicePersonnalise(slug) {
    const serviceElement = document.getElementById('serviceItem_' + slug);
    if (serviceElement) {
        serviceElement.remove();
        calculerTotal();
        afficherAlerte('Service personnalisé supprimé', 'info');
    }
}

// Vérification des boutons au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Vérification des boutons...');
    
    // Vérifier que les boutons existent
    const btnGenerer = document.querySelector('button[onclick="genererDevis()"]');
    const btnReinitialiser = document.querySelector('button[onclick="reinitialiserDevis()"]');
    const btnExport = document.getElementById('btnExportDevis');
    
    console.log('Bouton Générer:', btnGenerer);
    console.log('Bouton Réinitialiser:', btnReinitialiser);
    console.log('Bouton Export:', btnExport);
    
    // Forcer l'affichage des boutons
    if (btnGenerer) btnGenerer.style.display = 'block';
    if (btnReinitialiser) btnReinitialiser.style.display = 'block';
    if (btnExport) btnExport.style.display = 'none';
});

// =============================================
// FONCTIONS POUR L'INTERFACE ÉTAPE PAR ÉTAPE
// =============================================

let currentStep = 1;

function initialiserInterfaceEtapes() {
    console.log('🎯 Initialisation de l\'interface étape par étape...');
    
    // Mapping des services pour afficher/masquer les détails
    const servicesMapping = {
        'Saisie': 'saisie-details',
        'MiseEnForme': 'mise-en-forme-details',
        'Tableau': 'tableaux-details',
        'Figure': 'figure-details',
        'Graphique': 'graphique-details',
        'Logo': 'logo-details',
        'Vector': 'vector-details'
    };
    
    // Forcer l'affichage des détails pour les services cochés
    setTimeout(() => {
        Object.entries(servicesMapping).forEach(([service, detailsId]) => {
            const checkbox = document.getElementById(`service${service}`);
            if (checkbox) {
                const details = document.getElementById(detailsId);
                if (details) {
                    details.style.display = checkbox.checked ? 'block' : 'none';
                }
            }
        });
    }, 100);
    
    // Gestion des cases à cocher
    Object.entries(servicesMapping).forEach(([service, detailsId]) => {
        const checkbox = document.getElementById(`service${service}`);
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                const details = document.getElementById(detailsId);
                if (details) {
                    details.style.display = this.checked ? 'block' : 'none';
                    
                    // Initialiser la valeur à 1 si coché
                    if (this.checked) {
                        const inputs = details.querySelectorAll('input[type="number"]');
                        inputs.forEach(input => {
                            if (!input.value || input.value === '0') {
                                input.value = '1';
                            }
                        });
                    }
                }
                calculerTotalComplet();
            });
        }
    });
    
    // Gestion spécifique pour les affiches
    ['AfficheBasique', 'AfficheStandard', 'AffichePro'].forEach(service => {
        const checkbox = document.getElementById(`service${service}`);
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                const input = document.getElementById(`nb${service}`);
                if (input) {
                    input.style.display = this.checked ? 'block' : 'none';
                    if (this.checked && (!input.value || input.value === '0')) {
                        input.value = '1';
                    }
                }
                calculerTotalComplet();
            });
        }
    });
    
    // Écouteurs pour les champs de saisie améliorés
    document.querySelectorAll('.pages-saisie-simple, .pages-saisie-standard, .pages-saisie-complexe, .pages-mise-basique, .pages-mise-standard, .pages-mise-avancee').forEach(input => {
        input.addEventListener('input', function() {
            calculerSousTotauxSaisie();
            calculerTotalComplet();
        });
    });
    
    // Écouteurs pour tous les autres champs numériques
    document.querySelectorAll('input[type="number"]').forEach(element => {
        if (!element.classList.contains('pages-saisie-simple') && 
            !element.classList.contains('pages-saisie-standard') && 
            !element.classList.contains('pages-saisie-complexe') &&
            !element.classList.contains('pages-mise-basique') &&
            !element.classList.contains('pages-mise-standard') &&
            !element.classList.contains('pages-mise-avancee')) {
            element.addEventListener('input', calculerTotalComplet);
        }
    });
    
    // Écouteurs pour les sélecteurs de prix
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', calculerTotalComplet);
    });
    
    console.log('✅ Interface étape par étape initialisée');
}

function calculerSousTotauxSaisie() {
    // SAISIE DOCUMENT
    const pagesSimple = parseInt(document.querySelector('.pages-saisie-simple')?.value) || 0;
    const pagesStandard = parseInt(document.querySelector('.pages-saisie-standard')?.value) || 0;
    const pagesComplexe = parseInt(document.querySelector('.pages-saisie-complexe')?.value) || 0;
    
    const sousTotalSimple = pagesSimple * 500;
    const sousTotalStandard = pagesStandard * 700;
    const sousTotalComplexe = pagesComplexe * 1000;
    const totalSaisie = sousTotalSimple + sousTotalStandard + sousTotalComplexe;
    
    // Mise à jour des affichages saisie
    const sousTotalSimpleEl = document.querySelector('.sous-total-simple');
    const sousTotalStandardEl = document.querySelector('.sous-total-standard');
    const sousTotalComplexeEl = document.querySelector('.sous-total-complexe');
    const totalSaisieEl = document.querySelector('.total-saisie');
    
    if (sousTotalSimpleEl) sousTotalSimpleEl.textContent = sousTotalSimple.toLocaleString('fr-FR') + ' Ar';
    if (sousTotalStandardEl) sousTotalStandardEl.textContent = sousTotalStandard.toLocaleString('fr-FR') + ' Ar';
    if (sousTotalComplexeEl) sousTotalComplexeEl.textContent = sousTotalComplexe.toLocaleString('fr-FR') + ' Ar';
    if (totalSaisieEl) totalSaisieEl.textContent = totalSaisie.toLocaleString('fr-FR') + ' Ar';
    
    // MISE EN FORME
    const pagesBasique = parseInt(document.querySelector('.pages-mise-basique')?.value) || 0;
    const pagesMiseStandard = parseInt(document.querySelector('.pages-mise-standard')?.value) || 0;
    const pagesAvancee = parseInt(document.querySelector('.pages-mise-avancee')?.value) || 0;
    
    const sousTotalBasique = pagesBasique * 300;
    const sousTotalMiseStandard = pagesMiseStandard * 400;
    const sousTotalAvancee = pagesAvancee * 600;
    const totalMiseForme = sousTotalBasique + sousTotalMiseStandard + sousTotalAvancee;
    
    // Mise à jour des affichages mise en forme
    const sousTotalBasiqueEl = document.querySelector('.sous-total-basique');
    const sousTotalMiseStandardEl = document.querySelector('.sous-total-mise-standard');
    const sousTotalAvanceeEl = document.querySelector('.sous-total-avancee');
    const totalMiseFormeEl = document.querySelector('.total-mise-forme');
    
    if (sousTotalBasiqueEl) sousTotalBasiqueEl.textContent = sousTotalBasique.toLocaleString('fr-FR') + ' Ar';
    if (sousTotalMiseStandardEl) sousTotalMiseStandardEl.textContent = sousTotalMiseStandard.toLocaleString('fr-FR') + ' Ar';
    if (sousTotalAvanceeEl) sousTotalAvanceeEl.textContent = sousTotalAvancee.toLocaleString('fr-FR') + ' Ar';
    if (totalMiseFormeEl) totalMiseFormeEl.textContent = totalMiseForme.toLocaleString('fr-FR') + ' Ar';
}

function calculerTotalComplet() {
    let total = 0;
    
    // Saisie document
    const serviceSaisie = document.getElementById('serviceSaisie');
    if (serviceSaisie && serviceSaisie.checked) {
        const pagesSimple = parseInt(document.querySelector('.pages-saisie-simple')?.value) || 0;
        const pagesStandard = parseInt(document.querySelector('.pages-saisie-standard')?.value) || 0;
        const pagesComplexe = parseInt(document.querySelector('.pages-saisie-complexe')?.value) || 0;
        total += (pagesSimple * 500) + (pagesStandard * 700) + (pagesComplexe * 1000);
    }
    
    // Mise en forme
    const serviceMiseEnForme = document.getElementById('serviceMiseEnForme');
    if (serviceMiseEnForme && serviceMiseEnForme.checked) {
        const pagesBasique = parseInt(document.querySelector('.pages-mise-basique')?.value) || 0;
        const pagesMiseStandard = parseInt(document.querySelector('.pages-mise-standard')?.value) || 0;
        const pagesAvancee = parseInt(document.querySelector('.pages-mise-avancee')?.value) || 0;
        total += (pagesBasique * 300) + (pagesMiseStandard * 400) + (pagesAvancee * 600);
    }
    
    // Tableaux
    const serviceTableau = document.getElementById('serviceTableau');
    if (serviceTableau && serviceTableau.checked) {
        const nbTableaux = parseInt(document.getElementById('nbTableaux')?.value) || 0;
        const prixTableau = parseInt(document.getElementById('prixTableau')?.value) || 1000;
        total += nbTableaux * prixTableau;
    }
    
    // Services avec prix fixes
    const servicesFixes = [
        { id: 'serviceFigure', qtyId: 'nbFigures', prix: 1500 },
        { id: 'serviceGraphique', qtyId: 'nbGraphiques', prix: 1500 },
        { id: 'serviceLogo', qtyId: 'nbLogos', prix: 50000 },
        { id: 'serviceVector', qtyId: 'nbVectors', prix: 25000 },
        { id: 'serviceAfficheBasique', qtyId: 'nbAffichesBasique', prix: 10000 },
        { id: 'serviceAfficheStandard', qtyId: 'nbAffichesStandard', prix: 20000 },
        { id: 'serviceAffichePro', qtyId: 'nbAffichesPro', prix: 30000 }
    ];

    servicesFixes.forEach(service => {
        const serviceEl = document.getElementById(service.id);
        if (serviceEl && serviceEl.checked) {
            const qtyEl = document.getElementById(service.qtyId);
            const nb = qtyEl ? parseInt(qtyEl.value) || 0 : 0;
            total += nb * service.prix;
        }
    });
    
    // Services personnalisés
    document.querySelectorAll('.custom-service').forEach(serviceElement => {
        const checkbox = serviceElement.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            const serviceId = serviceElement.id;
            const qtyInput = document.getElementById(`qty${serviceId}`);
            const priceInput = document.getElementById(`price${serviceId}`);
            
            if (qtyInput && priceInput) {
                const quantite = parseInt(qtyInput.value) || 0;
                const prix = parseInt(priceInput.value) || 0;
                total += quantite * prix;
            }
        }
    });
    
    // Mise à jour de l'affichage du total
    const totalElement = document.getElementById('recap-total');
    if (totalElement) {
        totalElement.textContent = total.toLocaleString('fr-FR') + ' Ar';
    }
    
    return total;
}

function showStep(step) {
    console.log(`📱 Navigation vers l'étape: ${step}`);
    
    // Masquer toutes les étapes
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Afficher l'étape courante
    const stepContent = document.querySelector(`.step-content[data-step="${step}"]`);
    if (stepContent) {
        stepContent.classList.add('active');
    }
    
    // Mettre à jour la progress bar
    document.querySelectorAll('.step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    document.querySelectorAll(`.step[data-step="${step}"]`).forEach(stepEl => {
        stepEl.classList.add('active');
    });
    
    // Mettre à jour les étapes précédentes
    for (let i = 1; i < step; i++) {
        document.querySelectorAll(`.step[data-step="${i}"]`).forEach(stepEl => {
            stepEl.classList.add('active');
        });
    }
    
    currentStep = step;
    
    // Actions spécifiques par étape
    if (step === 4) {
        updateRecap();
    }
}

function nextStep(step) {
    console.log(`➡️ Passage de l'étape ${currentStep} à l'étape ${step}`);
    if (validateStep(currentStep)) {
        showStep(step);
    }
}

function prevStep(step) {
    console.log(`⬅️ Retour de l'étape ${currentStep} à l'étape ${step}`);
    showStep(step);
}

function validateStep(step) {
    console.log(`✓ Validation de l'étape ${step}`);
    switch(step) {
        case 1:
            const clientName = document.getElementById('clientName');
            if (clientName && !clientName.value.trim()) {
                alert('Veuillez saisir le nom du client');
                clientName.focus();
                return false;
            }
            return true;
        default:
            return true;
    }
}

function updateRecap() {
    console.log('📊 Mise à jour du récapitulatif...');
    
    const clientName = document.getElementById('clientName')?.value || 'Non spécifié';
    const clientContact = document.getElementById('clientContact')?.value || 'Non spécifié';
    const duree = document.getElementById('dureeTraitement')?.value || 'Non spécifié';
    
    const recapClient = document.getElementById('recap-client');
    if (recapClient) {
        recapClient.innerHTML = `
            <p><strong>Nom:</strong> ${clientName}</p>
            <p><strong>Contact:</strong> ${clientContact}</p>
            <p><strong>Délai:</strong> ${duree}</p>
        `;
    }
    
    // Services sélectionnés
    const servicesSelectionnes = window.getServicesSelectionnes ? window.getServicesSelectionnes() : [];
    const recapServices = document.getElementById('recap-services');
    
    if (recapServices) {
        let servicesHTML = '';
        
        if (servicesSelectionnes.length === 0) {
            servicesHTML = '<p class="text-muted">Aucun service sélectionné</p>';
        } else {
            servicesSelectionnes.forEach(service => {
                servicesHTML += `
                    <div class="d-flex justify-content-between border-bottom py-2">
                        <span>${service.nom}</span>
                        <span class="fw-bold">${service.quantite} × ${service.prixUnitaire.toLocaleString()} Ar</span>
                    </div>
                `;
            });
        }
        
        recapServices.innerHTML = servicesHTML;
    }
    
    const total = calculerTotalComplet();
    const recapTotal = document.getElementById('recap-total');
    if (recapTotal) {
        recapTotal.textContent = total.toLocaleString('fr-FR') + ' Ar';
    }
    
    console.log('✅ Récapitulatif mis à jour');
}

function reinitialiserDevis() {
    console.log('🔄 Réinitialisation du devis...');
    
    // Réinitialiser les champs client
    document.getElementById('clientName').value = '';
    document.getElementById('clientContact').value = '';
    document.getElementById('dureeTraitement').value = '3 jours';
    
    // Réinitialiser tous les services
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    document.querySelectorAll('input[type="number"]').forEach(input => {
        if (input.classList.contains('pages-saisie-simple') || 
            input.classList.contains('pages-saisie-standard') || 
            input.classList.contains('pages-saisie-complexe') ||
            input.classList.contains('pages-mise-basique') ||
            input.classList.contains('pages-mise-standard') ||
            input.classList.contains('pages-mise-avancee')) {
            input.value = '0';
        } else {
            input.value = '1';
        }
    });
    
    document.querySelectorAll('[id$="-details"]').forEach(details => {
        details.style.display = 'none';
    });
    
    // Réinitialiser les services personnalisés
    const customContainer = document.getElementById('custom-services-container');
    if (customContainer) customContainer.innerHTML = '';
    
    // Revenir à l'étape 1
    showStep(1);
    
    // Recalculer les totaux
    calculerSousTotauxSaisie();
    calculerTotalComplet();
    
    alert('Devis réinitialisé');
    console.log('✅ Devis réinitialisé');
}

// =============================================
// FONCTIONS POUR LES SERVICES PERSONNALISÉS
// =============================================

function ajouterServicePersonnaliseModal() {
    console.log('➕ Ajout d\'un service personnalisé via modal...');
    
    const nom = document.getElementById('customName')?.value.trim();
    const desc = document.getElementById('customDesc')?.value.trim();
    const prix = parseInt(document.getElementById('customPrice')?.value) || 0;
    const quantite = parseInt(document.getElementById('customQuantity')?.value) || 1;
    const unite = document.getElementById('customUnite')?.value || 'unité'; // Récupérer l'unité

    // Validation
    if (!nom || !prix || prix < 0) {
        alert('Veuillez remplir le nom et le prix du service');
        return false;
    }

    const serviceId = 'custom_' + Date.now();
    
    const serviceHTML = `
        <div class="service-item custom-service card mb-3" id="${serviceId}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="form-check flex-grow-1">
                        <input class="form-check-input" type="checkbox" id="service${serviceId}" 
                               onchange="toggleCustomService('${serviceId}')" checked>
                        <label class="form-check-label fw-semibold" for="service${serviceId}">
                            ${nom}
                            ${desc ? `<br><small class="text-muted">${desc}</small>` : ''}
                        </label>
                    </div>
                    <button type="button" class="btn btn-outline-danger btn-sm ms-2" 
                            onclick="supprimerServicePersonnalise('${serviceId}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="service-details" id="details${serviceId}">
                    <div class="row g-2 align-items-center">
                        <div class="col-md-4">
                            <label class="form-label small mb-1">Quantité</label>
                            <input type="number" id="qty${serviceId}" class="form-control form-control-sm" 
                                   value="${quantite}" min="1" oninput="calculerTotalComplet()">
                        </div>
                        <div class="col-md-5">
                            <label class="form-label small mb-1">Prix unitaire (Ar)</label>
                            <input type="number" id="price${serviceId}" class="form-control form-control-sm" 
                                   value="${prix}" min="0" oninput="calculerTotalComplet()">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small mb-1">Unité</label>
                            <input type="text" class="form-control form-control-sm" value="${unite}" readonly>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const container = document.getElementById('custom-services-container');
    if (container) {
        container.insertAdjacentHTML('beforeend', serviceHTML);
        console.log('✅ Service personnalisé ajouté dans le conteneur');
    } else {
        console.error('❌ Conteneur des services personnalisés non trouvé');
        return false;
    }

    // Fermer le modal
    const modalElement = document.getElementById('modalAddService');
    if (modalElement && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    } else {
        // Fallback manuel
        modalElement.style.display = 'none';
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
    }

    // Réinitialiser le formulaire
    const form = document.getElementById('formAddService');
    if (form) form.reset();

    // Recalculer le total
    calculerTotalComplet();
    
    console.log('✅ Service personnalisé ajouté avec succès');
    return true;
}

function toggleCustomService(serviceId) {
    const checkbox = document.getElementById(`service${serviceId}`);
    const details = document.getElementById(`details${serviceId}`);
    
    if (checkbox && details) {
        details.style.display = checkbox.checked ? 'block' : 'none';
        calculerTotalComplet();
    }
}

function supprimerServicePersonnalise(serviceId) {
    const serviceElement = document.getElementById(serviceId);
    if (serviceElement) {
        serviceElement.remove();
        calculerTotalComplet();
        console.log('🗑️ Service personnalisé supprimé');
    }
}

// Fonction pour ouvrir le modal (version sécurisée)
function ouvrirModalServicePersonnalise() {
    console.log('📝 Ouverture du modal d\'ajout de service');
    const modalElement = document.getElementById('modalAddService');
    if (modalElement && typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } else {
        // Fallback manuel
        modalElement.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}


// Export des fonctions pour les utiliser dans le HTML
window.showStep = showStep;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.calculerTotalComplet = calculerTotalComplet;
window.initialiserInterfaceEtapes = initialiserInterfaceEtapes;
window.reinitialiserDevis = reinitialiserDevis;
window.updateRecap = updateRecap;

// Export des fonctions manquantes
window.ajouterServicePersonnaliseModal = ajouterServicePersonnaliseModal;
window.ouvrirModalServicePersonnalise = ouvrirModalServicePersonnalise;
window.toggleCustomService = toggleCustomService;
window.supprimerServicePersonnalise = supprimerServicePersonnalise;


console.log('✅ Fonctions étape par étape chargées dans facture.js');
// Export global des fonctions
window.genererFactureFinale = genererFactureFinale;
window.imprimerFacture = imprimerFacture;
window.reinitialiserDevis = reinitialiserDevis;
window.reinitialiserFacture = reinitialiserFacture;
window.showTab = showTab;
window.togglePaiementDetails = togglePaiementDetails;
window.calculerTotal = calculerTotal;
window.afficherInfosSauvegarde = afficherInfosSauvegarde;
window.toggleChargementCommande = toggleChargementCommande;
window.previsualiserCommande = previsualiserCommande;
window.chargerCommande = chargerCommande;
window.fermerPreview = fermerPreview;
window.ajouterService = ajouterService;
window.ajouterServicePersonnalise = ajouterServicePersonnalise;
window.exporterDevisPDF = exporterDevisPDF;
window.getServicesSelectionnes = getServicesSelectionnes;
window.genererDevisFacture = genererDevis;