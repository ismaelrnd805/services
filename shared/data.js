// Système de données partagées entre la facturation et le dashboard
class DataManager {
    constructor() {
        this.cleCommandes = 'msn_commandes';
        this.cleParametres = 'msn_parametres';
        this.cleUtilisateurs = 'msn_utilisateurs';
        this.cleNotifications = 'msn_notifications'; // NOUVEAU
        this.initialiserDonnees();
    }

    initialiserDonnees() {
        // Données utilisateurs (login)
        if (!localStorage.getItem(this.cleUtilisateurs)) {
            const utilisateurs = {
                'Ismael': {
                    mdp: '414011Z39t95',
                    nom: 'Ismael',
                    role: 'admin'
                }
            };
            localStorage.setItem(this.cleUtilisateurs, JSON.stringify(utilisateurs));
            console.log('✅ Utilisateurs initialisés');
        }

        // Initialiser les commandes si vide
        if (!localStorage.getItem(this.cleCommandes)) {
            localStorage.setItem(this.cleCommandes, JSON.stringify([]));
            console.log('✅ Commandes initialisées');
        }

        // NOUVEAU : Initialiser les notifications
        if (!localStorage.getItem(this.cleNotifications)) {
            localStorage.setItem(this.cleNotifications, JSON.stringify([]));
            console.log('✅ Notifications initialisées');
        }

        // Données paramètres entreprise
        if (!localStorage.getItem(this.cleParametres)) {
            const parametres = {
                nom: "Multi-Services Numériques",
                telephone: "+261 34 396 77 44 / 033 18 444 53 / 032 26 803 69",
                email: "multi.snumerique@gmail.com",
                whatsapp: "+261 34 396 77 44",
                mobileMoney: {
                    mvola: "034 39 677 44",
                    airtel: "033 18 444 53",
                    orange: "032 26 803 69"
                },
                services: {
                    saisie: { prix: 700, unite: 'page', active: true },
                    miseenforme: { prix: 700, unite: 'page', active: true },
                    tableau: { prix: 1000, unite: 'tableau', active: true },
                    figure: { prix: 1500, unite: 'figure', active: true },
                    graphique: { prix: 1500, unite: 'élément', active: true },
                    logo: { prix: 50000, unite: 'logo', active: true },
                    vector: { prix: 25000, unite: 'image', active: true },
                    afficheBasique: { prix: 10000, unite: 'affiche', active: true },
                    afficheStandard: { prix: 20000, unite: 'affiche', active: true },
                    affichePro: { prix: 30000, unite: 'affiche', active: true }
                },
                // NOUVEAU : Paramètres de notifications
                notifications: {
                    rappelsPaiement: true,
                    alertesRetard: true,
                    nouvellesCommandes: true,
                    commandesTerminees: true,
                    intervalRappels: 24 // heures
                }
            };
            localStorage.setItem(this.cleParametres, JSON.stringify(parametres));
            console.log('✅ Paramètres initialisés');
        }
    }

    // NOUVEAU : SYSTÈME DE NOTIFICATIONS
    ajouterNotification(titre, message, type = 'info', commandeId = null) {
        try {
            const notifications = this.getNotifications();
            const nouvelleNotification = {
                id: Date.now(),
                titre: titre,
                message: message,
                type: type, // 'info', 'warning', 'success', 'error'
                commandeId: commandeId,
                dateCreation: new Date().toISOString(),
                lue: false
            };
            
            notifications.unshift(nouvelleNotification); // Plus récent en premier
            localStorage.setItem(this.cleNotifications, JSON.stringify(notifications));
            
            console.log('🔔 Nouvelle notification:', titre);
            return true;
        } catch (error) {
            console.error('❌ Erreur ajout notification:', error);
            return false;
        }
    }

    getNotifications() {
        try {
            return JSON.parse(localStorage.getItem(this.cleNotifications)) || [];
        } catch (error) {
            console.error('❌ Erreur lecture notifications:', error);
            return [];
        }
    }

    getNotificationsNonLues() {
        const notifications = this.getNotifications();
        return notifications.filter(notif => !notif.lue);
    }

    marquerCommeLue(notificationId) {
        try {
            const notifications = this.getNotifications();
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.lue = true;
                localStorage.setItem(this.cleNotifications, JSON.stringify(notifications));
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erreur marquer notification lue:', error);
            return false;
        }
    }

    marquerToutesCommeLues() {
        try {
            const notifications = this.getNotifications();
            notifications.forEach(notif => notif.lue = true);
            localStorage.setItem(this.cleNotifications, JSON.stringify(notifications));
            return true;
        } catch (error) {
            console.error('❌ Erreur marquer toutes notifications lues:', error);
            return false;
        }
    }

    supprimerNotification(notificationId) {
        try {
            let notifications = this.getNotifications();
            notifications = notifications.filter(n => n.id !== notificationId);
            localStorage.setItem(this.cleNotifications, JSON.stringify(notifications));
            return true;
        } catch (error) {
            console.error('❌ Erreur suppression notification:', error);
            return false;
        }
    }

    // NOUVEAU : Vérifier les rappels automatiques
    verifierRappelsAutomatiques() {
        const parametres = this.getParametres();
        if (!parametres.notifications?.rappelsPaiement) return;

        const commandes = this.getCommandes();
        const maintenant = new Date();
        const notifications = [];

        commandes.forEach(commande => {
            if (commande.paiement === 'en_attente') {
                const dateCreation = new Date(commande.dateCreation);
                const heuresEcoulees = (maintenant - dateCreation) / (1000 * 60 * 60);
                
                // Rappel après 24h
                if (heuresEcoulees >= 24) {
                    notifications.push({
                        titre: "📅 Rappel de paiement",
                        message: `La commande ${commande.reference} de ${commande.client} attend toujours son paiement depuis ${Math.floor(heuresEcoulees)}h`,
                        type: 'warning',
                        commandeId: commande.id
                    });
                }
            }

            // Vérifier les retards de livraison
            if (commande.statut === 'traitement') {
                const dateCreation = new Date(commande.dateCreation);
                const joursEcoules = (maintenant - dateCreation) / (1000 * 60 * 60 * 24);
                
                if (joursEcoules > 7) { // Plus de 7 jours
                    notifications.push({
                        titre: "⚠️ Commande en retard",
                        message: `La commande ${commande.reference} est en traitement depuis ${Math.floor(joursEcoules)} jours`,
                        type: 'error',
                        commandeId: commande.id
                    });
                }
            }
        });

        // Ajouter les notifications
        notifications.forEach(notif => {
            this.ajouterNotification(notif.titre, notif.message, notif.type, notif.commandeId);
        });

        return notifications.length;
    }

    // COMMANDES (existantes - inchangées)
    ajouterCommande(commande) {
        try {
            const commandes = this.getCommandes();
            const nouvelleCommande = {
                id: Date.now(),
                client: commande.client,
                contact: commande.contact,
                services: commande.services,
                total: commande.total,
                reference: commande.reference,
                duree: commande.duree,
                dateCreation: new Date().toISOString(),
                statut: 'devis',
                paiement: 'en_attente'
            };
            
            commandes.push(nouvelleCommande);
            localStorage.setItem(this.cleCommandes, JSON.stringify(commandes));
            
            // NOUVEAU : Notification pour nouvelle commande
            if (this.getParametres().notifications?.nouvellesCommandes) {
                this.ajouterNotification(
                    "🆕 Nouvelle commande",
                    `Nouveau devis créé: ${commande.reference} pour ${commande.client}`,
                    'success',
                    nouvelleCommande.id
                );
            }
            
            console.log('📦 Nouvelle commande ajoutée:', nouvelleCommande.reference);
            console.log('📊 Total commandes:', commandes.length);
            return true;
        } catch (error) {
            console.error('❌ Erreur ajout commande:', error);
            return false;
        }
    }

    getCommandes() {
        try {
            const commandes = JSON.parse(localStorage.getItem(this.cleCommandes)) || [];
            return commandes;
        } catch (error) {
            console.error('❌ Erreur lecture commandes:', error);
            return [];
        }
    }

    getCommandesParStatut(statut) {
        const commandes = this.getCommandes();
        return commandes.filter(cmd => cmd.statut === statut);
    }

    mettreAJourCommande(id, updates) {
        try {
            const commandes = this.getCommandes();
            const index = commandes.findIndex(cmd => cmd.id === id);
            if (index !== -1) {
                const ancienStatut = commandes[index].statut;
                const ancienPaiement = commandes[index].paiement;
                
                commandes[index] = { ...commandes[index], ...updates };
                localStorage.setItem(this.cleCommandes, JSON.stringify(commandes));
                
                // NOUVEAU : Notifications pour changements importants
                const commande = commandes[index];
                const parametres = this.getParametres();
                
                if (updates.statut && updates.statut !== ancienStatut) {
                    if (updates.statut === 'termine' && parametres.notifications?.commandesTerminees) {
                        this.ajouterNotification(
                            "✅ Commande terminée",
                            `La commande ${commande.reference} a été marquée comme terminée`,
                            'success',
                            commande.id
                        );
                    }
                }
                
                if (updates.paiement && updates.paiement !== ancienPaiement && updates.paiement === 'paye') {
                    this.ajouterNotification(
                        "💰 Paiement reçu",
                        `Paiement confirmé pour la commande ${commande.reference}`,
                        'success',
                        commande.id
                    );
                }
                
                console.log('🔄 Commande mise à jour:', id, updates);
                return true;
            }
            console.log('❌ Commande non trouvée:', id);
            return false;
        } catch (error) {
            console.error('❌ Erreur mise à jour commande:', error);
            return false;
        }
    }

    // STATISTIQUES (existantes - inchangées)
    getStatistiques() {
        const commandes = this.getCommandes();
        const aujourdhui = new Date().toDateString();
        
        const commandesAujourdhui = commandes.filter(cmd => 
            new Date(cmd.dateCreation).toDateString() === aujourdhui
        );

        const commandesCeMois = commandes.filter(cmd => {
            const dateCmd = new Date(cmd.dateCreation);
            const maintenant = new Date();
            return dateCmd.getMonth() === maintenant.getMonth() && 
                   dateCmd.getFullYear() === maintenant.getFullYear();
        });

        const caTotal = commandes.reduce((total, cmd) => {
            if (cmd.paiement === 'paye') {
                const montant = parseFloat(cmd.total.replace(/[^0-9]/g, '')) || 0;
                return total + montant;
            }
            return total;
        }, 0);

        const caMensuel = commandesCeMois.reduce((total, cmd) => {
            if (cmd.paiement === 'paye') {
                const montant = parseFloat(cmd.total.replace(/[^0-9]/g, '')) || 0;
                return total + montant;
            }
            return total;
        }, 0);

        // NOUVEAU : Statistiques notifications
        const notificationsNonLues = this.getNotificationsNonLues().length;

        const stats = {
            totalCommandes: commandes.length,
            commandesAujourdhui: commandesAujourdhui.length,
            commandesCeMois: commandesCeMois.length,
            caTotal: caTotal,
            caMensuel: caMensuel,
            commandesEnCours: commandes.filter(cmd => cmd.statut === 'traitement').length,
            commandesTerminees: commandes.filter(cmd => cmd.statut === 'termine').length,
            clientsUniques: [...new Set(commandes.map(cmd => cmd.client))].length,
            notificationsNonLues: notificationsNonLues // NOUVEAU
        };

        console.log('📈 Statistiques calculées:', stats);
        return stats;
    }

    // PARAMÈTRES
    getParametres() {
        try {
            return JSON.parse(localStorage.getItem(this.cleParametres)) || {};
        } catch (error) {
            console.error('❌ Erreur lecture paramètres:', error);
            return {};
        }
    }

    sauvegarderParametres(parametres) {
        try {
            localStorage.setItem(this.cleParametres, JSON.stringify(parametres));
            console.log('✅ Paramètres sauvegardés');
            return true;
        } catch (error) {
            console.error('❌ Erreur sauvegarde paramètres:', error);
            return false;
        }
    }

    // UTILISATEURS
    verifierLogin(identifiant, motDePasse) {
        try {
            const utilisateurs = JSON.parse(localStorage.getItem(this.cleUtilisateurs));
            const utilisateur = utilisateurs[identifiant];
            const result = utilisateur && utilisateur.mdp === motDePasse;
            console.log('🔐 Tentative de connexion:', identifiant, result ? '✅ Succès' : '❌ Échec');
            return result;
        } catch (error) {
            console.error('❌ Erreur vérification login:', error);
            return false;
        }
    }

    // NETTOYAGE (pour debug)
    nettoyerDonnees() {
        localStorage.removeItem(this.cleCommandes);
        localStorage.removeItem(this.cleParametres);
        localStorage.removeItem(this.cleNotifications); // NOUVEAU
        console.log('🧹 Données nettoyées');
        this.initialiserDonnees();
    }

    // EXPORT/IMPORT
    exporterDonnees() {
        const donnees = {
            commandes: this.getCommandes(),
            parametres: this.getParametres(),
            notifications: this.getNotifications(), // NOUVEAU
            dateExport: new Date().toISOString()
        };
        return JSON.stringify(donnees, null, 2);
    }

    importerDonnees(donneesJson) {
        try {
            const donnees = JSON.parse(donneesJson);
            if (donnees.commandes) {
                localStorage.setItem(this.cleCommandes, JSON.stringify(donnees.commandes));
            }
            if (donnees.parametres) {
                localStorage.setItem(this.cleParametres, JSON.stringify(donnees.parametres));
            }
            if (donnees.notifications) {
                localStorage.setItem(this.cleNotifications, JSON.stringify(donnees.notifications));
            }
            console.log('✅ Données importées avec succès');
            return true;
        } catch (error) {
            console.error('❌ Erreur import données:', error);
            return false;
        }
    }
}

// Instance globale
console.log('🚀 DataManager initialisé avec système de notifications');