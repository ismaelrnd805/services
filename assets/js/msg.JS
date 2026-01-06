// ===== CODE JAVASCRIPT COMPLET AVEC TOUTES LES FONCTIONNALITÉS =====

// Vérification de connexion
if (!sessionStorage.getItem('msn_utilisateur_connecte')) {
    window.location.href = 'login.html';
}

// Initialisation
let dataManager;

document.addEventListener('DOMContentLoaded', function() {
    dataManager = new DataManager();
    initialiserDashboard();
    document.getElementById('nom-utilisateur').textContent = 
        sessionStorage.getItem('msn_utilisateur_connecte');
});

function initialiserDashboard() {
    afficherDate();
    chargerTableauDeBord();
    actualiserCompteurs();
    actualiserIndicateurNotifications();
    chargerNotificationsRecentes();
    
    // Nettoyer les données corrompues au démarrage
    setTimeout(() => {
        nettoyerToutesLesDonneesCorrompues();
    }, 1000);
    
    // Actualiser toutes les 30 secondes
    setInterval(actualiserDonnees, 30000);
}

// ===== SYSTÈME DE MESSAGES PRÉ-ENREGISTRÉS =====

const MESSAGES_PRE_ENREGISTRES = {
    fr: {
        confirmation_commande: {
            titre: "🧾 Commande confirmée",
            message: "Bonjour [client],\n\nNous confirmons la réception de votre commande [référence]. Notre équipe la prend en charge et vous tiendra informé à chaque étape.\n\nMerci pour votre confiance.\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        devis_envoye: {
            titre: "📄 Devis envoyé",
            message: "Bonjour [client],\n\nVeuillez trouver ci-joint le devis correspondant à votre demande [référence].\n\nMerci de le vérifier et de nous confirmer votre accord afin que nous puissions lancer la réalisation.\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        devis_accepte: {
            titre: "✅ Devis accepté",
            message: "Bonjour [client],\n\nNous confirmons la validation de votre devis [référence].\n\nLa production va commencer selon les termes convenus. Vous serez informé du suivi de votre commande.\n\nMerci pour votre confiance.\n\nBien cordialement,\nL'équipe Multi-Services Numériques"
        },
        facture_envoyee: {
            titre: "🧾 Facture envoyée",
            message: "Bonjour [client],\n\nVeuillez trouver ci-joint la facture correspondant à la commande [référence].\n\nMerci d'effectuer le règlement avant le [date_limite] pour éviter tout retard de traitement.\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        confirmation_paiement: {
            titre: "💳 Paiement confirmé",
            message: "Bonjour [client],\n\nNous confirmons la réception de votre paiement d'un montant de [montant] pour la commande [référence].\n\nLe traitement de votre commande est désormais en cours.\n\nMerci pour votre confiance.\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        relance_paiement: {
            titre: "⏰ Relance de paiement",
            message: "Bonjour [client],\n\nNous vous rappelons que le paiement de la facture liée à la commande [référence] reste en attente.\n\nMerci d'effectuer le règlement dans les plus brefs délais ou de nous informer si le paiement a déjà été effectué.\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        accompagnement_fichier: {
            titre: "📤 Fichiers livrés",
            message: "Bonjour [client],\n\nVeuillez trouver ci-joint les fichiers finaux de votre commande [référence].\n\nNous espérons qu'ils répondent à vos attentes. Merci de confirmer leur bonne réception.\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        livraison_confirmee: {
            titre: "📦 Livraison confirmée",
            message: "Bonjour [client],\n\nVotre commande [référence] a été livrée avec succès.\n\nNous restons disponibles pour toute question ou ajustement éventuel.\n\nMerci pour votre confiance.\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        retard_livraison: {
            titre: "⚠️ Retard de livraison",
            message: "Bonjour [client],\n\nNous rencontrons un léger retard sur la commande [référence].\n\nNotre équipe met tout en œuvre pour vous livrer dans les plus brefs délais.\n\nMerci pour votre compréhension.\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        probleme_technique: {
            titre: "🔧 Problème technique",
            message: "Bonjour [client],\n\nUn problème technique temporaire affecte votre commande [référence].\n\nNos techniciens sont mobilisés pour le résoudre rapidement. Nous vous tiendrons informé dès rétablissement complet.\n\nMerci pour votre compréhension.\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        demande_informations: {
            titre: "❓ Informations complémentaires requises",
            message: "Bonjour [client],\n\nAfin de poursuivre le traitement de votre commande [référence], nous avons besoin de précisions supplémentaires : [détails].\n\nMerci pour votre retour rapide.\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        remerciement: {
            titre: "🙏 Remerciements",
            message: "Bonjour [client],\n\nMerci pour votre confiance et votre collaboration sur la commande [référence].\n\nNous espérons que vous êtes pleinement satisfait de notre service.\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        satisfaction_client: {
            titre: "💬 Votre avis compte",
            message: "Bonjour [client],\n\nVotre commande [référence] est maintenant clôturée.\n\nVotre avis nous aide à améliorer nos services. Merci de partager votre retour ici : [lien].\n\nBien à vous,\nL'équipe Multi-Services Numériques"
        },
        offre_fidelite: {
            titre: "🎁 Offre de fidélité",
            message: "Bonjour [client],\n\nNous vous remercions pour votre fidélité !\n\nProfitez de [avantage] sur votre prochaine commande avec le code [code_promo].\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        offre_promotionnelle: {
            titre: "🔥 Offre spéciale limitée",
            message: "Bonjour [client],\n\nProfitez d'une remise exceptionnelle de [pourcentage]% sur nos services jusqu'au [date_fin].\n\nSaisissez cette opportunité dès maintenant !\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        annulation_commande: {
            titre: "❌ Commande annulée",
            message: "Bonjour [client],\n\nVotre commande [référence] a été annulée à votre demande / suite à [raison].\n\nSi vous souhaitez la réactiver ou en créer une nouvelle, notre équipe est à votre disposition.\n\nCordialement,\nL'équipe Multi-Services Numériques"
        },
        confirmation_rendezvous: {
            titre: "📅 Rendez-vous confirmé",
            message: "Bonjour [client],\n\nVotre rendez-vous est confirmé pour le [date] à [heure].\n\nLieu / lien de connexion : [lien_ou_adresse].\n\nCordialement,\nL'équipe Multi-Services Numériques"
        }
    },
    mg: {
        confirmation_commande: {
            titre: "🧾 Kaomandy voaray",
            message: "Miarahaba an'i [client],\n\nVoaray soa aman-tsara ny kaomandy [référence].\n\nEfa manomboka mandray an-tanana izany ny ekipanay.\n\nMisaotra amin'ny fitokisanao.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        devis_envoye: {
            titre: "📄 Devis",
            message: "Miarahaba an'i [client],\n\nAlefanay eto ambany ny tolotra (devis) ho an'ny fangatahanao [référence].\n\nAfaka atombokay avy hatrany ny asa raha mety aminao ny devis vtantsika teo.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        devis_accepte: {
            titre: "✅ Devis accepté",
            message: "Miarahaba an'i [client],\n\nVoamarina ny fankatoavanao ny tolotra [référence].\n\nHanomboka avy hatrany ny fanatanterahana ny asa.\n\nMisaotra tamin'ny fitokisanao.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        facture_envoyee: {
            titre: "🧾 Faktiora",
            message: "Miarahaba an'i [client],\n\nAlefanay miaraka amin'ity hafatra ity ny faktiora amin'ny kaomandy [référence].\n\nHahazo fanamirinana fa voaray eto ianao rehefa tonga aty aminay izany.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        confirmation_paiement: {
            titre: "💳 Voaray",
            message: "Miarahaba an'i [client],\n\nVoaray ny fandoavanao vola mitentina [montant] amin'ny kaomandy [référence].\n\nHanomboka izao ny fanodinana sy ny fanatanterahana.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        relance_paiement: {
            titre: "⏰ Fampahatsiahivana",
            message: "Miarahaba an'i [client],\n\nTianay hampahatsiahivana fa mbola tsy voaray ny fandoavana kaomandy [référence].\n\nAzafady mba manomeza daty raha tsy tratranao izao ny fandoavana azy ary ampahafantaro anay raha efa nataonao.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        accompagnement_fichier: {
            titre: "📤 Mise à jour farany",
            message: "Miarahaba anao [client],\n\nAlefanay miaraka amin'ity hafatra ity ny rakitra farany amin'ny kaomandy [référence].\n\nAzafady mba hamafiso raha voaray soa aman-tsara.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        livraison_confirmee: {
            titre: "📦 Livraison",
            message: "Miarahaba an'i [client],\n\nVita sy efa nalefa ny kaomandy [référence].\n\nRaha misy zavatra mila fanitsiana dia aza misalasala mifandray aminay.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        retard_livraison: {
            titre: "⚠️ Fahatarana amin'ny livraison",
            message: "Miarahaba an'ny [client],\n\nMisy fahatarana kely amin'ny kaomandy [référence].\n\nEfa manatanteraka fanitsiana haingana ny ekipanay.\n\nMisaotra amin'ny faharetana.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        probleme_technique: {
            titre: "🔧 Olana ara-teknika",
            message: "Miarahaba an'i [client],\n\nMisy olana ara-teknika amin'ny kaomandy [référence].\n\nEfa miasa amin'ny famahana izany ny teknisianinay. Hanome vaovao izahay raha vao misy fivoarana.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        demande_informations: {
            titre: "❓ Fanazavana fanampiny",
            message: "Miarahaba an'i [client],\n\nMila fanazavana fanampiny momba ny kaomandy [référence] izahay: [détails].\n\nMisaotra amin'ny valin-teninao haingana.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        remerciement: {
            titre: "🙏 Fisaorana",
            message: "Miarahaba an'i [client],\n\nMisaotra anao tamin'ny fitokisana sy ny fiaraha-miasa tsara tamin'ny kaomandy [référence].\n\nManantena izahay fa afa-po ianao amin'ny vokatra.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        satisfaction_client: {
            titre: "💬 Hevitrao manan-danja",
            message: "Miarahaba an'i [client],\n\nVita tanteraka ny kaomandy [référence].\n\nTianay ny hahafantatra ny hevitrao amin'ny serivisy sy ny vokatra. Azonao atao ny mandefa hevitra eto.\n\nMisaotra betsaka.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        offre_fidelite: {
            titre: "🎁 Tolotra ho an'ny mpanjifa mahatoky",
            message: "Miarahaba an'i [client],\n\nMisaotra anao tamin'ny fahatokisana sy ny fiaraha-miasa maharitra.\n\nAmpiasao ny kaody 805MSN hahazoana tombontsoa manokana amin'ny kaomandy manaraka.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        offre_promotionnelle: {
            titre: "🔥 Tolotra manokana voafetra",
            message: "Miarahaba an'i [client],\n\nMisy fihenam-bidy manokana [pourcentage]% amin'ny serivisy hatramin'ny [date_fin].\n\nAza adino ity vintana ity !\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },
        annulation_commande: {
            titre: "❌ Kaomandy nofoanana",
            message: "Miarahaba an'i [client],\n\nNofoanana ny kaomandy [référence] noho ny antony [raison].\n\nRaha tianao haverina ny asa na hanao kaomandy vaovao dia vonona izahay hanampy.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        }
    }
};

// ===== FONCTIONS DE GESTION DES MESSAGES =====

function afficherFormulaireMessage(idCommande) {
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id === idCommande);
    
    if (!commande) {
        showNotification('Commande non trouvée', 'error');
        return;
    }

    // Supprimer l'ancien modal
    const existingModal = document.getElementById('modalMessage');
    if (existingModal) existingModal.remove();

    const modalHTML = `
        <div class="modal fade" id="modalMessage" tabindex="-1" aria-labelledby="modalMessageLabel" aria-hidden="true" data-commande-id="${idCommande}">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalMessageLabel">💬 Envoyer un message - ${commande.reference}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="formMessage">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Type de message</label>
                                    <select class="form-select" id="type-message" onchange="chargerMessagePredefini()">
                                        <option value="">Sélectionner un type</option>
                                        <option value="confirmation_commande">Confirmation commande</option>
                                        <option value="devis_envoye">Devis envoyé</option>
                                        <option value="devis_accepte">Devis accepté</option>
                                        <option value="facture_envoyee">Facture envoyée</option>
                                        <option value="confirmation_paiement">Confirmation paiement</option>
                                        <option value="relance_paiement">Relance paiement</option>
                                        <option value="accompagnement_fichier">Accompagnement fichier</option>
                                        <option value="livraison_confirmee">Livraison confirmée</option>
                                        <option value="retard_livraison">Retard livraison</option>
                                        <option value="probleme_technique">Problème technique</option>
                                        <option value="demande_informations">Demande informations</option>
                                        <option value="remerciement">Remerciement</option>
                                        <option value="satisfaction_client">Satisfaction client</option>
                                        <option value="offre_fidelite">Offre fidélité</option>
                                        <option value="offre_promotionnelle">Offre promotionnelle</option>
                                        <option value="annulation_commande">Annulation commande</option>
                                        <option value="confirmation_rendezvous">Confirmation rendez-vous</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Langue</label>
                                    <select class="form-select" id="langue-message" onchange="changerLangueMessage()">
                                        <option value="fr">Français</option>
                                        <option value="mg">Malagasy</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="alert alert-info mb-3">
                                <strong>Client:</strong> ${commande.client} | 
                                <strong>Contact:</strong> ${commande.contact || 'Non spécifié'}
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Sujet</label>
                                <input type="text" class="form-control" id="sujet-message" name="sujet-message" placeholder="Sujet du message" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Message</label>
                                <textarea class="form-control" id="texte-message" name="texte-message" rows="8" placeholder="Votre message..." required></textarea>
                            </div>
                            
                            <div class="alert alert-warning">
                                <small>Les variables [client], [référence], etc. seront remplacées automatiquement</small>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <div class="btn-group">
                            <button type="button" class="btn btn-success" onclick="envoyerMessageViaPlateforme('whatsapp', ${idCommande})">
                                💬 WhatsApp
                            </button>
                            <button type="button" class="btn btn-primary" onclick="envoyerMessageViaPlateforme('email', ${idCommande})">
                                📧 Email
                            </button>
                            <button type="button" class="btn btn-info" onclick="envoyerMessageViaPlateforme('facebook', ${idCommande})">
                                📘 Facebook
                            </button>
                        </div>
                        <button type="button" class="btn btn-warning" onclick="testeurMessage(${idCommande})">
                            🧪 Tester
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = new bootstrap.Modal(document.getElementById('modalMessage'));
    modal.show();
}

function chargerMessagePredefini() {
    const type = document.getElementById('type-message').value;
    const langue = document.getElementById('langue-message').value;
    
    if (!type) {
        document.getElementById('sujet-message').value = '';
        document.getElementById('texte-message').value = '';
        return;
    }
    
    if (MESSAGES_PRE_ENREGISTRES[langue] && MESSAGES_PRE_ENREGISTRES[langue][type]) {
        const message = MESSAGES_PRE_ENREGISTRES[langue][type];
        document.getElementById('sujet-message').value = message.titre;
        document.getElementById('texte-message').value = message.message;
        
        setTimeout(() => {
            remplacerVariablesAutomatiques();
        }, 100);
    } else {
        showNotification('Message pré-défini non disponible', 'warning');
    }
}

function changerLangueMessage() {
    const type = document.getElementById('type-message').value;
    if (type) {
        chargerMessagePredefini();
    } else {
        document.getElementById('sujet-message').value = '';
        document.getElementById('texte-message').value = '';
    }
}

function remplacerVariablesAutomatiques() {
    const modal = document.getElementById('modalMessage');
    if (!modal) return;
    
    const commandeId = modal.dataset.commandeId;
    if (!commandeId) return;
    
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id == commandeId);
    
    if (!commande) return;
    
    let message = document.getElementById('texte-message').value;
    let sujet = document.getElementById('sujet-message').value;
    
    // Nettoyer le texte des corruptions
    message = nettoyerTexteCorrompu(message);
    sujet = nettoyerTexteCorrompu(sujet);
    
    const variables = {
        '[client]': commande.client,
        '[référence]': commande.reference,
        '[services]': commande.services.map(s => s.nom).join(', '),
        '[montant]': commande.total,
        '[date]': new Date().toLocaleDateString('fr-FR'),
        '[délai]': commande.duree || 'à confirmer',
        '[date_limite]': calculerDateLimite(commande.dateCreation),
        '[pourcentage]': '10%',
        '[code_promo]': 'MSN10',
        '[date_fin]': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        '[raison]': 'demande client',
        '[heure]': '14:00',
        '[lien_ou_adresse]': 'En ligne'
    };
    
    for (const [variable, valeur] of Object.entries(variables)) {
        const regex = new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        sujet = sujet.replace(regex, valeur);
        message = message.replace(regex, valeur);
    }
    
    document.getElementById('sujet-message').value = sujet;
    document.getElementById('texte-message').value = message;
}

function envoyerMessageViaPlateforme(plateforme, idCommande) {
    console.log('Envoi message - Plateforme:', plateforme, 'ID:', idCommande);
    
    setTimeout(() => {
        try {
            // Récupérer les champs
            let sujetInput = document.getElementById('sujet-message');
            let messageInput = document.getElementById('texte-message');
            
            // Recherche alternative si les champs ne sont pas trouvés directement
            if (!sujetInput || !messageInput) {
                const modal = document.getElementById('modalMessage');
                if (modal) {
                    sujetInput = modal.querySelector('#sujet-message');
                    messageInput = modal.querySelector('#texte-message');
                }
            }
            
            if (!sujetInput || !messageInput) {
                showNotification('Erreur: impossible de trouver les champs de message', 'error');
                return;
            }
            
            const sujet = sujetInput.value.trim();
            const message = messageInput.value.trim();
            
            if (!sujet || !message) {
                showNotification('Veuillez remplir le sujet et le message', 'error');
                return;
            }
            
            continuerEnvoiMessage(plateforme, idCommande, sujet, message);
            
        } catch (error) {
            console.error('Erreur dans envoyerMessageViaPlateforme:', error);
            showNotification('Erreur: ' + error.message, 'error');
        }
    }, 100);
}

function continuerEnvoiMessage(plateforme, idCommande, sujet, message) {
    try {
        idCommande = parseInt(idCommande);
        const commandes = dataManager.getCommandes();
        const commande = commandes.find(c => c.id === idCommande);
        
        if (!commande) {
            showNotification('Commande non trouvée', 'error');
            return;
        }
        
        const messageFinal = nettoyerTexteCorrompu(message);
        const sujetFinal = nettoyerTexteCorrompu(sujet);
        
        // Sauvegarder la communication
        const communication = {
            id: Date.now(),
            commandeId: idCommande,
            date: new Date().toISOString(),
            type: 'message_client',
            plateforme: plateforme,
            sujet: sujetFinal,
            message: messageFinal,
            statut: 'prêt à envoyer',
            destinataire: commande.contact || 'Non spécifié',
            client: commande.client,
            reference: commande.reference
        };
        
        let communications = JSON.parse(localStorage.getItem('msn_communications') || '[]');
        communications.push(communication);
        localStorage.setItem('msn_communications', JSON.stringify(communications));
        
        // Ouvrir l'application
        ouvrirApplicationMessage(plateforme, commande.contact, sujetFinal, messageFinal);
        
        // Fermer le modal
        fermerModalMessage();
        
        showNotification(`✅ Message préparé pour ${plateforme}`, 'success');
        
        // Notification système
        dataManager.ajouterNotification(
            `💬 Message ${plateforme}`,
            `Message "${sujetFinal}" pour ${commande.client}`,
            'success',
            idCommande
        );
        
        setTimeout(actualiserDonnees, 500);
        
    } catch (error) {
        console.error('Erreur dans continuerEnvoiMessage:', error);
        showNotification('Erreur lors de l\'envoi: ' + error.message, 'error');
    }
}

function ouvrirApplicationMessage(plateforme, contact, sujet, message) {
    const messageEncode = encodeURIComponent(`${sujet}\n\n${message}`);
    
    switch(plateforme) {
        case 'whatsapp':
            let numeroWhatsapp = '';
            if (contact) {
                numeroWhatsapp = contact.replace(/[^0-9+]/g, '');
            }
            
            if (numeroWhatsapp && numeroWhatsapp.length > 5) {
                window.open(`https://wa.me/${numeroWhatsapp}?text=${messageEncode}`, '_blank');
            } else {
                window.open(`https://wa.me/?text=${messageEncode}`, '_blank');
            }
            break;
            
        case 'email':
            if (contact && contact.includes('@')) {
                window.open(`mailto:${contact}?subject=${encodeURIComponent(sujet)}&body=${messageEncode}`, '_blank');
            } else {
                window.open(`mailto:?subject=${encodeURIComponent(sujet)}&body=${messageEncode}`, '_blank');
            }
            break;
            
        case 'facebook':
            window.open('https://www.facebook.com/messages', '_blank');
            const texteACopier = `${sujet}\n\n${message}`;
            navigator.clipboard.writeText(texteACopier)
                .then(() => showNotification('Message copié - Collez-le dans Messenger', 'info'))
                .catch(() => showNotification('Ouvrez Messenger et collez le message', 'info'));
            break;
            
        default:
            showNotification(`Plateforme ${plateforme} non supportée`, 'error');
    }
}

function fermerModalMessage() {
    const modal = document.getElementById('modalMessage');
    if (modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) modalInstance.hide();
    }
}

// ===== FONCTIONS UTILITAIRES =====

function nettoyerTexteCorrompu(texte) {
    if (!texte) return '';
    return texte
        .replace(/[RSBNMCLD]\d+/g, '')
        .replace(/\d{3,}/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function calculerDateLimite(dateCreation) {
    const date = new Date(dateCreation);
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('fr-FR');
}

function testeurMessage(idCommande) {
    const sujet = document.getElementById('sujet-message')?.value || '';
    const message = document.getElementById('texte-message')?.value || '';
    
    if (!sujet.trim() || !message.trim()) {
        showNotification('Veuillez remplir le sujet et le message', 'error');
        return;
    }
    
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id === parseInt(idCommande));
    const clientNom = commande ? commande.client : 'Client test';
    
    const previewHTML = `
        <div class="modal fade" id="modalTestMessage" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">🧪 Aperçu du message - ${clientNom}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="card">
                            <div class="card-header">
                                <strong>Sujet:</strong> ${sujet}
                            </div>
                            <div class="card-body">
                                <pre style="white-space: pre-wrap; font-family: inherit;">${message}</pre>
                            </div>
                        </div>
                        <div class="mt-3 alert alert-info">
                            <small>Ceci est un aperçu test. Le message n'a pas été réellement envoyé.</small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingTestModal = document.getElementById('modalTestMessage');
    if (existingTestModal) existingTestModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', previewHTML);
    const modal = new bootstrap.Modal(document.getElementById('modalTestMessage'));
    modal.show();
}

function reformulerMessage() {
    const messageActuel = document.getElementById('texte-message').value;
    if (!messageActuel.trim()) {
        showNotification('Veuillez d\'abord écrire un message', 'warning');
        return;
    }
    
    const reformulations = [
        "Pourriez-vous reformuler ce message de manière plus professionnelle ?",
        "Pouvez-vous rendre ce texte plus concis ?",
        "Pourriez-vous adapter ce message pour qu'il soit plus chaleureux ?"
    ];
    
    const reformulation = reformulations[Math.floor(Math.random() * reformulations.length)];
    document.getElementById('texte-message').value = messageActuel + "\n\n---\n\nReformulation suggérée: " + reformulation;
    showNotification('Suggestion de reformulation ajoutée', 'info');
}

function traduireMessage() {
    const messageActuel = document.getElementById('texte-message').value;
    const langueSource = document.getElementById('langue-message').value;
    const langueCible = langueSource === 'fr' ? 'mg' : 'fr';
    
    if (!messageActuel.trim()) {
        showNotification('Veuillez d\'abord écrire un message', 'warning');
        return;
    }
    
    const messageTraduit = messageActuel + 
        "\n\n--- TRADUCTION " + (langueSource === 'fr' ? 'FRANÇAIS → MALAGASY' : 'MALAGASY → FRANÇAIS') + " ---\n" +
        "[Espace pour la traduction automatique]\n" +
        "Fonction de traduction à intégrer avec une API";
    
    document.getElementById('texte-message').value = messageTraduit;
    document.getElementById('langue-message').value = langueCible;
    showNotification('Structure de traduction ajoutée', 'info');
}

function ajouterVariables() {
    const variables = [
        { code: '[client]', description: 'Nom du client' },
        { code: '[référence]', description: 'Référence commande' },
        { code: '[services]', description: 'Liste des services' },
        { code: '[montant]', description: 'Montant total' },
        { code: '[date]', description: 'Date du jour' },
        { code: '[délai]', description: 'Délai de livraison' }
    ];
    
    let variablesText = "\n\n--- VARIABLES DISPONIBLES ---\n";
    variables.forEach(variable => {
        variablesText += `${variable.code} - ${variable.description}\n`;
    });
    
    document.getElementById('texte-message').value += variablesText;
    showNotification('Liste des variables ajoutée', 'info');
}

function nettoyerToutesLesDonneesCorrompues() {
    let communications = JSON.parse(localStorage.getItem('msn_communications') || '[]');
    communications = communications.map(comm => {
        return {
            ...comm,
            sujet: nettoyerTexteCorrompu(comm.sujet),
            message: nettoyerTexteCorrompu(comm.message)
        };
    });
    localStorage.setItem('msn_communications', JSON.stringify(communications));
}

// ===== FONCTIONS EXISTANTES (abrégées pour la lisibilité) =====

function afficherDate() {
    document.getElementById('currentDate').textContent = 
        new Date().toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        section.classList.add('active');
    }
    
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.navbar-nav .nav-link[onclick*="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');

    const titreSection = document.getElementById('titre-section');
    const nomsSections = {
        'tableau-bord': 'Tableau de Bord', 'commandes': 'Gestion des Commandes',
        'notifications': 'Notifications', 'clients': 'Gestion des Clients', 
        'finances': 'Tableau de Bord Financier', 'parametres': 'Paramètres',
        'rapports': 'Rapports de Mise à Jour', 'cabine-technique': 'Cabine Technique',
        'communication': 'Communication Clients'
    };
    
    if (titreSection && nomsSections[sectionId]) {
        titreSection.textContent = nomsSections[sectionId];
    }

    switch(sectionId) {
        case 'tableau-bord': chargerTableauDeBord(); break;
        case 'commandes': chargerCommandes(); break;
        case 'notifications': chargerNotifications(); break;
        case 'clients': chargerClients(); break;
        case 'finances': chargerFinances(); break;
        case 'parametres': chargerParametres(); break;
        case 'rapports': setTimeout(() => { if (typeof initialiserModuleRapports === 'function') initialiserModuleRapports(); }, 100); break;
        case 'cabine-technique': chargerCabineTechnique(); break;
        case 'communication': chargerCommunication(); break;
    }
}


function chargerCommunication() {
    const communications = JSON.parse(localStorage.getItem('msn_communications') || '[]');
    const commandes = dataManager.getCommandes();
    
    const container = document.getElementById('liste-communications');
    if (!container) return;
    
    if (communications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">💬</div>
                <h3>Aucune communication</h3>
                <p>Les messages envoyés aux clients apparaîtront ici.</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="table-responsive-custom">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Client</th>
                            <th>Sujet</th>
                            <th>Type</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${communications.map(comm => {
                            const commande = commandes.find(c => c.id === comm.commandeId);
                            return `
                                <tr>
                                    <td>${new Date(comm.date).toLocaleString('fr-FR')}</td>
                                    <td>${commande ? commande.client : 'Client inconnu'}</td>
                                    <td>${comm.sujet}</td>
                                    <td><span class="badge badge-info">${comm.type}</span></td>
                                    <td><span class="badge badge-success">${comm.statut}</span></td>
                                    <td>
                                        <button onclick="voirDetailsCommunication(${comm.id})" class="btn btn-custom btn-custom-sm">
                                            👁️ Voir
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

function voirDetailsCommunication(idCommunication) {
    const communications = JSON.parse(localStorage.getItem('msn_communications') || '[]');
    const communication = communications.find(c => c.id === idCommunication);
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id === communication.commandeId);
    
    if (communication) {
        const details = `
Date: ${new Date(communication.date).toLocaleString('fr-FR')}
Client: ${commande ? commande.client : 'Client inconnu'}
Contact: ${commande ? commande.contact : 'Non spécifié'}
Sujet: ${communication.sujet}
Type: ${communication.type}
Statut: ${communication.statut}

Message:
${communication.message}
        `;
        
        alert('Détails de la communication:\n\n' + details);
    }
}

function chargerCabineTechnique() {
    console.log('Chargement de la cabine technique...');
    
    // Mettre à jour les statistiques en temps réel via ConfigurationManager
    if (typeof configManager !== 'undefined' && typeof configManager.mettreAJourIndicateurs === 'function') {
        configManager.mettreAJourIndicateurs();
    } else {
        // Fallback manuel si configManager n'est pas disponible
        mettreAJourIndicateursManuellement();
    }
    
    // Charger les services
    if (typeof chargerServices === 'function') {
        console.log('Chargement des services...');
        chargerServices();
    } else {
        console.error('Fonction chargerServices non disponible');
    }
    
    console.log('Cabine technique chargée');
}

function mettreAJourIndicateursManuellement() {
    console.log('Mise à jour manuelle des indicateurs...');
    // Logique de mise à jour des indicateurs si nécessaire
}

function chargerTableauDeBord() {
    // ... code existant jusqu'aux commandes récentes ...

    if (commandes.length > 0) {
        document.getElementById('commandes-recentes').innerHTML = `
            <div class="table-responsive-custom">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Référence</th>
                            <th>Client</th>
                            <th>Services</th>
                            <th>Montant</th>
                            <th>Statut</th>
                            <th>Paiement</th>
                            <th>Validation</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${commandes.map(commande => {
                            const statutClass = `statut-${commande.statut.toLowerCase().replace(' ', '_')}`;
                            const paiementClass = `paiement-${commande.paiement.toLowerCase().replace(' ', '_')}`;
                            const validationClass = `validation-${(commande.validation || 'en_cours').toLowerCase().replace(' ', '_')}`;
                            
                            return `
                                <tr>
                                    <td><strong>${commande.reference}</strong></td>
                                    <td>${commande.client}</td>
                                    <td title="${commande.services.map(s => s.nom).join(', ')}">
                                        ${commande.services.slice(0, 2).map(s => s.nom).join(', ')}${commande.services.length > 2 ? '...' : ''}
                                    </td>
                                    <td>${commande.total}</td>
                                    <td><span class="badge badge-${commande.statut}">${getStatutTexte(commande.statut)}</span></td>
                                    <td><span class="badge badge-${commande.paiement}">${getPaiementTexte(commande.paiement)}</span></td>
                                    <td><span class="badge badge-${commande.validation || 'en_cours'}">${getValidationTexte(commande.validation)}</span></td>
                                    <td>${new Date(commande.dateCreation).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        <!-- Badges mobiles -->
                                        <div class="mobile-info-container">
                                            <span class="mobile-info-badge ${statutClass}">${getStatutTexte(commande.statut)}</span>
                                            <span class="mobile-info-badge ${paiementClass}">${getPaiementTexte(commande.paiement)}</span>
                                            <span class="mobile-info-badge ${validationClass}">${getValidationTexte(commande.validation)}</span>
                                        </div>
                                        
                                        <!-- Contrôles pour mobile -->
                                        <div class="mobile-controls">
                                            <div>
                                                <div class="mobile-control-label">Statut:</div>
                                                <select onchange="changerStatut(${commande.id}, this.value)" class="mobile-control-select">
                                                    <option value="devis" ${commande.statut === 'devis' ? 'selected' : ''}>Devis</option>
                                                    <option value="traitement" ${commande.statut === 'traitement' ? 'selected' : ''}>En Traitement</option>
                                                    <option value="termine" ${commande.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                                </select>
                                            </div>
                                            <div>
                                                <div class="mobile-control-label">Paiement:</div>
                                                <select onchange="changerPaiement(${commande.id}, this.value)" class="mobile-control-select">
                                                    <option value="en_attente" ${commande.paiement === 'en_attente' ? 'selected' : ''}>En Attente</option>
                                                    <option value="paye" ${commande.paiement === 'paye' ? 'selected' : ''}>Payé</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div class="actions-grid">
                                            <button onclick="exporterCommande(${commande.id})" class="btn btn-custom btn-custom-sm btn-action-mobile" title="Exporter PDF">📄</button>
                                            <button onclick="voirDetails(${commande.id})" class="btn btn-custom btn-custom-sm btn-action-mobile" title="Voir détails">👁️</button>
                                            <button onclick="afficherFormulaireMessage(${commande.id})" class="btn btn-custom btn-custom-sm btn-info btn-action-mobile" title="Envoyer message">💬</button>
                                            ${(commande.validation === 'en_cours' || !commande.validation) ? `<button onclick="genererRapportMiseAJour(${commande.id})" class="btn btn-custom btn-custom-sm btn-warning btn-action-mobile" title="Générer rapport">📋</button>` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // ... reste du code ...
}

function chargerCommandes(filtre = 'toutes') {
    let commandes = dataManager.getCommandes();
    
    if (filtre !== 'toutes') {
        commandes = commandes.filter(cmd => {
            if (filtre === 'paye') {
                return cmd.paiement === 'paye';
            }
            return cmd.statut === filtre;
        });
    }

    commandes = commandes.reverse();

    const containerId = `liste-commandes${filtre !== 'toutes' ? '-' + filtre : ''}`;
    const container = document.getElementById(containerId) || document.getElementById('liste-commandes');

    if (commandes.length === 0) {
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <h3>Aucune commande ${filtre !== 'toutes' ? getStatutTexte(filtre) : ''}</h3>
                    <p>Les commandes apparaîtront ici après leur création dans l'app de facturation.</p>
                </div>
            `;
        }
    } else {
        if (container) {
            container.innerHTML = `
                <div class="table-responsive-custom">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Référence</th>
                                <th>Client</th>
                                <th>Contact</th>
                                <th>Services</th>
                                <th>Montant</th>
                                <th>Statut</th>
                                <th>Paiement</th>
                                <th>Validation</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${commandes.map(commande => {
                                // Classes pour les badges mobiles
                                const statutClass = `statut-${commande.statut.toLowerCase().replace(' ', '_')}`;
                                const paiementClass = `paiement-${commande.paiement.toLowerCase().replace(' ', '_')}`;
                                const validationClass = `validation-${(commande.validation || 'en_cours').toLowerCase().replace(' ', '_')}`;
                                
                                return `
                                    <tr>
                                        <td><strong>${commande.reference}</strong></td>
                                        <td>${commande.client}</td>
                                        <td>${commande.contact}</td>
                                        <td title="${commande.services.map(s => s.nom).join(', ')}">
                                            ${commande.services.slice(0, 2).map(s => s.nom.split('(')[0]).join(', ')}${commande.services.length > 2 ? '...' : ''}
                                        </td>
                                        <td>${commande.total}</td>
                                        <td>
                                            <select onchange="changerStatut(${commande.id}, this.value)" class="form-control form-control-sm">
                                                <option value="devis" ${commande.statut === 'devis' ? 'selected' : ''}>Devis</option>
                                                <option value="traitement" ${commande.statut === 'traitement' ? 'selected' : ''}>En Traitement</option>
                                                <option value="termine" ${commande.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select onchange="changerPaiement(${commande.id}, this.value)" class="form-control form-control-sm">
                                                <option value="en_attente" ${commande.paiement === 'en_attente' ? 'selected' : ''}>En Attente</option>
                                                <option value="paye" ${commande.paiement === 'paye' ? 'selected' : ''}>Payé</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select onchange="changerValidation(${commande.id}, this.value)" class="form-control form-control-sm">
                                                <option value="en_cours" ${(!commande.validation || commande.validation === 'en_cours') ? 'selected' : ''}>Validation en cours</option>
                                                <option value="valide" ${commande.validation === 'valide' ? 'selected' : ''}>Validé</option>
                                                <option value="rejete" ${commande.validation === 'rejete' ? 'selected' : ''}>Rejeté</option>
                                            </select>
                                        </td>
                                        <td>${new Date(commande.dateCreation).toLocaleDateString('fr-FR')}</td>
                                        <td>
                                            <!-- Badges d'information pour mobile -->
                                            <div class="mobile-info-container">
                                                <span class="mobile-info-badge ${statutClass}">${getStatutTexte(commande.statut)}</span>
                                                <span class="mobile-info-badge ${paiementClass}">${getPaiementTexte(commande.paiement)}</span>
                                                <span class="mobile-info-badge ${validationClass}">${getValidationTexte(commande.validation)}</span>
                                            </div>
                                            
                                            <!-- Contrôles pour mobile -->
                                            <div class="mobile-controls">
                                                <div>
                                                    <div class="mobile-control-label">Statut:</div>
                                                    <select onchange="changerStatut(${commande.id}, this.value)" class="mobile-control-select">
                                                        <option value="devis" ${commande.statut === 'devis' ? 'selected' : ''}>Devis</option>
                                                        <option value="traitement" ${commande.statut === 'traitement' ? 'selected' : ''}>En Traitement</option>
                                                        <option value="termine" ${commande.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <div class="mobile-control-label">Paiement:</div>
                                                    <select onchange="changerPaiement(${commande.id}, this.value)" class="mobile-control-select">
                                                        <option value="en_attente" ${commande.paiement === 'en_attente' ? 'selected' : ''}>En Attente</option>
                                                        <option value="paye" ${commande.paiement === 'paye' ? 'selected' : ''}>Payé</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <div class="mobile-control-label">Validation:</div>
                                                    <select onchange="changerValidation(${commande.id}, this.value)" class="mobile-control-select">
                                                        <option value="en_cours" ${(!commande.validation || commande.validation === 'en_cours') ? 'selected' : ''}>En cours</option>
                                                        <option value="valide" ${commande.validation === 'valide' ? 'selected' : ''}>Validé</option>
                                                        <option value="rejete" ${commande.validation === 'rejete' ? 'selected' : ''}>Rejeté</option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <!-- Boutons d'action -->
                                            <div class="actions-grid">
                                                <button onclick="exporterCommande(${commande.id})" class="btn btn-sm btn-outline-primary btn-action-mobile" title="Exporter PDF">
                                                    <i class="bi bi-file-pdf"></i>
                                                </button>
                                                <button onclick="voirDetails(${commande.id})" class="btn btn-sm btn-outline-secondary btn-action-mobile" title="Voir détails">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button onclick="afficherFormulaireMessage(${commande.id})" class="btn btn-sm btn-outline-info btn-action-mobile" title="Envoyer message">
                                                    <i class="bi bi-chat"></i>
                                                </button>
                                                <button onclick="dupliquerCommande(${commande.id})" class="btn btn-sm btn-outline-success btn-action-mobile" title="Dupliquer">
                                                    <i class="bi bi-copy"></i>
                                                </button>
                                                ${(commande.validation === 'en_cours' || !commande.validation) ? `
                                                    <button onclick="genererRapportMiseAJour(${commande.id})" class="btn btn-sm btn-outline-warning btn-action-mobile" title="Générer rapport">
                                                        <i class="bi bi-clipboard-check"></i>
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }
}function chargerCommandes(filtre = 'toutes') {
    let commandes = dataManager.getCommandes();
    
    if (filtre !== 'toutes') {
        commandes = commandes.filter(cmd => {
            if (filtre === 'paye') {
                return cmd.paiement === 'paye';
            }
            return cmd.statut === filtre;
        });
    }

    commandes = commandes.reverse();

    const containerId = `liste-commandes${filtre !== 'toutes' ? '-' + filtre : ''}`;
    const container = document.getElementById(containerId) || document.getElementById('liste-commandes');

    if (commandes.length === 0) {
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <h3>Aucune commande ${filtre !== 'toutes' ? getStatutTexte(filtre) : ''}</h3>
                    <p>Les commandes apparaîtront ici après leur création dans l'app de facturation.</p>
                </div>
            `;
        }
    } else {
        if (container) {
            container.innerHTML = `
                <div class="table-responsive-custom">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Référence</th>
                                <th>Client</th>
                                <th>Contact</th>
                                <th>Services</th>
                                <th>Montant</th>
                                <th>Statut</th>
                                <th>Paiement</th>
                                <th>Validation</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${commandes.map(commande => {
                                // Classes pour les icônes
                                const statutClass = `statut-${commande.statut.toLowerCase().replace(' ', '_')}`;
                                const paiementClass = `paiement-${commande.paiement.toLowerCase().replace(' ', '_')}`;
                                const validationClass = `validation-${(commande.validation || 'en_cours').toLowerCase().replace(' ', '_')}`;
                                
                                // Icônes selon le statut
                                const statutIcon = commande.statut === 'devis' ? '📋' : 
                                                 commande.statut === 'traitement' ? '⚙️' : '✅';
                                                 
                                const paiementIcon = commande.paiement === 'en_attente' ? '⏳' : '💰';
                                
                                const validationIcon = (!commande.validation || commande.validation === 'en_cours') ? '🔄' :
                                                     commande.validation === 'valide' ? '✅' : '❌';
                                
                                return `
                                    <tr>
                                        <td><strong>${commande.reference}</strong></td>
                                        <td>${commande.client}</td>
                                        <td>${commande.contact}</td>
                                        <td title="${commande.services.map(s => s.nom).join(', ')}">
                                            ${commande.services.slice(0, 2).map(s => s.nom.split('(')[0]).join(', ')}${commande.services.length > 2 ? '...' : ''}
                                        </td>
                                        <td>${commande.total}</td>
                                        <td>
                                            <select onchange="changerStatut(${commande.id}, this.value)" class="form-control form-control-sm">
                                                <option value="devis" ${commande.statut === 'devis' ? 'selected' : ''}>Devis</option>
                                                <option value="traitement" ${commande.statut === 'traitement' ? 'selected' : ''}>En Traitement</option>
                                                <option value="termine" ${commande.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select onchange="changerPaiement(${commande.id}, this.value)" class="form-control form-control-sm">
                                                <option value="en_attente" ${commande.paiement === 'en_attente' ? 'selected' : ''}>En Attente</option>
                                                <option value="paye" ${commande.paiement === 'paye' ? 'selected' : ''}>Payé</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select onchange="changerValidation(${commande.id}, this.value)" class="form-control form-control-sm">
                                                <option value="en_cours" ${(!commande.validation || commande.validation === 'en_cours') ? 'selected' : ''}>Validation en cours</option>
                                                <option value="valide" ${commande.validation === 'valide' ? 'selected' : ''}>Validé</option>
                                                <option value="rejete" ${commande.validation === 'rejete' ? 'selected' : ''}>Rejeté</option>
                                            </select>
                                        </td>
                                        <td>${new Date(commande.dateCreation).toLocaleDateString('fr-FR')}</td>
                                        <td>
                                            <!-- Icônes d'état pour mobile -->
                                            <div class="mobile-status-icons">
                                                <div class="status-icon ${statutClass}" title="Statut: ${getStatutTexte(commande.statut)}">
                                                    <i class="bi ${commande.statut === 'devis' ? 'bi-file-text' : commande.statut === 'traitement' ? 'bi-gear' : 'bi-check-circle'}"></i>
                                                    <span>${getStatutTexte(commande.statut).substring(0, 3)}</span>
                                                </div>
                                                <div class="status-icon ${paiementClass}" title="Paiement: ${getPaiementTexte(commande.paiement)}">
                                                    <i class="bi ${commande.paiement === 'en_attente' ? 'bi-clock' : 'bi-currency-dollar'}"></i>
                                                    <span>${getPaiementTexte(commande.paiement).substring(0, 3)}</span>
                                                </div>
                                                <div class="status-icon ${validationClass}" title="Validation: ${getValidationTexte(commande.validation)}">
                                                    <i class="bi ${(!commande.validation || commande.validation === 'en_cours') ? 'bi-arrow-repeat' : commande.validation === 'valide' ? 'bi-check-circle' : 'bi-x-circle'}"></i>
                                                    <span>${getValidationTexte(commande.validation).substring(0, 3)}</span>
                                                </div>
                                            </div>
                                            
                                            <!-- Contrôles compacts pour mobile -->
                                            <div class="mobile-controls-compact">
                                                <select onchange="changerStatut(${commande.id}, this.value)" class="mobile-control-select" title="Changer statut">
                                                    <option value="devis" ${commande.statut === 'devis' ? 'selected' : ''}>📋</option>
                                                    <option value="traitement" ${commande.statut === 'traitement' ? 'selected' : ''}>⚙️</option>
                                                    <option value="termine" ${commande.statut === 'termine' ? 'selected' : ''}>✅</option>
                                                </select>
                                                <select onchange="changerPaiement(${commande.id}, this.value)" class="mobile-control-select" title="Changer paiement">
                                                    <option value="en_attente" ${commande.paiement === 'en_attente' ? 'selected' : ''}>⏳</option>
                                                    <option value="paye" ${commande.paiement === 'paye' ? 'selected' : ''}>💰</option>
                                                </select>
                                                <select onchange="changerValidation(${commande.id}, this.value)" class="mobile-control-select" title="Changer validation">
                                                    <option value="en_cours" ${(!commande.validation || commande.validation === 'en_cours') ? 'selected' : ''}>🔄</option>
                                                    <option value="valide" ${commande.validation === 'valide' ? 'selected' : ''}>✅</option>
                                                    <option value="rejete" ${commande.validation === 'rejete' ? 'selected' : ''}>❌</option>
                                                </select>
                                            </div>
                                            
                                            <!-- Boutons d'action en icônes -->
                                            <div class="actions-grid-compact">
                                                <button onclick="exporterCommande(${commande.id})" class="btn btn-sm btn-outline-primary btn-icon-compact" title="Exporter PDF">
                                                    <i class="bi bi-file-pdf"></i>
                                                </button>
                                                <button onclick="voirDetails(${commande.id})" class="btn btn-sm btn-outline-secondary btn-icon-compact" title="Voir détails">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button onclick="afficherFormulaireMessage(${commande.id})" class="btn btn-sm btn-outline-info btn-icon-compact" title="Envoyer message">
                                                    <i class="bi bi-chat"></i>
                                                </button>
                                                <button onclick="dupliquerCommande(${commande.id})" class="btn btn-sm btn-outline-success btn-icon-compact" title="Dupliquer">
                                                    <i class="bi bi-copy"></i>
                                                </button>
                                                ${(commande.validation === 'en_cours' || !commande.validation) ? `
                                                    <button onclick="genererRapportMiseAJour(${commande.id})" class="btn btn-sm btn-outline-warning btn-icon-compact" title="Générer rapport">
                                                        <i class="bi bi-clipboard-check"></i>
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }
}

// ===== FONCTIONNALITÉ RAPPORTS DE MISE À JOUR PDF =====

function initialiserModuleRapports() {
    console.log('Initialisation du module de rapports...');
    
    // Charger les commandes avec validation en cours
    const commandes = dataManager.getCommandes().filter(cmd => 
        !cmd.validation || cmd.validation === 'en_cours'
    );
    
    const container = document.getElementById('liste-rapports');
    if (!container) return;
    
    if (commandes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📋</div>
                <h3>Aucun rapport en attente</h3>
                <p>Les commandes nécessitant des rapports de mise à jour apparaîtront ici.</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="table-responsive-custom">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Référence</th>
                            <th>Client</th>
                            <th>Services</th>
                            <th>Date Commande</th>
                            <th>Validation</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${commandes.map(commande => `
                            <tr>
                                <td><strong>${commande.reference}</strong></td>
                                <td>${commande.client}</td>
                                <td>${commande.services.map(s => s.nom.split('(')[0]).join(', ')}</td>
                                <td>${new Date(commande.dateCreation).toLocaleDateString('fr-FR')}</td>
                                <td><span class="badge badge-en_cours">Validation en cours</span></td>
                                <td>
                                    <button onclick="genererRapportMiseAJour(${commande.id})" class="btn btn-custom btn-custom-sm btn-warning">
                                        📋 Générer Rapport
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

function genererRapportMiseAJour(idCommande) {
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id === idCommande);
    
    if (!commande) {
        showNotification('Commande non trouvée', 'error');
        return;
    }
    
    // Afficher le formulaire de rapport
    afficherFormulaireRapport(commande);
}

function afficherFormulaireRapport(commande) {
    const modalHTML = `
        <div class="modal fade" id="modalRapport" tabindex="-1" aria-labelledby="modalRapportLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalRapportLabel">📋 Rapport de Mise à Jour - ${commande.reference}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="formRapport">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Date du rapport</label>
                                    <input type="date" class="form-control" id="rapport-date" value="${new Date().toISOString().split('T')[0]}" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Version</label>
                                    <input type="text" class="form-control" id="rapport-version" placeholder="ex: v1.2" required>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Rédacteur</label>
                                <input type="text" class="form-control" id="rapport-redacteur" value="${sessionStorage.getItem('msn_utilisateur_connecte') || ''}" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Résumé des modifications principales</label>
                                <textarea class="form-control" id="rapport-resume" rows="3" placeholder="Décrivez brièvement les principales modifications..."></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Détail des modifications</label>
                                <div id="liste-modifications" class="border p-3" style="max-height: 300px; overflow-y: auto;">
                                    ${genererChecklistModifications()}
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Impact des modifications</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="impact-mineur">
                                    <label class="form-check-label" for="impact-mineur">
                                        Correction mineure (orthographe, formatage)
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="impact-structurel">
                                    <label class="form-check-label" for="impact-structurel">
                                        Amélioration structurelle (organisation contenu)
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="impact-ajout">
                                    <label class="form-check-label" for="impact-ajout">
                                        Ajout substantiel (nouvelles sections)
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="impact-restructuration">
                                    <label class="form-check-label" for="impact-restructuration">
                                        Restructuration majeure (changement architecture)
                                    </label>
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Relu par</label>
                                    <input type="text" class="form-control" id="rapport-relu-par">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Validé par</label>
                                    <input type="text" class="form-control" id="rapport-valide-par">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-warning" onclick="genererPDFRapport(${commande.id})">📄 Générer PDF</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter le modal au DOM s'il n'existe pas
    if (!document.getElementById('modalRapport')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('modalRapport'));
    modal.show();
}

function genererChecklistModifications() {
    const categories = {
        '📑 STRUCTURE ET FORMATAGE': [
            'Mise à jour de la table des matières',
            'Ajout de nouvelles sections dans la table',
            'Suppression de sections obsolètes',
            'Réorganisation de l\'ordre des chapitres',
            'Correction des numéros de pages',
            'Ajout de sous-sections',
            'Harmonisation des niveaux de titres',
            'Vérification des liens internes',
            'Ajout de nouvelles figures référencées',
            'Suppression de figures supprimées',
            'Correction des numéros de figures',
            'Mise à jour des légendes',
            'Intégration de nouveaux tableaux',
            'Suppression de tableaux obsolètes',
            'Correction de la numérotation'
        ],
        '✍️ CONTENU TEXTUEL': [
            'Ajout de nouvelles sections',
            'Suppression de sections obsolètes',
            'Fusion de paragraphes redondants',
            'Division de paragraphes trop longs',
            'Réorganisation du flux logique',
            'Ajout de transitions entre sections',
            'Correction de formulations ambiguës',
            'Amélioration de la clarté des explications',
            'Suppression de jargon technique inutile',
            'Ajout d\'explications supplémentaires'
        ],
        '🎨 MISE EN PAGE ET PRÉSENTATION': [
            'Application de la graisse aux titres',
            'Correction de l\'italique pour les termes techniques',
            'Uniformisation des polices de caractères',
            'Ajustement de l\'interlignage',
            'Redimensionnement des images',
            'Correction de la résolution des figures',
            'Ajout de bordures aux tableaux',
            'Correction des sauts de page mal placés'
        ],
        '📊 CORRECTIONS SPÉCIFIQUES': [
            'Correction des références bibliographiques',
            'Mise à jour des dates et chiffres',
            'Vérification de l\'exactitude des données',
            'Correction des unités de mesure',
            'Correction des fautes d\'orthographe',
            'Élimination des fautes de grammaire',
            'Correction de la ponctuation'
        ]
    };
    
    let html = '';
    for (const [categorie, modifications] of Object.entries(categories)) {
        html += `<h6 class="mt-3">${categorie}</h6>`;
        modifications.forEach(modif => {
            const id = modif.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            html += `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="${id}">
                    <label class="form-check-label" for="${id}" style="font-size: 0.9rem;">
                        ${modif}
                    </label>
                </div>
            `;
        });
    }
    
    return html;
}

function genererPDFRapport(idCommande) {
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id === idCommande);
    
    if (!commande) {
        showNotification('Commande non trouvée', 'error');
        return;
    }
    
    // Récupérer les données du formulaire
    const dateRapport = document.getElementById('rapport-date').value;
    const version = document.getElementById('rapport-version').value;
    const redacteur = document.getElementById('rapport-redacteur').value;
    const resume = document.getElementById('rapport-resume').value;
    const reluPar = document.getElementById('rapport-relu-par').value;
    const validePar = document.getElementById('rapport-valide-par').value;
    
    // Récupérer les modifications cochées
    const modifications = [];
    document.querySelectorAll('#liste-modifications input[type="checkbox"]:checked').forEach(checkbox => {
        modifications.push(checkbox.nextElementSibling.textContent.trim());
    });
    
    // Récupérer l'impact
    const impacts = [];
    if (document.getElementById('impact-mineur').checked) impacts.push('Correction mineure');
    if (document.getElementById('impact-structurel').checked) impacts.push('Amélioration structurelle');
    if (document.getElementById('impact-ajout').checked) impacts.push('Ajout substantiel');
    if (document.getElementById('impact-restructuration').checked) impacts.push('Restructuration majeure');
    
    // Générer le HTML du rapport
    const rapportHTML = `
        <div class="rapport-container" style="font-family: Arial, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto;">
            <!-- En-tête -->
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                <h1 style="color: #2c3e50; margin: 10px 0 0 0;">Multi-Services Numériques</h1>
                <h2 style="color: #e74c3c; margin: 5px 0;">RAPPORT DE MISE À JOUR</h2>
                <p style="color: #666; margin: 5px 0;">Service: ${commande.services.map(s => s.nom.split('(')[0]).join(', ')}</p>
            </div>

            <!-- Informations du rapport -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div>
                    <h3 style="color: #2c3e50; margin-bottom: 10px;">Document</h3>
                    <p style="margin: 5px 0;"><strong>Référence:</strong> ${commande.reference}</p>
                    <p style="margin: 5px 0;"><strong>Client:</strong> ${commande.client}</p>
                    <p style="margin: 5px 0;"><strong>Contact:</strong> ${commande.contact || 'Non spécifié'}</p>
                </div>
                <div>
                    <h3 style="color: #2c3e50; margin-bottom: 10px;">Rapport</h3>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(dateRapport).toLocaleDateString('fr-FR')}</p>
                    <p style="margin: 5px 0;"><strong>Version:</strong> ${version}</p>
                    <p style="margin: 5px 0;"><strong>Rédacteur:</strong> ${redacteur}</p>
                </div>
            </div>

            <!-- Résumé des modifications -->
            ${resume ? `
            <div style="background: #e8f4fd; border: 1px solid #b6d7e8; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-top: 0;">Résumé des modifications principales</h3>
                <p style="color: #2c3e50; margin: 0; white-space: pre-line;">${resume}</p>
            </div>
            ` : ''}

            <!-- Détail des modifications -->
            ${modifications.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">Détail des modifications effectuées</h3>
                <ul style="color: #2c3e50; margin: 0; padding-left: 20px;">
                    ${modifications.map(modif => `<li>${modif}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <!-- Impact des modifications -->
            ${impacts.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">Impact des modifications</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${impacts.map(impact => `
                        <span style="background: #f39c12; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.9rem;">
                            ${impact}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Validation -->
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px;">
                <h3 style="color: #155724; margin-top: 0;">Validation</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <p style="margin: 5px 0;"><strong>Relu par:</strong> ${reluPar || 'Non spécifié'}</p>
                    </div>
                    <div>
                        <p style="margin: 5px 0;"><strong>Validé par:</strong> ${validePar || 'Non spécifié'}</p>
                    </div>
                </div>
                <p style="margin: 10px 0 0 0; color: #155724;">
                    <strong>Date d'approbation:</strong> ${new Date().toLocaleDateString('fr-FR')}
                </p>
            </div>

            <!-- Pied de page -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d;">
                <p style="margin: 5px 0;">Multi-Services Numériques - Service 100% en ligne</p>
                <p style="margin: 5px 0;">Tél: +261 34 396 77 44 / 033 18 444 53 / 032 26 803 69</p>
                <p style="margin: 5px 0;">Email: multi.snumerique@gmail.com</p>
            </div>
        </div>
    `;

    // Créer une fenêtre d'impression
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Rapport de Mise à Jour - ${commande.reference}</title>
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
                .rapport-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                }
                @media print {
                    body { 
                        margin: 0;
                        padding: 15px;
                    }
                    @page {
                        margin: 1cm;
                    }
                    .rapport-container {
                        box-shadow: none;
                    }
                }
            </style>
        </head>
        <body>
            ${rapportHTML}
        </body>
        </html>
    `);
    printWindow.document.close();

    // Attendre le chargement puis imprimer
    setTimeout(() => {
        printWindow.print();
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalRapport'));
        if (modal) modal.hide();
        
        showNotification('Rapport PDF généré avec succès', 'success');
    }, 500);
}

// ===== FONCTIONS EXISTANTES COMPLÈTES =====

function actualiserCompteurs() {
    const commandes = dataManager.getCommandes();
    const stats = dataManager.getStatistiques();
    
    // Mettre à jour les compteurs des onglets
    const elements = {
        'count-toutes': commandes.length,
        'count-devis': commandes.filter(c => c.statut === 'devis').length,
        'count-traitement': commandes.filter(c => c.statut === 'traitement').length,
        'count-termine': commandes.filter(c => c.statut === 'termine').length,
        'count-paye': commandes.filter(c => c.paiement === 'paye').length
    };
    
    for (const [id, count] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = count;
        }
    }
}

function changerStatut(idCommande, nouveauStatut) {
    if (dataManager.mettreAJourCommande(idCommande, { statut: nouveauStatut })) {
        actualiserDonnees();
        showNotification('Statut mis à jour avec succès', 'success');
    } else {
        showNotification('Erreur lors de la mise à jour', 'error');
    }
}

function changerPaiement(idCommande, nouveauPaiement) {
    if (dataManager.mettreAJourCommande(idCommande, { paiement: nouveauPaiement })) {
        actualiserDonnees();
        showNotification('Statut paiement mis à jour', 'success');
    } else {
        showNotification('Erreur lors de la mise à jour', 'error');
    }
}

function changerValidation(idCommande, nouvelleValidation) {
    if (dataManager.mettreAJourCommande(idCommande, { validation: nouvelleValidation })) {
        actualiserDonnees();
        showNotification('Statut validation mis à jour', 'success');
    } else {
        showNotification('Erreur lors de la mise à jour', 'error');
    }
}

function getStatutTexte(statut) {
    const statuts = {
        'devis': 'Devis',
        'traitement': 'En Traitement',
        'termine': 'Terminé'
    };
    return statuts[statut] || statut;
}

function getPaiementTexte(paiement) {
    const paiements = {
        'en_attente': 'En Attente',
        'paye': 'Payé'
    };
    return paiements[paiement] || paiement;
}

function getValidationTexte(validation) {
    const validations = {
        'en_cours': 'Validation en cours',
        'valide': 'Validé',
        'rejete': 'Rejeté'
    };
    return validations[validation] || 'Validation en cours';
}

function actualiserDonnees() {
    chargerTableauDeBord();
    actualiserCompteurs();
    actualiserIndicateurNotifications();
    chargerNotificationsRecentes();
    
    // Mettre à jour les infos debug
    const notifications = dataManager.getNotifications();
    document.getElementById('debugTotalNotifications').textContent = notifications.length;
    document.getElementById('debugNotificationsNonLues').textContent = notifications.filter(n => !n.lue).length;
    document.getElementById('debugLastUpdate').textContent = new Date().toLocaleTimeString();
    
    showNotification('Données actualisées', 'success');
}

function actualiserCommandes() {
    chargerCommandes();
    actualiserCompteurs();
    showNotification('Liste des commandes actualisée', 'success');
}

function deconnexion() {
    sessionStorage.removeItem('msn_utilisateur_connecte');
    sessionStorage.removeItem('msn_login_time');
    window.location.href = 'login.html';
}

// Fonction d'export PDF (version corrigée)
// ===== GÉNÉRATION DE FACTURE IDENTIQUE À FACTURE.JS =====

function genererHTMLDevis(devisData, entreprise) {
    // Calculer le total
    const total = devisData.services.reduce((sum, service) => sum + (service.sousTotal || 0), 0);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${devisData.typeDocument} ${devisData.reference}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
  <style>
    @page {
      margin: 15mm;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      background-color: #fff;
      color: #2c3e50;
      line-height: 1.4;
    }

    h1, h2, h3 {
      color: #2c3e50;
      margin: 0;
    }

    .header, .footer {
      border-top: 4px solid #2c3e50;
      border-bottom: 4px solid #2c3e50;
      padding: 15px 0;
      text-align: center;
    }

    .header h1 {
      font-size: 24px;
      margin-bottom: 5px;
    }

    .header p {
      margin: 3px 0;
      font-size: 14px;
    }

    .section {
      margin-top: 25px;
    }

    .info-table, .services-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }

    .info-table td, .services-table th, .services-table td {
      border: 1px solid #2c3e50;
      padding: 8px;
    }

    .services-table th {
      background-color: #2c3e50;
      color: white;
      font-weight: bold;
    }

    .services-table td {
      text-align: center;
    }

    .services-table td:first-child {
      text-align: left;
    }

    .note {
      font-size: 11px;
      margin-top: 20px;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      border-left: 4px solid #2c3e50;
    }

    .note p {
      margin: 5px 0;
    }

    .contact {
      margin-top: 25px;
      font-size: 11px;
      text-align: center;
    }

    .contact p {
      margin: 3px 0;
    }

    .payment-methods {
      text-align: center;
      margin: 15px 0;
    }

    .payment-logos {
      display: flex;
      justify-content: center;
      gap: 25px;
      margin: 10px 0;
    }

    .operator-logo {
      height: 35px;
      width: auto;
    }

    .devis-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .total-row {
      background-color: #f8f9fa;
      font-weight: bold;
    }

    .payment-section {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
      page-break-inside: avoid;
    }

    .payment-methods-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
      margin: 12px 0;
    }

    .payment-method {
      background: white;
      padding: 12px;
      border-radius: 6px;
      text-align: center;
      border: 1px solid #dee2e6;
      page-break-inside: avoid;
    }

    .operator-logo {
      height: 30px;
      margin-bottom: 8px;
    }

    .operator-name {
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 4px;
      font-size: 11px;
    }

    .operator-number {
      color: #e74c3c;
      font-weight: bold;
      font-size: 12px;
      margin: 4px 0;
    }

    .account-info {
      font-size: 9px;
      color: #666;
      margin-top: 3px;
    }

  </style>
</head>
<body>

  <div class="devis-container">
    <div class="header">
      <h1>${entreprise.nom}</h1>
      <p>Saisie & Conception Graphique Professionnelle</p>
      <p>${entreprise.email} | ${entreprise.telephone}</p>
    </div>

    <div class="section">
      <h2>${devisData.typeDocument} N° ${devisData.reference}</h2>
      <table class="info-table">
        <tr>
          <td><strong><i class="bi bi-person"></i> Client :</strong> ${devisData.client}</td>
          <td><strong><i class="bi bi-calendar"></i> Date :</strong> ${devisData.date}</td>
        </tr>
        <tr>
          <td><strong><i class="bi bi-phone"></i> Contact :</strong> ${devisData.contact || 'Non spécifié'}</td>
          <td><strong><i class="bi bi-clock"></i> Délai :</strong> ${devisData.duree || 'À confirmer'}</td>
        </tr>
      </table>
    </div>

    <div class="section">
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
            <td colspan="3" style="text-align:right;"><strong>${devisData.typeDocument === 'Devis' ? 'ESTIMATION' : 'TOTAL'}</strong></td>
            <td><strong>${total.toLocaleString('fr-FR')} Ar</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="payment-methods-grid">
        <!-- Mvola -->
        <div class="payment-method">
          <img src="../assets/image/logo-mvola.png" class="operator-logo" alt="Mvola">
          <div class="operator-name">Mvola</div>
          <div class="operator-number">${entreprise.mobileMoney.mvola}</div>
          <div class="account-info">Compte au nom de Ismael Randrianasoavina</div>
        </div>
        
        <!-- Airtel Money -->
        <div class="payment-method">
          <img src="../assets/image/logo-airtelmoney.png" class="operator-logo" alt="Airtel Money">
          <div class="operator-name">Airtel Money</div>
          <div class="operator-number">${entreprise.mobileMoney.airtel}</div>
          <div class="account-info">Compte au nom de Ismael Randrianasoavina</div>
        </div>
        
        <!-- Orange Money - CORRIGÉ -->
        <div class="payment-method">
          <img src="../assets/image/logo-orangemoney.png" class="operator-logo" alt="Orange Money"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
          <div class="operator-name">Orange Money</div>
          <div class="operator-number">${entreprise.mobileMoney.orange}</div>
          <div class="account-info">Compte au nom de Ismael Randrianasoavina</div>
        </div>
      </div>

    <div class="section note">
      <p><strong><i class="bi bi-info-circle"></i> Conditions générales :</strong></p>
      <p><i class="bi bi-check-circle"></i> Les fichiers sources sont livrés après validation du paiement</p>
      <p><i class="bi bi-check-circle"></i> Aucun acompte n'est requis - Paiement à la livraison</p>
      <p><i class="bi bi-check-circle"></i> Droit de voir un aperçu avant règlement final</p>
      <p><i class="bi bi-check-circle"></i> Service après-vente inclus pour corrections mineures</p>
      <p><i class="bi bi-check-circle"></i> Traitement confidentiel de tous vos documents</p>
    </div>

    <div class="footer contact">
      <p>Document généré le ${devisData.date} - ${entreprise.nom}</p>
      <p><i class="bi bi-telephone"></i> ${entreprise.telephone}</p>
      <p><i class="bi bi-envelope"></i> ${entreprise.email} | <i class="bi bi-whatsapp"></i> ${entreprise.whatsapp}</p>
    </div>
  </div>

</body>
</html>
    `;
}

// FONCTION genererHTMLDevis CORRIGÉE
function exporterCommande(idCommande) {
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id === idCommande);
    
    if (!commande) {
        showNotification('Commande non trouvée', 'error');
        return;
    }

    console.log('📤 Export PDF de la commande:', commande);

    // Créer une fenêtre d'impression
    const printWindow = window.open('', '_blank');
    const date = new Date().toISOString().split('T')[0];
    const cleanClientName = commande.client.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    
    // Déterminer le type de document selon le statut
    let typeDocument = 'Devis';
    let fileName = `Devis_${cleanClientName}_${date}`;
    
    if (commande.statut === 'traitement') {
        typeDocument = 'Facture';
        fileName = `Facture_${cleanClientName}_${date}`;
    } else if (commande.statut === 'termine') {
        typeDocument = 'Facture_Finale';
        fileName = `Facture_Finale_${cleanClientName}_${date}`;
    }

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

    // Générer la référence selon l'ancienne version
    const referenceDocument = genererReferenceSelonStatut(commande);

    // Préparer les données pour genererHTMLDevis
    const devisData = {
        reference: referenceDocument,
        client: commande.client,
        contact: commande.contact,
        date: new Date(commande.dateCreation).toLocaleDateString('fr-FR'),
        duree: commande.duree,
        services: commande.services,
        typeDocument: typeDocument
    };

    // Générer le HTML pour l'export
    const exportHTML = genererHTMLDevis(devisData, entreprise);

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${typeDocument} - ${commande.client} - Multi-Services Numériques</title>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="../font/bootstrap-icons.css">
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

    showNotification('${typeDocument} exporté en PDF avec succès', 'success');
}

// Fonction pour générer les références selon l'ancienne version
function genererReferenceSelonStatut(commande) {
    const now = new Date();
    const annee = now.getFullYear().toString().substr(-2);
    const mois = (now.getMonth() + 1).toString().padStart(2, '0');
    const jour = now.getDate().toString().padStart(2, '0');
    
    let prefix = 'DEV';
    
    if (commande.statut === 'traitement') {
        prefix = 'FAC';
    } else if (commande.statut === 'termine') {
        prefix = 'FAC-FIN';
    }
    
    // Utiliser l'ID de la commande comme séquence
    const sequence = commande.id.toString().substr(-3);
    
    return `${prefix}-${annee}${mois}${jour}-${sequence}`;
}

// FONCTION genererHTMLDevis CORRIGÉE AVEC LOGOS
function genererHTMLDevis(devisData, entreprise) {
    // Calculer le total
    const total = devisData.services.reduce((sum, service) => sum + (service.sousTotal || 0), 0);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${devisData.typeDocument} ${devisData.reference}</title>
  <link rel="stylesheet" href="../font/bootstrap-icons.css">
  <style>
    @page {
      margin: 15mm;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      background-color: #fff;
      color: #2c3e50;
      line-height: 1.4;
    }

    h1, h2, h3 {
      color: #2c3e50;
      margin: 0;
    }

    .header, .footer {
      border-top: 4px solid #2c3e50;
      border-bottom: 4px solid #2c3e50;
      padding: 15px 0;
      text-align: center;
    }

    .header h1 {
      font-size: 24px;
      margin-bottom: 5px;
    }

    .header p {
      margin: 3px 0;
      font-size: 14px;
    }

    .section {
      margin-top: 25px;
    }

    .info-table, .services-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }

    .info-table td, .services-table th, .services-table td {
      border: 1px solid #2c3e50;
      padding: 8px;
    }

    .services-table th {
      background-color: #2c3e50;
      color: white;
      font-weight: bold;
    }

    .services-table td {
      text-align: center;
    }

    .services-table td:first-child {
      text-align: left;
    }

    .note {
      font-size: 11px;
      margin-top: 20px;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      border-left: 4px solid #2c3e50;
    }

    .note p {
      margin: 5px 0;
    }

    .contact {
      margin-top: 25px;
      font-size: 11px;
      text-align: center;
    }

    .contact p {
      margin: 3px 0;
    }

    .payment-methods {
      text-align: center;
      margin: 15px 0;
    }

    .payment-logos {
      display: flex;
      justify-content: center;
      gap: 25px;
      margin: 10px 0;
    }

    .operator-logo {
      height: 35px;
      width: auto;
    }

    .devis-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .total-row {
      background-color: #f8f9fa;
      font-weight: bold;
    }

    .payment-section {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
      page-break-inside: avoid;
    }

    .payment-methods-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
      margin: 12px 0;
    }

    .payment-method {
      background: white;
      padding: 12px;
      border-radius: 6px;
      text-align: center;
      border: 1px solid #dee2e6;
      page-break-inside: avoid;
    }

    .operator-logo {
      height: 30px;
      margin-bottom: 8px;
    }

    .operator-name {
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 4px;
      font-size: 11px;
    }

    .operator-number {
      color: #e74c3c;
      font-weight: bold;
      font-size: 12px;
      margin: 4px 0;
    }

    .account-info {
      font-size: 9px;
      color: #666;
      margin-top: 3px;
    }

  </style>
</head>
<body>

  <div class="devis-container">
    <div class="header">
      <h1>${entreprise.nom}</h1>
      <p>Saisie & Conception Graphique Professionnelle</p>
      <p>${entreprise.email} | ${entreprise.telephone}</p>
    </div>

    <div class="section">
      <h2>${devisData.typeDocument} N° ${devisData.reference}</h2>
      <table class="info-table">
        <tr>
          <td><strong><i class="bi bi-person"></i> Client :</strong> ${devisData.client}</td>
          <td><strong><i class="bi bi-calendar"></i> Date :</strong> ${devisData.date}</td>
        </tr>
        <tr>
          <td><strong><i class="bi bi-phone"></i> Contact :</strong> ${devisData.contact || 'Non spécifié'}</td>
          <td><strong><i class="bi bi-clock"></i> Délai :</strong> ${devisData.duree || 'À confirmer'}</td>
        </tr>
      </table>
    </div>

    <div class="section">
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
            <td colspan="3" style="text-align:right;"><strong>${devisData.typeDocument === 'Devis' ? 'ESTIMATION' : 'TOTAL'}</strong></td>
            <td><strong>${total.toLocaleString('fr-FR')} Ar</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="payment-methods-grid">
        <!-- Mvola -->
        <div class="payment-method">
          <img src="../assets/image/logo-mvola.png" class="operator-logo" alt="Mvola">
          <div class="operator-name">Mvola</div>
          <div class="operator-number">${entreprise.mobileMoney.mvola}</div>
          <div class="account-info">Compte au nom de Ismael Randrianasoavina</div>
        </div>
        
        <!-- Airtel Money -->
        <div class="payment-method">
          <img src="../assets/image/logo-airtelmoney.png" class="operator-logo" alt="Airtel Money">
          <div class="operator-name">Airtel Money</div>
          <div class="operator-number">${entreprise.mobileMoney.airtel}</div>
          <div class="account-info">Compte au nom de Ismael Randrianasoavina</div>
        </div>
        
        <!-- Orange Money -->
        <div class="payment-method">
          <img src="../assets/image/logo-orangemoney.png" class="operator-logo" alt="Orange Money">
          <div class="operator-name">Orange Money</div>
          <div class="operator-number">${entreprise.mobileMoney.orange}</div>
          <div class="account-info">Compte au nom de Ismael Randrianasoavina</div>
        </div>
      </div>

    <div class="section note">
      <p><strong><i class="bi bi-info-circle"></i> Conditions générales :</strong></p>
      <p><i class="bi bi-check-circle"></i> Les fichiers sources sont livrés après validation du paiement</p>
      <p><i class="bi bi-check-circle"></i> Aucun acompte n'est requis - Paiement à la livraison</p>
      <p><i class="bi bi-check-circle"></i> Droit de voir un aperçu avant règlement final</p>
      <p><i class="bi bi-check-circle"></i> Service après-vente inclus pour corrections mineures</p>
      <p><i class="bi bi-check-circle"></i> Traitement confidentiel de tous vos documents</p>
    </div>

    <div class="footer contact">
      <p>Document généré le ${devisData.date} - ${entreprise.nom}</p>
      <p><i class="bi bi-telephone"></i> ${entreprise.telephone}</p>
      <p><i class="bi bi-envelope"></i> ${entreprise.email} | <i class="bi bi-whatsapp"></i> ${entreprise.whatsapp}</p>
    </div>
  </div>

</body>
</html>
    `;
}

// Exposer les fonctions globalement
window.exporterCommande = exporterCommande;
window.genererHTMLDevis = genererHTMLDevis;
window.genererReferenceSelonStatut = genererReferenceSelonStatut;

// Exposer les fonctions globalement
window.exporterCommande = exporterCommande;
window.genererHTMLDevis = genererHTMLDevis;

// NOUVEAU : Fonction de duplication de commande
function dupliquerCommande(idCommande) {
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id === idCommande);
    
    if (!commande) {
        showNotification('Commande non trouvée', 'error');
        return;
    }

    // Créer une nouvelle commande basée sur l'ancienne
    const nouvelleCommande = {
        ...commande,
        id: Date.now(),
        reference: genererNouvelleReference('DEV'),
        dateCreation: new Date().toISOString(),
        statut: 'devis',
        paiement: 'en_attente',
        validation: 'en_cours',
        referencePaiement: ''
    };

    // Ajouter à la base de données
    const toutesCommandes = dataManager.getCommandes();
    toutesCommandes.push(nouvelleCommande);
    localStorage.setItem('msn_commandes', JSON.stringify(toutesCommandes));

    showNotification('Commande dupliquée avec succès', 'success');
    actualiserDonnees();
}

function genererNouvelleReference(type = 'DEV') {
    const now = new Date();
    const annee = now.getFullYear().toString().substr(-2);
    const mois = (now.getMonth() + 1).toString().padStart(2, '0');
    const jour = now.getDate().toString().padStart(2, '0');
    const sequence = Date.now().toString().substr(-3);
    
    return `${type}-${annee}${mois}${jour}-${sequence}`;
}

function chargerClients() {
    const commandes = dataManager.getCommandes();
    const clients = {};
    
    // Compter les commandes par client
    commandes.forEach(commande => {
        if (!clients[commande.client]) {
            clients[commande.client] = {
                nom: commande.client,
                contact: commande.contact,
                totalCommandes: 0,
                totalDepense: 0,
                derniereCommande: commande.dateCreation
            };
        }
        clients[commande.client].totalCommandes++;
        const montant = parseFloat(commande.total.replace(/[^0-9]/g, '')) || 0;
        clients[commande.client].totalDepense += montant;
        
        if (new Date(commande.dateCreation) > new Date(clients[commande.client].derniereCommande)) {
            clients[commande.client].derniereCommande = commande.dateCreation;
        }
    });
    
    const clientsArray = Object.values(clients).sort((a, b) => b.totalDepense - a.totalDepense);
    
    const container = document.getElementById('liste-clients');
    if (!container) return;
    
    if (clientsArray.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">👥</div>
                <h3>Aucun client</h3>
                <p>Les clients apparaîtront ici après création de commandes.</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="stats-grid mb-4">
                <div class="stat-card" style="border-left-color: #3498db;">
                    <h3>${clientsArray.length}</h3>
                    <p>Clients Totaux</p>
                </div>
                <div class="stat-card" style="border-left-color: #27ae60;">
                    <h3>${Math.max(...clientsArray.map(c => c.totalCommandes))}</h3>
                    <p>Max Commandes/Client</p>
                </div>
            </div>
            
            <div class="table-responsive-custom">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Contact</th>
                            <th>Commandes</th>
                            <th>Total Dépensé</th>
                            <th>Dernière Commande</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clientsArray.map(client => `
                            <tr>
                                <td><strong>${client.nom}</strong></td>
                                <td>${client.contact || 'Non spécifié'}</td>
                                <td>${client.totalCommandes}</td>
                                <td>${client.totalDepense.toLocaleString('fr-MG')} Ar</td>
                                <td>${new Date(client.derniereCommande).toLocaleDateString('fr-FR')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

function chargerFinances() {
    const stats = dataManager.getStatistiques();
    const commandes = dataManager.getCommandes();
    
    // Calculer les statistiques financières détaillées
    const commandesPayees = commandes.filter(c => c.paiement === 'paye');
    const totalEncaisse = commandesPayees.reduce((total, cmd) => {
        const montant = parseFloat(cmd.total.replace(/[^0-9]/g, '')) || 0;
        return total + montant;
    }, 0);
    
    const commandesEnAttente = commandes.filter(c => c.paiement === 'en_attente');
    const totalAttente = commandesEnAttente.reduce((total, cmd) => {
        const montant = parseFloat(cmd.total.replace(/[^0-9]/g, '')) || 0;
        return total + montant;
    }, 0);

    const container = document.getElementById('stats-finances');
    if (!container) return;

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card" style="border-left-color: #27ae60;">
                <h3>${totalEncaisse.toLocaleString('fr-MG')} Ar</h3>
                <p>Total Encaissé</p>
            </div>
            <div class="stat-card" style="border-left-color: #3498db;">
                <h3>${stats.caMensuel.toLocaleString('fr-MG')} Ar</h3>
                <p>CA Ce Mois</p>
            </div>
            <div class="stat-card" style="border-left-color: #e74c3c;">
                <h3>${totalAttente.toLocaleString('fr-MG')} Ar</h3>
                <p>En Attente de Paiement</p>
            </div>
            <div class="stat-card" style="border-left-color: #f39c12;">
                <h3>${stats.commandesTerminees}</h3>
                <p>Commandes Terminées</p>
            </div>
        </div>
        
        <div class="mt-4">
            <h3>📈 Répartition des Paiements</h3>
            <div class="stats-grid mt-3">
                <div class="stat-card" style="border-left-color: #27ae60;">
                    <h4>Payées</h4>
                    <h3>${commandesPayees.length}</h3>
                    <p>${totalEncaisse.toLocaleString('fr-MG')} Ar</p>
                </div>
                <div class="stat-card" style="border-left-color: #f39c12;">
                    <h4>En Attente</h4>
                    <h3>${commandesEnAttente.length}</h3>
                    <p>${totalAttente.toLocaleString('fr-MG')} Ar</p>
                </div>
            </div>
        </div>
    `;
}

function chargerParametres() {
    const parametres = dataManager.getParametres();
    
    // Pré-remplir les champs avec les paramètres existants
    if (parametres.nom) document.getElementById('param-nom').value = parametres.nom;
    if (parametres.telephone) document.getElementById('param-telephone').value = parametres.telephone;
    if (parametres.email) document.getElementById('param-email').value = parametres.email;
    if (parametres.mobileMoney) {
        if (parametres.mobileMoney.mvola) document.getElementById('param-mvola').value = parametres.mobileMoney.mvola;
        if (parametres.mobileMoney.airtel) document.getElementById('param-airtel').value = parametres.mobileMoney.airtel;
        if (parametres.mobileMoney.orange) document.getElementById('param-orange').value = parametres.mobileMoney.orange;
    }
}

function sauvegarderParametres() {
    const parametres = {
        nom: document.getElementById('param-nom').value,
        telephone: document.getElementById('param-telephone').value,
        email: document.getElementById('param-email').value,
        mobileMoney: {
            mvola: document.getElementById('param-mvola').value,
            airtel: document.getElementById('param-airtel').value,
            orange: document.getElementById('param-orange').value
        }
    };
    
    if (dataManager.sauvegarderParametres(parametres)) {
        showNotification('Paramètres sauvegardés avec succès', 'success');
    } else {
        showNotification('Erreur lors de la sauvegarde', 'error');
    }
}

// Fonctions utilitaires
function voirDetails(idCommande) {
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id === idCommande);
    
    if (commande) {
        const details = `
Référence: ${commande.reference}
Client: ${commande.client}
Contact: ${commande.contact}
Total: ${commande.total}
Statut: ${getStatutTexte(commande.statut)}
Paiement: ${getPaiementTexte(commande.paiement)}
Validation: ${getValidationTexte(commande.validation)}
Date: ${new Date(commande.dateCreation).toLocaleString('fr-FR')}
${commande.duree ? `Durée: ${commande.duree}` : ''}
${commande.referencePaiement ? `Réf. Paiement: ${commande.referencePaiement}` : ''}

Services:
${commande.services.map(s => `- ${s.nom} (${s.quantite} ${s.unite}) : ${s.sousTotal.toLocaleString('fr-MG')} Ar`).join('\n')}
        `;
        
        alert('Détails de la commande:\n\n' + details);
    }
}

function viderDonnees() {
    if (confirm('Êtes-vous sûr de vouloir vider toutes les données de test ? Cette action est irréversible.')) {
        dataManager.nettoyerDonnees();
        actualiserDonnees();
        showNotification('Données vidées', 'success');
    }
}

function showNotification(message, type = 'info') {
    // Créer une notification Bootstrap
    const alertClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    }[type] || 'alert-info';

    const notification = document.createElement('div');
    notification.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        max-width: 90vw;
    `;
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ===== SYSTÈME DE NOTIFICATIONS =====

function actualiserIndicateurNotifications() {
    const stats = dataManager.getStatistiques();
    const notificationsNonLues = stats.notificationsNonLues || 0;
    
    // Mettre à jour tous les indicateurs
    const indicateurs = [
        'badge-notifications-nav',
        'notification-count'
    ];
    
    indicateurs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = notificationsNonLues;
            element.style.display = notificationsNonLues > 0 ? 'inline-block' : 'none';
        }
    });
    
    // Afficher/masquer l'indicateur dans le header
    const headerNotifications = document.getElementById('header-notifications');
    if (headerNotifications) {
        headerNotifications.style.display = notificationsNonLues > 0 ? 'block' : 'none';
    }
}

function chargerNotificationsRecentes() {
    const notifications = dataManager.getNotifications().slice(0, 5);
    const container = document.getElementById('notifications-recentes');
    
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🔔</div>
                <h3>Aucune notification</h3>
                <p>Les notifications apparaîtront ici automatiquement.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification-card ${!notif.lue ? 'non-lue' : ''} ${notif.type}">
            <div class="notification-header">
                <div class="notification-titre">
                    <span class="badge bg-${notif.type === 'success' ? 'success' : notif.type === 'warning' ? 'warning' : notif.type === 'error' ? 'danger' : 'info'} me-2">${getTypeNotification(notif.type)}</span>
                    ${notif.titre}
                </div>
                <div class="notification-date">${new Date(notif.dateCreation).toLocaleDateString('fr-FR')}</div>
            </div>
            <div class="notification-message">${notif.message}</div>
            <div class="notification-actions">
                ${!notif.lue ? `<button onclick="marquerNotificationLue(${notif.id})" class="btn btn-custom btn-custom-sm btn-success">✅ Lu</button>` : ''}
                <button onclick="supprimerNotification(${notif.id})" class="btn btn-custom btn-custom-sm btn-danger">🗑️</button>
                ${notif.commandeId ? `<button onclick="voirCommandeAssociee(${notif.commandeId})" class="btn btn-custom btn-custom-sm btn-primary">📋 Voir</button>` : ''}
            </div>
        </div>
    `).join('');
}

function chargerNotifications(filtre = 'toutes') {
    let notifications = dataManager.getNotifications();
    
    // Appliquer les filtres
    switch(filtre) {
        case 'non-lues':
            notifications = notifications.filter(notif => !notif.lue);
            break;
        case 'alertes':
            notifications = notifications.filter(notif => 
                notif.type === 'warning' || notif.type === 'error'
            );
            break;
        case 'rappels':
            notifications = notifications.filter(notif => 
                notif.titre.includes('Rappel') || notif.titre.includes('rappels')
            );
            break;
    }
    
    const containerId = `liste-notifications${filtre !== 'toutes' ? '-' + filtre : ''}`;
    const container = document.getElementById(containerId) || document.getElementById('liste-notifications');
    
    if (!container) return;
    
    // Mettre à jour les compteurs
    const totalNotifications = dataManager.getNotifications().length;
    const nonLues = dataManager.getNotifications().filter(n => !n.lue).length;
    const alertes = dataManager.getNotifications().filter(n => n.type === 'warning' || n.type === 'error').length;
    const rappels = dataManager.getNotifications().filter(n => n.titre.includes('Rappel') || n.titre.includes('rappels')).length;
    
    document.getElementById('count-notif-toutes').textContent = totalNotifications;
    document.getElementById('count-notif-non-lues').textContent = nonLues;
    document.getElementById('count-notif-alertes').textContent = alertes;
    document.getElementById('count-notif-rappels').textContent = rappels;
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🔔</div>
                <h3>Aucune notification ${filtre !== 'toutes' ? getFiltreNotificationTexte(filtre) : ''}</h3>
                <p>${getMessageVideNotifications(filtre)}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification-card ${!notif.lue ? 'non-lue' : ''} ${notif.type}">
            <div class="notification-header">
                <div class="notification-titre">
                    <span class="badge bg-${notif.type === 'success' ? 'success' : notif.type === 'warning' ? 'warning' : notif.type === 'error' ? 'danger' : 'info'} me-2">${getTypeNotification(notif.type)}</span>
                    ${notif.titre}
                </div>
                <div class="notification-date">
                    ${new Date(notif.dateCreation).toLocaleString('fr-FR')}
                    ${!notif.lue ? '<span class="text-danger ms-2">●</span>' : ''}
                </div>
            </div>
            <div class="notification-message">${notif.message}</div>
            <div class="notification-actions">
                ${!notif.lue ? `
                    <button onclick="marquerNotificationLue(${notif.id})" class="btn btn-custom btn-custom-sm btn-success">
                        ✅ Marquer comme lu
                    </button>
                ` : ''}
                <button onclick="supprimerNotification(${notif.id})" class="btn btn-custom btn-custom-sm btn-danger">
                    🗑️ Supprimer
                </button>
                ${notif.commandeId ? `
                    <button onclick="voirCommandeAssociee(${notif.commandeId})" class="btn btn-custom btn-custom-sm btn-primary">
                        📋 Voir commande
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getFiltreNotificationTexte(filtre) {
    const textes = {
        'toutes': '',
        'non-lues': 'non lue',
        'alertes': "d'alerte", 
        'rappels': 'de rappel'
    };
    return textes[filtre] || '';
}

function getMessageVideNotifications(filtre) {
    const messages = {
        'toutes': 'Les notifications apparaîtront ici automatiquement pour les nouvelles commandes, rappels et alertes.',
        'non-lues': 'Toutes les notifications ont été lues !',
        'alertes': "Aucune alerte pour le moment.",
        'rappels': 'Aucun rappel en attente.'
    };
    return messages[filtre] || messages.toutes;
}

function getTypeNotification(type) {
    const types = {
        'info': 'ℹ️ Info',
        'success': '✅ Succès',
        'warning': '⚠️ Alerte',
        'error': '❌ Erreur'
    };
    return types[type] || 'ℹ️ Info';
}

function marquerNotificationLue(notificationId) {
    if (dataManager.marquerCommeLue(notificationId)) {
        actualiserNotifications();
        showNotification('Notification marquée comme lue', 'success');
    } else {
        showNotification('Erreur lors du marquage', 'error');
    }
}

function marquerToutesCommeLues() {
    const notificationsNonLues = dataManager.getNotifications().filter(n => !n.lue);
    if (notificationsNonLues.length === 0) {
        showNotification('Aucune notification à marquer comme lue', 'info');
        return;
    }
    
    if (confirm(`Marquer ${notificationsNonLues.length} notification(s) comme lue(s) ?`)) {
        notificationsNonLues.forEach(notif => {
            dataManager.marquerCommeLue(notif.id);
        });
        actualiserNotifications();
        showNotification(`${notificationsNonLues.length} notification(s) marquée(s) comme lue(s)`, 'success');
    }
}

function supprimerNotification(notificationId) {
    if (confirm('Supprimer cette notification ?')) {
        if (dataManager.supprimerNotification(notificationId)) {
            actualiserNotifications();
            showNotification('Notification supprimée', 'success');
        } else {
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

function supprimerNotificationsLues() {
    const notificationsLues = dataManager.getNotifications().filter(n => n.lue);
    
    if (notificationsLues.length === 0) {
        showNotification('Aucune notification lue à supprimer', 'info');
        return;
    }
    
    if (confirm(`Supprimer ${notificationsLues.length} notification(s) lue(s) ?`)) {
        notificationsLues.forEach(notif => {
            dataManager.supprimerNotification(notif.id);
        });
        actualiserNotifications();
        showNotification(`${notificationsLues.length} notification(s) lue(s) supprimée(s)`, 'success');
    }
}

function voirCommandeAssociee(commandeId) {
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id === commandeId);
    
    if (commande) {
        const details = `
Référence: ${commande.reference}
Client: ${commande.client}
Contact: ${commande.contact}
Total: ${commande.total}
Statut: ${getStatutTexte(commande.statut)}
Paiement: ${getPaiementTexte(commande.paiement)}
Validation: ${getValidationTexte(commande.validation)}
Date: ${new Date(commande.dateCreation).toLocaleString('fr-FR')}

Services:
${commande.services.map(s => `- ${s.nom} (${s.quantite} ${s.unite}) : ${s.sousTotal.toLocaleString('fr-MG')} Ar`).join('\n')}
        `;
        
        alert('Détails de la commande associée:\n\n' + details);
        
        // Passer à la section commandes
        showSection('commandes');
    } else {
        showNotification('Commande non trouvée', 'error');
    }
}

function actualiserNotifications() {
    chargerNotifications();
    chargerNotificationsRecentes();
    actualiserIndicateurNotifications();
}

function verifierRappelsAutomatiques() {
    const nbNouvellesNotifications = dataManager.verifierRappelsAutomatiques();
    if (nbNouvellesNotifications > 0) {
        actualiserNotifications();
        showNotification(`${nbNouvellesNotifications} nouveau(x) rappel(s) généré(s)`, 'success');
    } else {
        showNotification('Aucun nouveau rappel nécessaire', 'info');
    }
}

function testerNotifications() {
    // Générer des notifications de test
    dataManager.ajouterNotification(
        "🧪 Notification de test",
        "Ceci est une notification de test pour vérifier le système.",
        'info'
    );
    
    dataManager.ajouterNotification(
        "⚠️ Alerte de test",
        "Ceci est une alerte de test pour les commandes en retard.",
        'warning'
    );
    
    dataManager.ajouterNotification(
        "✅ Succès de test", 
        "Ceci est une notification de succès pour une commande terminée.",
        'success'
    );
    
    actualiserNotifications();
    showNotification('3 notifications de test générées', 'success');
}

function nettoyerToutesLesDonneesCorrompues() {
    // Nettoyer les communications existantes
    let communications = JSON.parse(localStorage.getItem('msn_communications') || '[]');
    communications = communications.map(comm => {
        return {
            ...comm,
            sujet: nettoyerTexteCorrompu(comm.sujet),
            message: nettoyerTexteCorrompu(comm.message)
        };
    });
    localStorage.setItem('msn_communications', JSON.stringify(communications));
    
    console.log('Données corrompues nettoyées');
}

function debugCommandes() {
    const commandes = dataManager.getCommandes();
    console.log('=== DEBUG COMMANDES ===');
    console.log('Nombre de commandes:', commandes.length);
    commandes.forEach((cmd, index) => {
        console.log(`Commande ${index}:`, {
            id: cmd.id,
            reference: cmd.reference,
            client: cmd.client,
            contact: cmd.contact
        });
    });
    console.log('=======================');
}
// ... (Les autres fonctions existantes restent inchangées)

// ===== EXPOSITION DES FONCTIONS GLOBALES =====
window.showSection = showSection;
window.exporterCommande = exporterCommande;
window.dupliquerCommande = dupliquerCommande;
window.changerStatut = changerStatut;
window.changerPaiement = changerPaiement;
window.changerValidation = changerValidation;
window.actualiserDonnees = actualiserDonnees;
window.actualiserCommandes = actualiserCommandes;
window.deconnexion = deconnexion;
window.sauvegarderParametres = sauvegarderParametres;
window.viderDonnees = viderDonnees;
window.voirDetails = voirDetails;
window.marquerNotificationLue = marquerNotificationLue;
window.marquerToutesCommeLues = marquerToutesCommeLues;
window.supprimerNotification = supprimerNotification;
window.supprimerNotificationsLues = supprimerNotificationsLues;
window.voirCommandeAssociee = voirCommandeAssociee;
window.actualiserNotifications = actualiserNotifications;
window.verifierRappelsAutomatiques = verifierRappelsAutomatiques;
window.testerNotifications = testerNotifications;
window.initialiserModuleRapports = initialiserModuleRapports;
window.genererRapportMiseAJour = genererRapportMiseAJour;
window.genererPDFRapport = genererPDFRapport;
window.afficherFormulaireMessage = afficherFormulaireMessage;
window.chargerMessagePredefini = chargerMessagePredefini;
window.changerLangueMessage = changerLangueMessage;
window.reformulerMessage = reformulerMessage;
window.traduireMessage = traduireMessage;
window.ajouterVariables = ajouterVariables;
window.envoyerMessage = envoyerMessage;
window.envoyerMessageViaPlateforme = envoyerMessageViaPlateforme;
window.testeurMessage = testeurMessage;
window.exporterDonneesExcel = exporterDonneesExcel;
window.importerDonneesExcel = importerDonneesExcel;
window.chargerCommunication = chargerCommunication;
window.voirDetailsCommunication = voirDetailsCommunication;
window.remplacerVariablesAutomatiques = remplacerVariablesAutomatiques;
window.ouvrirApplicationMessage = ouvrirApplicationMessage;
window.nettoyerTexteCorrompu = nettoyerTexteCorrompu;

// Initialisation des événements Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    const ordersTabs = document.querySelectorAll('#ordersTab button[data-bs-toggle="tab"]');
    ordersTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            const target = event.target.getAttribute('data-bs-target');
            const filtre = target.replace('#', '');
            chargerCommandes(filtre === 'toutes' ? 'toutes' : filtre);
        });
    });

    const notificationsTabs = document.querySelectorAll('#notificationsTab button[data-bs-toggle="tab"]');
    notificationsTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            const target = event.target.getAttribute('data-bs-target');
            const filtre = target.replace('#notif-', '');
            chargerNotifications(filtre);
        });
    });
});