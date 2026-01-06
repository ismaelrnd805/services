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
    setTimeout(() => {
            if (typeof initialiserServicesRapides === 'function') {
                initialiserServicesRapides();
            }
        }, 1000);

}

// ===== SYSTÈME DE MESSAGES PRÉ-ENREGISTRÉS =====

const MESSAGES_PRE_ENREGISTRES = {
    fr: {
       accueil_nouveau_client: {
        titre: "Bienvenue et présentation de nos services",
        message: "Bonjour [client],\n\nNous vous remercions de votre intérêt pour Multi-Services Numériques !\n\nNous sommes spécialisés dans :\n• La saisie et mise en forme de documents\n• La création graphique (logos, affiches, vectorisation)\n• La conception de tableaux et graphiques professionnels\n\nSans acompte requis - Paiement à la livraison - Support WhatsApp inclus\n\nN'hésitez pas à nous consulter pour toute demande spécifique.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    reponse_premier_contact: {
        titre: "Réponse à une première demande d'information",
        message: "Bonjour [client],\n\nNous accusons réception de votre demande et vous remercions pour votre intérêt.\n\nPour mieux répondre à vos besoins, pourriez-vous nous préciser :\n• La nature exacte de votre projet\n• Les délais souhaités\n• Toute spécificité technique requise\n\nNous restons à votre disposition pour toute information complémentaire.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    presentation_services: {
        titre: "Présentation détaillée de nos services",
        message: "Bonjour [client],\n\nVoici nos principales prestations :\n\n📄 SERVICES DE SAISIE & MISE EN FORME\n• Saisie document : 700 à 1,000 Ar/page\n• Mise en forme : 400 à 1,000 Ar/page\n• Tableaux : 1,000 à 1,500 Ar/tableau\n• Figures complexes : 1,500 Ar/figure\n\n🎨 CONCEPTION GRAPHIQUE\n• Logos : 50,000 Ar/logo\n• Vectorisation : 25,000 Ar/image\n• Graphiques/Organigrammes : 1,500 Ar/élément\n\n🖼️ CRÉATION D'AFFICHES\n• Basique : 10,000 Ar\n• Standard : 20,000 Ar  \n• PRO : 30,000 Ar\n\nSans acompte - Livraison sous 1-7 jours - Support inclus\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    orientation_vers_devis: {
        titre: "Orientation vers une demande de devis",
        message: "Bonjour [client],\n\nSuite à notre échange, nous vous invitons à compléter un devis personnalisé pour votre projet.\n\nPour cela, merci de nous préciser :\n• La liste détaillée des services souhaités\n• Les quantités pour chaque service\n• Toute exigence particulière\n\nNous établirons alors un devis précis sans engagement.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    clarification_besoin: {
        titre: "Question pour clarifier le besoin client",
        message: "Bonjour [client],\n\nAfin de mieux comprendre votre besoin pour le projet [reference], pourriez-vous nous éclairer sur les points suivants :\n\n[points_à_clarifier]\n\nVos précisions nous permettront de vous proposer la solution la plus adaptée.\n\nMerci pour votre collaboration.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    confirmation_commande: {
        titre: "Commande confirmee",
        message: "Bonjour [client],\n\nNous confirmons la reception de votre commande [reference]. Notre equipe la prend en charge et vous tiendra informe a chaque etape.\n\nMerci pour votre confiance.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    devis_envoye: {
        titre: "Devis envoye",
        message: "Bonjour [client],\n\nVeuillez trouver ci-joint le devis correspondant a votre demande [reference].\n\nMerci de le verifier et de nous confirmer votre accord afin que nous puissions lancer la realisation.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    devis_accepte: {
        titre: "Devis accepte",
        message: "Bonjour [client],\n\nNous confirmons la validation de votre devis [reference].\n\nLa production va commencer selon les termes convenus. Vous serez informe du suivi de votre commande.\n\nMerci pour votre confiance.\n\nBien cordialement,\nL'equipe Multi-Services Numeriques"
    },

    facture_envoyee: {
        titre: "Facture envoyee",
        message: "Bonjour [client],\n\nVeuillez trouver ci-joint la facture correspondant a la commande [reference].\n\nMerci d'effectuer le reglement avant le [date_limite] pour eviter tout retard de traitement.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    confirmation_paiement: {
        titre: "Paiement confirme",
        message: "Bonjour [client],\n\nNous confirmons la reception de votre paiement d'un montant de [montant] pour la commande [reference].\n\nLe traitement de votre commande est desormais en cours.\n\nMerci pour votre confiance.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    relance_paiement: {
        titre: "Relance de paiement",
        message: "Bonjour [client],\n\nNous vous rappelons que le paiement de la facture liee a la commande [reference] reste en attente.\n\nMerci d'effectuer le reglement dans les plus brefs delais ou de nous informer si le paiement a deja ete effectue.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    accompagnement_fichier: {
        titre: "Fichiers livres",
        message: "Bonjour [client],\n\nVeuillez trouver ci-joint les fichiers finaux de votre commande [reference].\n\nNous esperons qu'ils repondent a vos attentes. Merci de confirmer leur bonne reception.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    livraison_confirmee: {
        titre: "Livraison confirmee",
        message: "Bonjour [client],\n\nVotre commande [reference] a ete livree avec succes.\n\nNous restons disponibles pour toute question ou ajustement eventuel.\n\nMerci pour votre confiance.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    facture_finale: {
        titre: "Facture finale",
        message: "Bonjour [client],\n\nVotre commande [reference] est maintenant terminée et validée.\n\nVeuillez trouver ci-joint la facture finale correspondant au travail réalisé.\n\nNous vous remercions pour votre confiance et restons disponibles pour toute question ou besoin futur.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    facture_avant_livraison: {
        titre: "Facture avant livraison",
        message: "Bonjour [client],\n\nVotre commande [reference] est prête pour livraison.\n\nVeuillez trouver ci-joint la facture à régler avant que nous procédions à l'envoi des fichiers finaux.\n\nDès réception du paiement, nous vous transmettrons immédiatement l'ensemble des livrables.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    rappel_facture_avant_livraison: {
        titre: "Rappel - Facture en attente",
        message: "Bonjour [client],\n\nRappel concernant votre commande [reference] : la facture reste en attente de règlement.\n\nVos fichiers sont prêts et vous seront transmis immédiatement après réception du paiement.\n\nMerci de procéder au règlement pour que nous puissions finaliser la livraison.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    confirmation_livraison_immediate: {
        titre: "Livraison immédiate après paiement",
        message: "Bonjour [client],\n\nVotre commande [reference] est terminée et prête à être livrée.\n\nDès que nous aurons confirmé la réception de votre paiement, nous vous enverrons immédiatement l'ensemble des fichiers par email/WhatsApp.\n\nTemps de livraison estimé : moins de 30 minutes après confirmation de paiement.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    annulation_commande: {
        titre: "Commande annulee",
        message: "Bonjour [client],\n\nVotre commande [reference] a ete annulee a votre demande / suite a [raison].\n\nSi vous souhaitez la reactiver ou en creer une nouvelle, notre equipe est a votre disposition.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    accompagnement_apercu: {
        titre: "Accompagnement pour l'aperçu",
        message: "Bonjour [client],\n\nComme convenu, voici l'aperçu de votre commande [reference].\n\nNous restons à votre entière disposition pour :\n• Toute demande de modification\n• Des ajustements spécifiques\n• Des précisions supplémentaires\n\nN'hésitez pas à nous faire part de vos retours - nous sommes là pour perfectionner le résultat jusqu'à votre entière satisfaction.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    accompagnement_saisie: {
        titre: "Votre document saisi est prêt",
        message: "Bonjour [client],\n\nLa saisie de votre document pour la commande [reference] est maintenant terminée.\n\nVeuillez trouver ci-joint le fichier finalisé.\n\nMerci de vérifier l'exactitude du contenu et de nous faire part de toute correction nécessaire.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    accompagnement_mise_en_forme: {
        titre: "Votre mise en forme est terminée",
        message: "Bonjour [client],\n\nLa mise en forme de votre document pour la commande [reference] est finalisée.\n\nLe document a été structuré selon vos consignes avec une présentation professionnelle.\n\nVeuillez vérifier le rendu et nous indiquer vos éventuels ajustements.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    accompagnement_tableau: {
        titre: "Vos tableaux sont finalisés",
        message: "Bonjour [client],\n\nLa création/mise en forme de vos tableaux pour la commande [reference] est achevée.\n\nLes tableaux ont été optimisés pour une lecture claire et une présentation professionnelle.\n\nMerci de valider leur conformité à vos attentes.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    accompagnement_graphique: {
        titre: "Vos graphiques et illustrations sont prêts",
        message: "Bonjour [client],\n\nLa création de vos graphiques et illustrations pour la commande [reference] est terminée.\n\nNous avons veillé à respecter vos spécifications tout en garantissant une qualité visuelle optimale.\n\nVeuillez trouver ci-joint les fichiers finaux.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    accompagnement_logo: {
        titre: "Votre logo est créé !",
        message: "Bonjour [client],\n\nVotre logo pour la commande [reference] est maintenant finalisé !\n\nNous avons conçu une identité visuelle qui reflète votre image et répond à vos attentes.\n\nVeuillez trouver ci-joint les différentes versions du logo avec les fichiers sources.\n\nNous attendons avec impatience votre retour.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    accompagnement_affiche: {
        titre: "Votre affiche est conçue",
        message: "Bonjour [client],\n\nLa conception de votre affiche pour la commande [reference] est achevée.\n\nNous avons créé un visuel attractif et percutant qui répond à votre brief créatif.\n\nVeuillez trouver ci-joint le fichier haute résolution prêt à l'impression.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    accompagnement_vectorisation: {
        titre: "Vos images sont vectorisées",
        message: "Bonjour [client],\n\nLa vectorisation de vos images pour la commande [reference] est terminée.\n\nVos images sont maintenant dans un format vectoriel, permettant un redimensionnement sans perte de qualité.\n\nVeuillez trouver ci-joint les fichiers vectoriels aux formats demandés.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    accompagnement_pack_complet: {
        titre: "Votre pack graphique complet est prêt",
        message: "Bonjour [client],\n\nVotre pack graphique complet pour la commande [reference] est finalisé !\n\nL'ensemble des éléments (logo, charte graphique, supports de communication) sont maintenant disponibles.\n\nVeuillez trouver ci-joint l'archive complète avec tous les fichiers et leurs différentes versions.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    prise_instructions: {
        titre: "Prise en compte de vos instructions",
        message: "Bonjour [client],\n\nNous accusons réception de vos remarques/instructions concernant la commande [reference].\n\nNous avons bien noté :\n[details]\n\nCes éléments sont dès à présent intégrés à notre travail en cours. Nous vous tiendrons informé de l'avancement.\n\nMerci pour votre précieuse collaboration.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    rappel_gentil_livraison: {
        titre: "Votre commande vous attend :)",
        message: "Bonjour [client],\n\nPetit rappel amical : votre commande [reference] est prête et vous attend !\n\nNous sommes impatients de vous livrer le résultat de notre travail.\n\nN'hésitez pas à nous contacter pour finaliser la livraison.\n\nBien cordialement,\nL'equipe Multi-Services Numeriques"
    },

    offre_dernier_jour: {
        titre: "Dernier jour - Votre commande est prête !",
        message: "Bonjour [client],\n\nDernier jour pour récupérer votre commande [reference] !\n\nVos fichiers sont prêts et nous attendons votre retour pour procéder à la livraison.\n\nNe tardez pas, nous serions ravis de vous transmettre le résultat de notre collaboration.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    demande_informations: {
        titre: "Informations complementaires requises",
        message: "Bonjour [client],\n\nAfin de poursuivre le traitement de votre commande [reference], nous avons besoin de precisions supplementaires : [details].\n\nMerci pour votre retour rapide.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    checkpoint_progression: {
        titre: "Point d'avancement du projet",
        message: "Bonjour [client],\n\nPoint d'avancement de votre commande [reference] :\n\n📊 ÉTAT ACTUEL\n• Avancement global : [pourcentage]%\n• État : [état_actuel]\n• Prochaine étape : [prochaine_étape]\n\n✅ TRAVAUX RÉALISÉS\n[travaux_réalisés]\n\n🔄 PROCHAINES ÉTAPES\n[prochaines_étapes]\n\nTout se déroule conformément au planning.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    rappel_echeance: {
        titre: "Rappel d'échéance approchante",
        message: "Bonjour [client],\n\nRappel concernant votre commande [reference] :\n\n📅 ÉCHÉANCE APPROCHANTE\n• Date limite : [date_échéance]\n• Élément concerné : [élément_échéance]\n• Actions requises : [actions_requises]\n\nMerci de nous fournir les éléments nécessaires avant cette date pour éviter tout retard.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    verification_satisfaction: {
        titre: "Vérification de la satisfaction client",
        message: "Bonjour [client],\n\nNous souhaiterions avoir votre retour sur le déroulement de votre commande [reference] jusqu'à présent.\n\nÊtes-vous satisfait :\n• De la communication ?\n• De la qualité du travail fourni ?\n• Du respect des délais ?\n\nVotre feedback nous est précieux pour continuellement améliorer nos services.\n\nMerci pour votre confiance.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    offre_assistance: {
        titre: "Proposition d'assistance supplémentaire",
        message: "Bonjour [client],\n\nDans le cadre de votre commande [reference], nous remarquons que vous pourriez bénéficier de notre assistance sur :\n\n[domaines_assistance]\n\nNous proposons :\n[type_assistance]\n\nSouhaitez-vous que nous vous accompagnons sur ces aspects ?\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    prevention_retard: {
        titre: "Prévention d'un retard potentiel",
        message: "Bonjour [client],\n\nNous tenons à vous informer d'un risque de léger retard sur votre commande [reference] en raison de :\n\n[raison_retard]\n\nMesures correctives en cours :\n[mesures_correctives]\n\nNouvelle estimation de livraison : [nouvelle_date]\n\nNous mettons tout en œuvre pour minimiser cet impact.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    retard_livraison: {
        titre: "Retard de livraison",
        message: "Bonjour [client],\n\nNous rencontrons un leger retard sur la commande [reference].\n\nNotre equipe met tout en œuvre pour vous livrer dans les plus brefs delais.\n\nMerci pour votre comprehension.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    excuse_retard_precis: {
        titre: "Retard de livraison - Délai précis",
        message: "Bonjour [client],\n\nNous tenons à vous présenter nos plus sincères excuses pour le retard concernant votre commande [reference].\n\nEn raison de [raison du retard], nous rencontrons un délai supplémentaire.\n\nNous nous engageons à vous livrer au plus tard le [date précise] à [heure précise].\n\nToute notre équipe est mobilisée pour respecter ce nouvel engagement.\n\nNous comprenons votre impatience et faisons tout notre possible pour vous fournir un travail de qualité dans les meilleurs délais.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    probleme_technique: {
        titre: "Probleme technique",
        message: "Bonjour [client],\n\nUn probleme technique temporaire affecte votre commande [reference].\n\nNos techniciens sont mobilises pour le resoudre rapidement. Nous vous tiendrons informe des retablissement complet.\n\nMerci pour votre comprehension.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    excuse_insatisfaction: {
        titre: "Nos excuses - Insatisfaction",
        message: "Bonjour [client],\n\nNous sommes sincèrement désolés d'apprendre que le résultat de votre commande [reference] ne correspond pas à vos attentes.\n\nVotre satisfaction est notre priorité absolue. Nous nous engageons à revoir intégralement votre projet et à apporter toutes les corrections nécessaires pour répondre parfaitement à vos besoins.\n\nNotre équipe est déjà mobilisée pour reprendre le travail et vous proposer une version améliorée dans les plus brefs délais.\n\nMerci de nous donner cette opportunité de nous rattraper.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    reponse_urgence: {
        titre: "Réponse à une demande urgente",
        message: "Bonjour [client],\n\nNous accusons réception de votre demande urgente concernant [sujet_urgence].\n\n✅ ACTIONS IMMÉDIATES\n[actions_immédiates]\n\n🕒 DÉLAI DE TRAITEMENT\n[délai_traitement]\n\n📞 COORDINATION\n[coordination_équipe]\n\nL'équipe est mobilisée pour répondre à votre urgence.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    gestion_erreur_interne: {
        titre: "Communication sur une erreur interne",
        message: "Bonjour [client],\n\nNous devons vous informer d'une erreur interne survenue dans le traitement de votre commande [reference].\n\nNature de l'erreur : [nature_erreur]\n\nImpact : [impact_erreur]\n\nMesures correctives : [mesures_correctives]\n\nNouveau délai estimé : [nouveau_délai]\n\nVeuillez nous excuser pour ce désagrément.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    solution_probleme_imprevue: {
        titre: "Proposition de solution à un problème imprévu",
        message: "Bonjour [client],\n\nUn problème imprévu a été identifié sur votre commande [reference] :\n\n[description_problème]\n\nNous proposons la solution suivante :\n[description_solution]\n\nAvantages : [avantages_solution]\n\nImpact : [impact_solution]\n\nCette proposition vous convient-elle ?\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    escalade_technique: {
        titre: "Escalade vers l'équipe technique",
        message: "Bonjour [client],\n\nConcernant le point technique sur votre commande [reference], nous avons escaladé la demande à notre équipe technique spécialisée.\n\n• Problème : [description_problème]\n• Priorité : [niveau_priorité]\n• Délai de réponse estimé : [délai_réponse]\n\nVous serez tenu informé des avancées.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    remerciement: {
        titre: "Remerciements",
        message: "Bonjour [client],\n\nMerci pour votre confiance et votre collaboration sur la commande [reference].\n\nNous esperons que vous etes pleinement satisfait de notre service.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    satisfaction_client: {
        titre: "Votre avis compte",
        message: "Bonjour [client],\n\nVotre commande [reference] est maintenant cloturee.\n\nVotre avis nous aide a ameliorer nos services. Merci de partager votre retour ici : [lien].\n\nBien a vous,\nL'equipe Multi-Services Numeriques"
    },

    confirmation_rendezvous: {
        titre: "Rendez-vous confirme",
        message: "Bonjour [client],\n\nVotre rendez-vous est confirme pour le [date] a [heure].\n\nLieu / lien de connexion : [lien_ou_adresse].\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    demande_feedback_intermediaire: {
        titre: "Demande de feedback intermédiaire",
        message: "Bonjour [client],\n\nNous souhaiterions recueillir votre avis sur l'avancement de votre commande [reference].\n\nPoints spécifiques :\n[points_feedback]\n\nVotre retour nous aidera à :\n[bénéfices_feedback]\n\nMerci pour votre temps et votre collaboration.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    traitement_reclamation: {
        titre: "Traitement d'une réclamation client",
        message: "Bonjour [client],\n\nNous accusons réception de votre réclamation concernant [sujet_réclamation] sur la commande [reference].\n\nNous prenons cette situation très au sérieux et avons immédiatement :\n[actions_immédiates]\n\nNotre responsable [nom_responsable] vous contactera directement sous [délai_contact] pour échanger sur les solutions.\n\nVeuillez agréer nos excuses pour ce désagrément.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    reponse_critique: {
        titre: "Réponse à une critique constructive",
        message: "Bonjour [client],\n\nNous vous remercions pour votre retour constructif concernant [sujet_critique] sur la commande [reference].\n\nVos observations sont précieuses et nous permettent d'améliorer nos processus.\n\nMesures d'amélioration engagées :\n[mesures_amélioration]\n\nNous vous remercions de nous aider à progresser.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    enquete_satisfaction: {
        titre: "Enquête de satisfaction post-projet",
        message: "Bonjour [client],\n\nVotre commande [reference] est maintenant terminée.\n\nAfin d'améliorer continuellement nos services, nous souhaiterions recueillir votre avis sur :\n\n• La qualité du travail rendu\n• Le respect des délais\n• La communication\n• La relation globale\n\nVotre feedback est essentiel pour nous.\n\nMerci pour votre collaboration.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    offre_fidelite: {
        titre: "Offre de fidelite",
        message: "Bonjour [client],\n\nNous vous remercions pour votre fidelite !\n\nProfitez de [avantage] sur votre prochaine commande avec le code [code_promo].\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    offre_promotionnelle: {
        titre: "Offre speciale limitee",
        message: "Bonjour [client],\n\nProfitez d'une remise exceptionnelle de [pourcentage]% sur nos services jusqu'au [date_fin].\n\nSaisissez cette opportunite des maintenant !\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    proposition_maintenance: {
        titre: "Proposition de maintenance/SAV",
        message: "Bonjour [client],\n\nVotre commande [reference] étant maintenant terminée, nous souhaiterions vous proposer notre service de maintenance et support après-vente.\n\nCe service inclut :\n[avantages_maintenance]\n\nCoût : [tarif_maintenance]\n\nPériode : [période_couverture]\n\nSouhaitez-vous bénéficier de cette offre ?\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    transmission_contacts_futurs: {
        titre: "Transmission contacts pour futurs projets",
        message: "Bonjour [client],\n\nSuite à la finalisation de votre commande [reference], voici vos contacts privilégiés pour vos futurs projets :\n\n📞 CONTACTS DÉDIÉS\n• [nom_contact_1] - [rôle] - [coordonnées]\n• [nom_contact_2] - [rôle] - [coordonnées]\n\n🎯 OFFRES SPÉCIALES\n[offres_spéciales_futures]\n\nNous restons à votre disposition pour toute nouvelle collaboration.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    suggestions_projets_similaires: {
        titre: "Suggestions pour projets similaires",
        message: "Bonjour [client],\n\nSuite au succès de votre commande [reference], nous souhaiterions vous proposer des services complémentaires qui pourraient vous intéresser :\n\n[suggestions_services]\n\nAvantages :\n[avantages_suggestions]\n\nCes suggestions s'appuient sur notre compréhension de vos besoins et de votre secteur.\n\nEnvisagez-vous l'un de ces développements ?\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    proposition_alternative: {
        titre: "Proposition d'une solution alternative",
        message: "Bonjour [client],\n\nConcernant votre commande [reference], nous souhaiterions vous proposer une alternative qui pourrait mieux correspondre à vos besoins :\n\n[description_alternative]\n\nAvantages :\n[avantages]\n\nCette solution pourrait vous offrir [bénéfices].\n\nQu'en pensez-vous ?\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    negotiation_prix: {
        titre: "Négociation sur les tarifs",
        message: "Bonjour [client],\n\nNous avons bien pris en compte votre demande concernant le budget de la commande [reference].\n\nVoici ce que nous pouvons vous proposer :\n[proposition_prix]\n\nCette offre tient compte de [éléments_négociés].\n\nCette proposition vous convient-elle ?\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    adaptation_delais: {
        titre: "Proposition d'adaptation des délais",
        message: "Bonjour [client],\n\nSuite à votre demande, nous avons réévalué le planning de votre commande [reference].\n\nNouvelle proposition :\n[nouveaux_délais]\n\nCette organisation nous permettra de [avantages_nouvelle_organisation].\n\nMerci de nous confirmer votre accord.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    modification_commande: {
        titre: "Proposition de modification de commande",
        message: "Bonjour [client],\n\nPour mieux répondre à votre besoin, nous vous proposons d'apporter les modifications suivantes à votre commande [reference] :\n\n[modifications_proposées]\n\nImpact :\n• Délai : [impact_délai]\n• Budget : [impact_budget]\n• Livrables : [impact_livrables]\n\nCette évolution vous convient-elle ?\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    ajout_options: {
        titre: "Proposition d'options supplémentaires",
        message: "Bonjour [client],\n\nPour enrichir votre commande [reference], nous vous proposons les options suivantes :\n\n[options_proposées]\n\nAvantages :\n[avantages_options]\n\nCoût supplémentaire : [montant_options]\n\nSouhaitez-vous intégrer ces options à votre projet ?\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    demande_details_projet: {
        titre: "Demande de détails sur le projet",
        message: "Bonjour [client],\n\nPour avancer sur votre commande [reference], nous aurions besoin de précisions supplémentaires concernant :\n\n[éléments_demandés]\n\nVotre retour nous aidera à finaliser la planification du projet.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    demande_fichiers_manquants: {
        titre: "Demande de fichiers manquants",
        message: "Bonjour [client],\n\nPour démarrer le traitement de votre commande [reference], nous avons besoin des fichiers suivants :\n\n[fichiers_manquants]\n\nMerci de nous les transmettre dès que possible.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    demande_precisions_techniques: {
        titre: "Demande de précisions techniques",
        message: "Bonjour [client],\n\nConcernant votre commande [reference], pourrions-nous avoir des précisions techniques sur :\n\n[points_techniques]\n\nCes informations sont essentielles pour respecter vos attentes.\n\nMerci de votre collaboration.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    demande_delais_souhaites: {
        titre: "Demande des délais souhaités",
        message: "Bonjour [client],\n\nAfin d'organiser au mieux notre planning, pourriez-vous nous indiquer vos contraintes de délai pour la commande [reference] ?\n\n• Date de livraison souhaitée\n• Éventuelles étapes intermédiaires\n• Priorité du projet\n\nNous ferons notre possible pour nous y conformer.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    demande_budget_client: {
        titre: "Question sur le budget alloué",
        message: "Bonjour [client],\n\nDans le cadre de l'optimisation de votre commande [reference], pourrions-nous connaître votre enveloppe budgétaire ?\n\nCela nous permettra de vous proposer des options adaptées à vos contraintes.\n\nBien cordialement,\nL'equipe Multi-Services Numeriques"
    },

    demande_contacts_urgence: {
        titre: "Demande de contacts pour urgence",
        message: "Bonjour [client],\n\nPour assurer un suivi optimal de votre commande [reference], merci de nous communiquer :\n\n• Un numéro de téléphone pour les urgences\n• Un email de secours\n• Toute personne à contacter en votre absence\n\nCes informations resteront strictement confidentielles.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    validation_modification: {
        titre: "Validation d'une modification",
        message: "Bonjour [client],\n\nNous accusons réception de votre validation pour la modification concernant [détail_modification] sur la commande [reference].\n\nCette modification est désormais prise en compte et sera intégrée comme convenu.\n\nImpact :\n• Délai : [impact_délai]\n• Budget : [impact_budget]\n\nMerci pour votre réactivité.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    confirmation_comprehension: {
        titre: "Confirmation de bonne compréhension",
        message: "Bonjour [client],\n\nNous confirmons avoir bien pris en compte et compris vos instructions concernant [sujet_instructions] pour la commande [reference].\n\nRécapitulatif :\n[récapitulatif_instructions]\n\nNous appliquerons ces consignes conformément à votre demande.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    validation_etape_projet: {
        titre: "Validation d'une étape du projet",
        message: "Bonjour [client],\n\nL'étape [nom_étape] de votre commande [reference] est maintenant terminée.\n\n✅ TRAVAUX RÉALISÉS\n[travaux_réalisés]\n\n📊 RÉSULTATS\n[résultats_étape]\n\n🔄 PROCHAINES ÉTAPES\n[prochaines_étapes]\n\nMerci de confirmer votre satisfaction pour cette étape afin que nous puissions poursuivre.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    confirmation_coordination: {
        titre: "Confirmation de coordination interne",
        message: "Bonjour [client],\n\nNous confirmons la coordination interne pour [sujet_coordination] concernant votre commande [reference].\n\n• Équipes mobilisées : [équipes_mobilisées]\n• Délai de mise en œuvre : [délai_mise_œuvre]\n• Points de contact : [contacts_dédiés]\n\nTout est en place pour avancer efficacement.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    validation_finalisation: {
        titre: "Validation avant finalisation",
        message: "Bonjour [client],\n\nVotre commande [reference] approche de sa finalisation.\n\nDerniers éléments à valider :\n[éléments_à_valider]\n\nUne fois votre validation reçue, nous procéderons à :\n[actions_finalisation]\n\nMerci de nous confirmer que ces éléments correspondent à vos attentes.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    note_comportement_client: {
        titre: "Note sur le comportement client",
        message: "NOTE INTERNE - COMPORTEMENT CLIENT\n\nClient : [client]\nCommande : [reference]\n\n📝 OBSERVATIONS\n[observations_comportement]\n\n💡 RECOMMANDATIONS\n[recommandations_équipe]\n\n⚠️ POINTS D'ATTENTION\n[points_attention]\n\n✅ POINTS POSITIFS\n[points_positifs]"
    },

    instruction_specifique_client: {
        titre: "Instruction spécifique pour ce client",
        message: "NOTE INTERNE - INSTRUCTIONS SPÉCIFIQUES\n\nClient : [client]\nCommande : [reference]\n\n🎯 INSTRUCTIONS\n[instructions_spécifiques]\n\n📋 PROCÉDURES\n[procédures_à_suivre]\n\n🚨 CONTRAINTES\n[contraintes_particulières]\n\n✅ VALIDATIONS REQUISES\n[validations_requises]"
    },

    alerte_probleme_recurrent: {
        titre: "Alerte problème récurrent",
        message: "ALERTE INTERNE - PROBLÈME RÉCURRENT\n\nClient : [client]\nCommande : [reference]\n\n⚠️ PROBLÈME IDENTIFIÉ\n[description_problème]\n\n📊 HISTORIQUE\n[historique_occurrences]\n\n🔧 SOLUTION PROPOSÉE\n[solution_proposée]\n\n👥 ÉQUIPE CONCERNÉE\n[équipe_concernée]\n\n🚨 ACTION IMMÉDIATE REQUISE\n[action_immédiate]"
    },

    transmission_successeur: {
        titre: "Transmission pour collègue",
        message: "TRANSMISSION - [client] - [reference]\n\n📋 CONTEXTE\n[contexte_transmission]\n\n🎯 ÉTAT ACTUEL\n[état_actuel]\n\n🔜 PROCHAINES ÉTAPES\n[prochaines_étapes]\n\n📞 CONTACTS\n• Client : [contact_client]\n• Interne : [contact_interne]\n\n💡 RECOMMANDATIONS\n[recommandations_successeur]\n\n⚠️ POINTS D'ATTENTION\n[points_attention]"
    },

    synthese_interaction: {
        titre: "Synthèse de l'interaction",
        message: "SYNTHÈSE INTERACTION - [client] - [reference]\n\n📅 DATE : [date_interaction]\n🎯 OBJET : [objet_interaction]\n\n📝 ÉCHANGES\n[compte_rendu_échanges]\n\n✅ DÉCISIONS\n[décisions_prises]\n\n🔜 ACTIONS\n[actions_à_venir]\n\n📞 SUIVI\n[modalités_suivi]\n\n💡 OBSERVATIONS\n[observations_importantes]"
    },

    coordination_equipe_interne: {
        titre: "Coordination avec équipe interne",
        message: "NOTE INTERNE - [client] - [reference]\n\n📋 COORDINATION REQUISE\n• Sujet : [sujet_coordination]\n• Équipe concernée : [équipe_concernée]\n• Délai : [délai_action]\n• Actions : [actions_requises]\n\n📞 CONTACT\n• Responsable : [responsable]\n• Backup : [contact_backup]\n\n✅ SUIVI\n[instructions_suivi]"
    },

    remerciement_fin_projet: {
        titre: "Remerciement fin de projet",
        message: "Bonjour [client],\n\nVotre commande [reference] est maintenant complètement finalisée.\n\nNous tenons à vous remercier chaleureusement pour votre confiance et votre collaboration tout au long de ce projet.\n\nCe fut un plaisir de travailler avec vous et nous espérons avoir l'occasion de renouveler cette expérience.\n\nN'hésitez pas à nous contacter pour vos futurs besoins.\n\nBien cordialement,\nL'equipe Multi-Services Numeriques"
    },

    cloture_dossier: {
        titre: "Message de clôture du dossier",
        message: "Bonjour [client],\n\nNous procédons à la clôture administrative du dossier [reference].\n\n📋 RÉCAPITULATIF\n• Commande : [reference]\n• Date de début : [date_début]\n• Date de fin : [date_fin]\n• Montant total : [montant_total]\n\n✅ TRAVAUX RÉALISÉS\n[travaux_réalisés]\n\n📁 ARCHIVAGE\n• Délai de conservation : [délai_archivage]\n• Accès aux documents : [modalités_accès]\n\nNous restons bien entendu disponibles pour toute question ultérieure.\n\nMerci encore pour votre confiance.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    proposition_amelioration: {
        titre: "Proposition d'amélioration future",
        message: "Bonjour [client],\n\nSuite à notre collaboration sur [reference], nous souhaiterions vous proposer des améliorations pour vos futurs projets :\n\n[propositions_amélioration]\n\nBénéfices attendus :\n[bénéfices_améliorations]\n\nCes suggestions s'appuient sur notre expérience commune et visent à optimiser vos prochains projets.\n\nQu'en pensez-vous ?\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    template_attente: {
        titre: "Message d'attente (en recherche de solution)",
        message: "Bonjour [client],\n\nNous accusons réception de votre demande concernant [sujet_demande].\n\nNotre équipe est actuellement en train d'étudier la meilleure solution pour répondre à votre besoin.\n\nNous reviendrons vers vous dans les plus brefs délais avec une proposition concrète.\n\nMerci pour votre patience.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    template_report_delai: {
        titre: "Report de délai standard",
        message: "Bonjour [client],\n\nNous devons vous informer d'un report de délai concernant [élément_reporté] de votre commande [reference].\n\nNouvelle date prévisionnelle : [nouvelle_date]\n\nRaison du report : [raison_report]\n\nNous mettons tout en œuvre pour respecter ce nouveau planning.\n\nVeuillez nous excuser pour ce contretemps.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    template_demande_patience: {
        titre: "Demande de patience",
        message: "Bonjour [client],\n\nNous traitons actuellement votre demande concernant [sujet_demande].\n\nLe traitement nécessite un peu plus de temps que prévu en raison de [raison_délai].\n\nNous vous remercions pour votre patience et votre compréhension.\n\nNous vous tiendrons informé dès que nous aurons une mise à jour significative.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    template_confirmation_reception: {
        titre: "Accusé de réception",
        message: "Bonjour [client],\n\nNous accusons réception de votre message concernant [sujet_message].\n\nNous traitons votre demande et reviendrons vers vous dans les meilleurs délais.\n\nEn cas d'urgence, vous pouvez nous contacter au [numéro_urgence].\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    },

    template_fermeture_temp: {
        titre: "Message de fermeture temporaire",
        message: "Bonjour [client],\n\nNous vous informons que notre service sera exceptionnellement fermé du [date_début] au [date_fin] inclus.\n\nPendant cette période :\n[modalités_fermeture]\n\nNous reprendrons notre activité normale le [date_reprise].\n\nNous vous remercions pour votre compréhension.\n\nCordialement,\nL'equipe Multi-Services Numeriques"
    }

    },
    mg: {
        confirmation_commande: {
            titre: "Kaomandy voaray",
            message: "Miarahaba an'i [client],\n\nVoaray soa aman-tsara ny kaomandy [reference].\n\nEfa manomboka mandray an-tanana izany ny ekipanay.\n\nMisaotra amin'ny fitokisanao.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        devis_envoye: {
            titre: "Devis",
            message: "Miarahaba an'i [client],\n\nAlefanay eto ambany ny tolotra (devis) ho an'ny fangatahanao [reference].\n\nAfaka atombokay avy hatrany ny asa raha mety aminao ny devis vtantsika teo.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        devis_accepte: {
            titre: "Devis accepte",
            message: "Miarahaba an'i [client],\n\nVoamarina ny fankatoavanao ny tolotra [reference].\n\nHanomboka avy hatrany ny fanatanterahana ny asa.\n\nMisaotra tamin'ny fitokisanao.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        facture_envoyee: {
            titre: "Faktiora",
            message: "Miarahaba an'i [client],\n\nAlefanay miaraka amin'ity hafatra ity ny faktiora amin'ny kaomandy [reference].\n\nHahazo fanamirinana fa voaray eto ianao rehefa tonga aty aminay izany.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        confirmation_paiement: {
            titre: "Voaray",
            message: "Miarahaba an'i [client],\n\nVoaray ny fandoavanao vola mitentina [montant] amin'ny kaomandy [reference].\n\nHanomboka izao ny fanodinana sy ny fanatanterahana.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        relance_paiement: {
            titre: "Fampahatsiahivana",
            message: "Miarahaba an'i [client],\n\nTianay hampahatsiahivana fa mbola tsy voaray ny fandoavana kaomandy [reference].\n\nAzafady mba manomeza daty raha tsy tratranao izao ny fandoavana azy ary ampahafantaro anay raha efa nataonao.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        accompagnement_fichier: {
            titre: "Mise a jour farany",
            message: "Miarahaba anao [client],\n\nAlefanay miaraka amin'ity hafatra ity ny rakitra farany amin'ny kaomandy [reference].\n\nAzafady mba hamafiso raha voaray soa aman-tsara.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        livraison_confirmee: {
            titre: "Livraison",
            message: "Miarahaba an'i [client],\n\nVita sy efa nalefa ny kaomandy [reference].\n\nRaha misy zavatra mila fanitsiana dia aza misalasala mifandray aminay.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        retard_livraison: {
            titre: "Fahatarana amin'ny livraison",
            message: "Miarahaba an'ny [client],\n\nMisy fahatarana kely amin'ny kaomandy [reference].\n\nEfa manatanteraka fanitsiana haingana ny ekipanay.\n\nMisaotra amin'ny faharetana.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        probleme_technique: {
            titre: "Olana ara-teknika",
            message: "Miarahaba an'i [client],\n\nMisy olana ara-teknika amin'ny kaomandy [reference].\n\nEfa miasa amin'ny famahana izany ny teknisianinay. Hanome vaovao izahay raha vao misy fivoarana.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        demande_informations: {
            titre: "Fanazavana fanampiny",
            message: "Miarahaba an'i [client],\n\nMila fanazavana fanampiny momba ny kaomandy [reference] izahay: [details].\n\nMisaotra amin'ny valin-teninao haingana.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        remerciement: {
            titre: "Fisaorana",
            message: "Miarahaba an'i [client],\n\nMisaotra anao tamin'ny fitokisana sy ny fiaraha-miasa tsara tamin'ny kaomandy [reference].\n\nManantena izahay fa afa-po ianao amin'ny vokatra.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        satisfaction_client: {
            titre: "Hevitrao manan-danja",
            message: "Miarahaba an'i [client],\n\nVita tanteraka ny kaomandy [reference].\n\nTianay ny hahafantatra ny hevitrao amin'ny serivisy sy ny vokatra. Azonao atao ny mandefa hevitra eto.\n\nMisaotra betsaka.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        offre_fidelite: {
            titre: "Tolotra ho an'ny mpanjifa mahatoky",
            message: "Miarahaba an'i [client],\n\nMisaotra anao tamin'ny fahatokisana sy ny fiaraha-miasa maharitra.\n\nAmpiasao ny kaody 805MSN hahazoana tombontsoa manokana amin'ny kaomandy manaraka.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        offre_promotionnelle: {
            titre: "Tolotra manokana voafetra",
            message: "Miarahaba an'i [client],\n\nMisy fihenam-bidy manokana [pourcentage]% amin'ny serivisy hatramin'ny [date_fin].\n\nAza adino ity vintana ity !\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        annulation_commande: {
            titre: "Kaomandy nofoanana",
            message: "Miarahaba an'i [client],\n\nNofoanana ny kaomandy [reference] noho ny antony [raison].\n\nRaha tianao haverina ny asa na hanao kaomandy vaovao dia vonona izahay hanampy.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numeriques"
        },
        excuse_insatisfaction: {
            titre: "Fialan-tsiny",
            message: "Miarahaba an'i [client],\n\nIalana tsiny raha toa ka tsy mifanaraka amin'ny fanirianao ny vokatra ny kaomandy [référence].\n\nNy fahafaha-mponao no tena tadiavinay. Mampanantena izahay fa hijery manokana ny komandy nao ary handray an-tanana ireo fanitsiana ilaina sy ny fanatsarana rehetra. \n\nEfa mandray an-tanana izany ny ekipa ary hanome anao vokatra tsara kokoa ao anaty fotoana fohy indrindra azo atao.\n\nMisaotra anao noho ny bola nomezanao any fotoana ahafanhanay manome vokatra tara ho anao.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },

        accompagnement_apercu: {
            titre: "Fanaraha-maso mialoha",
            message: "Miarahaba an'i [client],\n\nAraka ny nifanarahana, ity ny fijerena mialoha ny kaomandy [référence].\n\nMbola vonona izahay  raha mila:\n• Fanovana\n• Fanitsiana manokana\n• Fanazavana fanampiny\n\nAlefaso ny hevitrao - eto izahay vonona hanome fahafaham-po anao.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },

        facture_finale: {
            titre: "Faktiora farany",
            message: "Miarahaba an'i [client],\n\nVita sy voamarina ny kaomandy [référence].\n\nVakio eto ambany ny faktiora farany.\n\nMisaotra anao noho ny fitokisana ary mbola eto izhay raha mila fanampiana.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },

        prise_instructions: {
            titre: "Voaray ny toromarika",
            message: "Miarahaba an'i [client],\n\nVoaray ny toromarikao momba ny kaomandy [référence].\n\nVoaray sy azonay tsara ny:\n[details]\n\nEfa anatin'ny vinan'ny asa hataonay ireo manomboka eto.\n\nHanome anao  vaovao eto foana izahay momba ny fivoaran'izany.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        },

        excuse_retard_precis: {
            titre: "Fahatarana ",
            message: "Miarahaba an'i [client],\n\nIalana tsiny ny fahatarana  amin'ny kaomandy [référence].\n\nNoho ny [antony] dia mila fotoana fanampiny izahay.\n\nMapanantena izahay fa handefa izany fara fahatarany hatramin'ny [daty marina], [ora marina].\n\nMiara-miasa ny ekipanay mba hahatrarana izany.\n\nTsapanay ny fiandrasanao ka hiezaka izahay hanome vokatra tsara amin'ny fotoana fohy indrindra azonay atao.\n\nMirary soa,\nNy ekipan'ny Multi-Services Numériques"
        }
    }
};

class ReformulateurIA {
    constructor() {
        this.apiKey = null;
        this.endpoint = 'https://api.openai.com/v1/chat/completions';
    }

    async reformulerMessage(messageOriginal, instructions, langue = 'fr') {
        try {
            const prompt = this.creerPromptReformulation(messageOriginal, instructions, langue);
            
            // Si pas d'API key, on utilise une reformulation basique
            if (!this.apiKey) {
                return this.reformulationBasique(messageOriginal, instructions, langue);
            }

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'Tu es un assistant spécialisé dans la reformulation de messages professionnels pour une entreprise de services numériques.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();

        } catch (error) {
            console.error('Erreur reformulation IA:', error);
            // Fallback vers la reformulation basique
            return this.reformulationBasique(messageOriginal, instructions, langue);
        }
    }

    creerPromptReformulation(messageOriginal, instructions, langue) {
        const instructionsLangue = langue === 'mg' ? 
            'Reformule en malgache formel et professionnel.' :
            'Reformule en français professionnel.';

        return `Message original à reformuler :
"${messageOriginal}"

Instructions spécifiques :
${instructions}

${instructionsLangue}

Consignes :
- Garder le ton professionnel et courtois
- Adapter au contexte des services numériques
- Maintenir la structure claire
- Respecter les placeholders comme [client], [référence], etc.
- Rendre le message plus impactant si possible

Message reformulé :`;
    }

    reformulationBasique(messageOriginal, instructions, langue) {
        // Reformulation basique sans IA
        let message = messageOriginal;
        
        if (instructions.includes('plus court')) {
            message = message.replace(/\n\s*\n/g, '\n').split('\n').filter(line => line.trim()).slice(0, 8).join('\n');
        }
        
        if (instructions.includes('plus formel')) {
            message = message.replace(/Bonjour/g, 'Cher client')
                           .replace(/Cordialement/g, 'Nous vous prions d\'agréer, Cher client, nos salutations distinguées');
        }
        
        if (instructions.includes('plus amical')) {
            message = message.replace(/Cher client/g, 'Bonjour')
                           .replace(/Cordialement/g, 'Bien à vous')
                           .replace(/Nous vous prions/g, 'Nous vous souhaitons');
        }

        return message;
    }

    setApiKey(cle) {
        this.apiKey = cle;
    }
}

// Initialisation du reformulateur
const reformulateurIA = new ReformulateurIA();

// Fonction pour utiliser le reformulateur
async function demanderReformulationIA(messageId, langue = 'fr', instructions = '') {
    const messageOriginal = MESSAGES_PRE_ENREGISTRES[langue]?.[messageId]?.message;
    
    if (!messageOriginal) {
        console.error('Message non trouvé:', messageId);
        return null;
    }

    try {
        const messageReformule = await reformulateurIA.reformulerMessage(
            messageOriginal, 
            instructions, 
            langue
        );
        
        return messageReformule;
    } catch (error) {
        console.error('Erreur lors de la reformulation:', error);
        return messageOriginal; // Retourne l'original en cas d'erreur
    }
}


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
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalMessageLabel">
                            <i class="bi bi-chat-text"></i> Communication avec le client - ${commande.reference}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <!-- Colonne Message -->
                            <div class="col-md-8">
                                <form id="formMessage">
                                    <div class="card">
                                        <div class="card-header bg-light">
                                            <h6 class="mb-0">Configuration du message</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="row mb-3">
                                                <div class="col-md-6">
                                                    <label class="form-label">Type de message *</label>
                                                    <select class="form-select" id="type-message" onchange="chargerMessagePredefiniModal(this.value)" required>
                                                        <option value="">-- Choisir un type de message --</option>
                                                        <!-- ACCUEIL ET PREMIER CONTACT -->
                                                        <optgroup label="Accueil & Premier contact">
                                                            <option value="accueil_nouveau_client">Bienvenue et présentation de nos services</option>
                                                            <option value="reponse_premier_contact">Réponse à une première demande d'information</option>
                                                            <option value="presentation_services">Présentation détaillée de nos services</option>
                                                            <option value="orientation_vers_devis">Orientation vers une demande de devis</option>
                                                            <option value="clarification_besoin">Question pour clarifier le besoin client</option>
                                                        </optgroup>

                                                        <!-- PROCESSUS DE COMMANDE -->
                                                        <optgroup label="Processus de commande">
                                                            <option value="confirmation_commande">Confirmation commande</option>
                                                            <option value="devis_envoye">Devis envoyé</option>
                                                            <option value="devis_accepte">Devis accepté</option>
                                                            <option value="facture_envoyee">Facture envoyée</option>
                                                            <option value="confirmation_paiement">Paiement confirmé</option>
                                                            <option value="relance_paiement">Relance de paiement</option>
                                                            <option value="accompagnement_fichier">Fichiers livrés</option>
                                                            <option value="livraison_confirmee">Livraison confirmée</option>
                                                            <option value="facture_finale">Facture finale</option>
                                                            <option value="facture_avant_livraison">Facture avant livraison</option>
                                                            <option value="rappel_facture_avant_livraison">Rappel - Facture en attente</option>
                                                            <option value="confirmation_livraison_immediate">Livraison immédiate après paiement</option>
                                                            <option value="annulation_commande">Commande annulée</option>
                                                        </optgroup>

                                                        <!-- ACCOMPAGNEMENT ET LIVRAISON -->
                                                        <optgroup label="Accompagnement & Livraison">
                                                            <option value="accompagnement_apercu">Accompagnement pour l'aperçu</option>
                                                            <option value="accompagnement_saisie">Votre document saisi est prêt</option>
                                                            <option value="accompagnement_mise_en_forme">Votre mise en forme est terminée</option>
                                                            <option value="accompagnement_tableau">Vos tableaux sont finalisés</option>
                                                            <option value="accompagnement_graphique">Vos graphiques et illustrations sont prêts</option>
                                                            <option value="accompagnement_logo">Votre logo est créé !</option>
                                                            <option value="accompagnement_affiche">Votre affiche est conçue</option>
                                                            <option value="accompagnement_vectorisation">Vos images sont vectorisées</option>
                                                            <option value="accompagnement_pack_complet">Votre pack graphique complet est prêt</option>
                                                            <option value="prise_instructions">Prise en compte de vos instructions</option>
                                                        </optgroup>

                                                        <!-- SUIVI ET RELANCE -->
                                                        <optgroup label="Suivi & Relance">
                                                            <option value="rappel_gentil_livraison">Votre commande vous attend :)</option>
                                                            <option value="offre_dernier_jour">Dernier jour - Votre commande est prête !</option>
                                                            <option value="demande_informations">Informations complémentaires requises</option>
                                                            <option value="checkpoint_progression">Point d'avancement du projet</option>
                                                            <option value="rappel_echeance">Rappel d'échéance approchante</option>
                                                            <option value="verification_satisfaction">Vérification de la satisfaction client</option>
                                                            <option value="offre_assistance">Proposition d'assistance supplémentaire</option>
                                                            <option value="prevention_retard">Prévention d'un retard potentiel</option>
                                                        </optgroup>

                                                        <!-- GESTION DES INCIDENTS -->
                                                        <optgroup label="Gestion des incidents">
                                                            <option value="retard_livraison">Retard de livraison</option>
                                                            <option value="excuse_retard_precis">Retard de livraison - Délai précis</option>
                                                            <option value="probleme_technique">Problème technique</option>
                                                            <option value="excuse_insatisfaction">Nos excuses - Insatisfaction</option>
                                                            <option value="reponse_urgence">Réponse à une demande urgente</option>
                                                            <option value="gestion_erreur_interne">Communication sur une erreur interne</option>
                                                            <option value="solution_probleme_imprevue">Proposition de solution à un problème imprévu</option>
                                                            <option value="escalade_technique">Escalade vers l'équipe technique</option>
                                                        </optgroup>

                                                        <!-- RELATION CLIENT -->
                                                        <optgroup label="Relation client">
                                                            <option value="remerciement">Remerciements</option>
                                                            <option value="satisfaction_client">Votre avis compte</option>
                                                            <option value="confirmation_rendezvous">Rendez-vous confirmé</option>
                                                            <option value="demande_feedback_intermediaire">Demande de feedback intermédiaire</option>
                                                            <option value="traitement_reclamation">Traitement d'une réclamation client</option>
                                                            <option value="reponse_critique">Réponse à une critique constructive</option>
                                                            <option value="enquete_satisfaction">Enquête de satisfaction post-projet</option>
                                                        </optgroup>

                                                        <!-- MARKETING ET FIDÉLISATION -->
                                                        <optgroup label="Marketing & Fidélisation">
                                                            <option value="offre_fidelite">Offre de fidélité</option>
                                                            <option value="offre_promotionnelle">Offre spéciale limitée</option>
                                                            <option value="proposition_maintenance">Proposition de maintenance/SAV</option>
                                                            <option value="suggestions_projets_similaires">Suggestions pour projets similaires</option>
                                                        </optgroup>

                                                        <!-- NÉGOCIATION ET ADAPTATION -->
                                                        <optgroup label="Négociation & Adaptation">
                                                            <option value="proposition_alternative">Proposition d'une solution alternative</option>
                                                            <option value="negotiation_prix">Négociation sur les tarifs</option>
                                                            <option value="adaptation_delais">Proposition d'adaptation des délais</option>
                                                            <option value="modification_commande">Proposition de modification de commande</option>
                                                            <option value="ajout_options">Proposition d'options supplémentaires</option>
                                                            <option value="demande_details_projet">Demande de détails sur le projet</option>
                                                            <option value="demande_fichiers_manquants">Demande de fichiers manquants</option>
                                                            <option value="demande_precisions_techniques">Demande de précisions techniques</option>
                                                            <option value="demande_delais_souhaites">Demande des délais souhaités</option>
                                                            <option value="demande_budget_client">Question sur le budget alloué</option>
                                                            <option value="demande_contacts_urgence">Demande de contacts pour urgence</option>
                                                        </optgroup>

                                                        <!-- VALIDATIONS ET CONFIRMATIONS -->
                                                        <optgroup label="Validations & Confirmations">
                                                            <option value="validation_modification">Validation d'une modification</option>
                                                            <option value="confirmation_comprehension">Confirmation de bonne compréhension</option>
                                                            <option value="validation_etape_projet">Validation d'une étape du projet</option>
                                                            <option value="confirmation_coordination">Confirmation de coordination interne</option>
                                                            <option value="validation_finalisation">Validation avant finalisation</option>
                                                        </optgroup>

                                                        <!-- NOTES INTERNES -->
                                                        <optgroup label="Notes internes">
                                                            <option value="note_comportement_client">Note sur le comportement client</option>
                                                            <option value="instruction_specifique_client">Instruction spécifique pour ce client</option>
                                                            <option value="alerte_probleme_recurrent">Alerte problème récurrent</option>
                                                            <option value="transmission_successeur">Transmission pour collègue</option>
                                                            <option value="synthese_interaction">Synthèse de l'interaction</option>
                                                            <option value="coordination_equipe_interne">Coordination avec équipe interne</option>
                                                        </optgroup>

                                                        <!-- CLÔTURE ET SUIVI POST-PROJET -->
                                                        <optgroup label="Clôture & Post-projet">
                                                            <option value="remerciement_fin_projet">Remerciement fin de projet</option>
                                                            <option value="transmission_contacts_futurs">Transmission contacts pour futurs projets</option>
                                                            <option value="cloture_dossier">Message de clôture du dossier</option>
                                                            <option value="proposition_amelioration">Proposition d'amélioration future</option>
                                                        </optgroup>

                                                        <!-- TEMPLATES RÉCURRENTS -->
                                                        <optgroup label="Templates récurrents">
                                                            <option value="template_attente">Message d'attente (en recherche de solution)</option>
                                                            <option value="template_report_delai">Report de délai standard</option>
                                                            <option value="template_demande_patience">Demande de patience</option>
                                                            <option value="template_confirmation_reception">Accusé de réception</option>
                                                            <option value="template_fermeture_temp">Message de fermeture temporaire</option>
                                                        </optgroup>
                                                    </select>
                                                </div>
                                                <div class="col-md-6">
                                                    <label class="form-label">Langue *</label>
                                                    <select class="form-select" id="langue-message" onchange="changerLangueMessageModal()" required>
                                                        <option value="fr">Français</option>
                                                        <option value="mg">Malagasy</option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label class="form-label">Sujet *</label>
                                                <input type="text" class="form-control" id="sujet-message" name="sujet-message" placeholder="Sujet du message" required>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label class="form-label">Message *</label>
                                                <textarea class="form-control" id="texte-message" name="texte-message" rows="8" placeholder="Le message apparaîtra ici après sélection..." required></textarea>
                                            </div>

                                            <!-- Section Reformulation IA intégrée -->
                                            <div class="card border-primary mb-3">
                                                <div class="card-header bg-primary text-white py-2">
                                                    <h6 class="mb-0">
                                                        <i class="bi bi-robot"></i> Reformulation IA
                                                    </h6>
                                                </div>
                                                <div class="card-body">
                                                    <div class="row g-2 align-items-end">
                                                        <div class="col-md-4">
                                                            <label class="form-label small">Style de reformulation :</label>
                                                            <select class="form-select form-select-sm" id="styleReformulation">
                                                                <option value="plus court">Plus court</option>
                                                                <option value="plus formel">Plus formel</option>
                                                                <option value="plus amical">Plus amical</option>
                                                                <option value="plus persuasif">Plus persuasif</option>
                                                                <option value="plus urgent">Plus urgent</option>
                                                                <option value="personnalise">Personnalisé</option>
                                                            </select>
                                                        </div>
                                                        <div class="col-md-5">
                                                            <label class="form-label small">Instructions personnalisées :</label>
                                                            <input type="text" class="form-control form-control-sm" id="instructionsReformulation" 
                                                                   placeholder="Ex: Rendre plus professionnel..." style="display: none;">
                                                            <div class="form-text small" id="descriptionStyle">
                                                                Raccourcit le message en conservant l'essentiel
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="d-grid">
                                                                <button type="button" class="btn btn-primary btn-sm" onclick="lancerReformulationDirecte()">
                                                                    <i class="bi bi-magic"></i> Reformuler
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <!-- Indicateur de chargement -->
                                                    <div id="chargementReformulation" class="mt-2 text-center" style="display: none;">
                                                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                                                            <span class="visually-hidden">Chargement...</span>
                                                        </div>
                                                        <small class="text-muted ms-2">Reformulation en cours...</small>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Boutons d'action message -->
                                            <div class="d-flex gap-2 mb-3">
                                                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="previsualiserMessageModal()">
                                                    <i class="bi bi-eye"></i> Prévisualiser
                                                </button>
                                                <button type="button" class="btn btn-outline-info btn-sm" onclick="copierMessageModal()">
                                                    <i class="bi bi-clipboard"></i> Copier
                                                </button>
                                                <button type="button" class="btn btn-outline-warning btn-sm" onclick="reinitialiserMessageModal()">
                                                    <i class="bi bi-arrow-clockwise"></i> Réinitialiser
                                                </button>
                                            </div>

                                            <!-- Section Fichiers joints -->
                                            <div class="mb-3">
                                                <label class="form-label">Fichiers joints (optionnel)</label>
                                                <div class="border rounded p-3">
                                                    <div class="mb-2">
                                                        <input type="file" class="form-control" id="fichier-upload" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar">
                                                        <div class="form-text">Formats acceptés: PDF, Word, Excel, images, archives (max 10MB par fichier)</div>
                                                    </div>
                                                    <div id="liste-fichiers" class="mt-2">
                                                        <small class="text-muted">Aucun fichier sélectionné</small>
                                                    </div>
                                                    <div class="mt-2">
                                                        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="ajouterLienFichierModal()">
                                                            <i class="bi bi-link"></i> Ajouter un lien de téléchargement
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <!-- Colonne Informations -->
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0"><i class="bi bi-info-circle"></i> Informations commande</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <strong>Client:</strong><br>
                                            <span class="text-primary">${commande.client}</span>
                                        </div>
                                        <div class="mb-3">
                                            <strong>Contact:</strong><br>
                                            <span class="text-info">${commande.contact || 'Non spécifié'}</span>
                                        </div>
                                        <div class="mb-3">
                                            <strong>Référence:</strong><br>
                                            <code>${commande.reference}</code>
                                        </div>
                                        <div class="mb-3">
                                            <strong>Total:</strong><br>
                                            <span class="text-success">${commande.total || 'Non spécifié'}</span>
                                        </div>
                                        <div class="mb-3">
                                            <strong>Services:</strong><br>
                                            <ul class="small mb-0">
                                                ${commande.services && commande.services.length > 0 
                                                    ? commande.services.map(s => `<li>${s.nom} - ${s.quantite} ${s.unite}</li>`).join('')
                                                    : '<li>Aucun service</li>'
                                                }
                                            </ul>
                                        </div>
                                        <hr>
                                        <div class="alert alert-info small">
                                            <strong><i class="bi bi-lightbulb"></i> Variables disponibles:</strong><br>
                                            • <code>[client]</code> - Nom du client<br>
                                            • <code>[reference]</code> - Référence commande<br>
                                            • <code>[montant]</code> - Montant total<br>
                                            • <code>[services]</code> - Liste des services
                                        </div>
                                    </div>
                                </div>

                                <!-- Section Actions rapides -->
                                <div class="card mt-3">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0"><i class="bi bi-send"></i> Envoi rapide</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="d-grid gap-2">
                                            <button type="button" class="btn btn-success" onclick="envoyerMessageViaPlateforme('whatsapp', ${idCommande})">
                                                <i class="bi bi-whatsapp"></i> WhatsApp
                                            </button>
                                            <button type="button" class="btn btn-primary" onclick="envoyerMessageViaPlateforme('email', ${idCommande})">
                                                <i class="bi bi-envelope"></i> Email
                                            </button>
                                            <button type="button" class="btn btn-info" onclick="envoyerMessageViaPlateforme('facebook', ${idCommande})">
                                                <i class="bi bi-facebook"></i> Facebook
                                            </button>
                                            <button type="button" class="btn btn-warning" onclick="testeurMessage(${idCommande})">
                                                <i class="bi bi-play-circle"></i> Tester l'envoi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle"></i> Annuler
                        </button>
                        <button type="button" class="btn btn-primary" onclick="sauvegarderMessage(${idCommande})">
                            <i class="bi bi-floppy"></i> Sauvegarder brouillon
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialiser les écouteurs
    initialiserGestionFichiers();
    initialiserEcouteursMessageModal();
    
    const modal = new bootstrap.Modal(document.getElementById('modalMessage'));
    modal.show();
}

// ============================================================================
// FONCTIONS POUR LA REFORMULATION IA INTÉGRÉE
// ============================================================================

function initialiserEcouteursMessageModal() {
    // Écouteur pour la sélection du type de message
    const typeMessageSelect = document.getElementById('type-message');
    if (typeMessageSelect) {
        typeMessageSelect.addEventListener('change', function() {
            chargerMessagePredefiniModal(this.value);
        });
    }

    // Écouteur pour le style de reformulation
    const styleSelect = document.getElementById('styleReformulation');
    if (styleSelect) {
        styleSelect.addEventListener('change', function() {
            const instructionsInput = document.getElementById('instructionsReformulation');
            const descriptionStyle = document.getElementById('descriptionStyle');
            
            const styles = {
                'plus court': 'Raccourcit le message en conservant l\'essentiel',
                'plus formel': 'Rend le ton plus professionnel et formel',
                'plus amical': 'Adoucit le ton pour plus de convivialité',
                'plus persuasif': 'Renforce l\'aspect persuasif et incitatif',
                'plus urgent': 'Ajoute un sentiment d\'urgence',
                'personnalise': 'Saisissez vos instructions personnalisées'
            };
            
            const style = this.value;
            descriptionStyle.textContent = styles[style];
            
            if (style === 'personnalise') {
                instructionsInput.style.display = 'block';
                instructionsInput.placeholder = 'Ex: Rendre plus chaleureux...';
            } else {
                instructionsInput.style.display = 'none';
            }
        });
    }
}

function chargerMessagePredefiniModal(messageId) {
    const langue = document.getElementById('langue-message').value;
    const commandes = dataManager.getCommandes();
    const commandeId = document.getElementById('modalMessage').dataset.commandeId;
    const commande = commandes.find(c => c.id == commandeId);
    
    if (!commande || !messageId) return;

    const messageData = MESSAGES_PRE_ENREGISTRES[langue]?.[messageId];
    
    if (!messageData) {
        showNotification('Message non trouvé pour cette langue', 'error');
        return;
    }

    // Remplacer les placeholders
    let message = messageData.message;
    message = message.replace(/\[client\]/g, commande.client)
                     .replace(/\[référence\]/g, commande.reference)
                     .replace(/\[reference\]/g, commande.reference)
                     .replace(/\[montant\]/g, commande.total || '')
                     .replace(/\[services\]/g, commande.services.map(s => s.nom).join(', '));

    // Mettre à jour les champs
    document.getElementById('sujet-message').value = messageData.titre;
    document.getElementById('texte-message').value = message;
}

// Lancer la reformulation directement
async function lancerReformulationDirecte() {
    const style = document.getElementById('styleReformulation').value;
    const instructionsPerso = document.getElementById('instructionsReformulation').value;
    const langue = document.getElementById('langue-message').value;
    
    // Vérifier qu'il y a un message à reformuler
    const messageAReformuler = document.getElementById('texte-message').value;
    if (!messageAReformuler.trim()) {
        showNotification('Veuillez d\'abord sélectionner ou écrire un message', 'error');
        return;
    }
    
    // Déterminer les instructions finales
    let instructions = style;
    if (style === 'personnalise' && instructionsPerso) {
        instructions = instructionsPerso;
    }
    
    // Afficher l'indicateur de chargement
    const btn = document.querySelector('#styleReformulation').closest('.card-body').querySelector('.btn-primary');
    const chargement = document.getElementById('chargementReformulation');
    
    btn.disabled = true;
    chargement.style.display = 'block';
    
    try {
        // Utiliser la reformulation IA
        const messageReformule = await reformulateurIA.reformulerMessage(
            messageAReformuler, 
            instructions, 
            langue
        );
        
        // Appliquer directement le résultat dans le textarea
        document.getElementById('texte-message').value = messageReformule;
        
        showNotification('Message reformulé avec succès !', 'success');
        
    } catch (error) {
        console.error('Erreur reformulation:', error);
        showNotification('Erreur lors de la reformulation: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        chargement.style.display = 'none';
    }
}

// ============================================================================
// FONCTIONS UTILITAIRES EXISTANTES
// ============================================================================

function previsualiserMessageModal() {
    const message = document.getElementById('texte-message').value;
    const sujet = document.getElementById('sujet-message').value;
    
    if (!message.trim()) {
        alert('Aucun message à prévisualiser');
        return;
    }
    
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
        <html>
            <head>
                <title>Prévisualisation: ${sujet}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                    .message-container { max-width: 600px; margin: 0 auto; }
                    .signature { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc; }
                </style>
            </head>
            <body>
                <div class="message-container">
                    <h3>${sujet}</h3>
                    <div class="message-content">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <div class="signature">
                        <strong>L'équipe Multi-Services Numériques</strong><br>
                        WhatsApp: +261 34 39 677 44
                    </div>
                </div>
            </body>
        </html>
    `);
}

function copierMessageModal() {
    const messageText = document.getElementById('texte-message');
    messageText.select();
    document.execCommand('copy');
    showNotification('Message copié dans le presse-papier !', 'success');
}

function reinitialiserMessageModal() {
    document.getElementById('texte-message').value = '';
    document.getElementById('sujet-message').value = '';
    document.getElementById('type-message').value = '';
    document.getElementById('styleReformulation').value = 'plus court';
    document.getElementById('instructionsReformulation').style.display = 'none';
    document.getElementById('descriptionStyle').textContent = 'Raccourcit le message en conservant l\'essentiel';
}

function changerLangueMessageModal() {
    const typeMessage = document.getElementById('type-message').value;
    if (typeMessage) {
        chargerMessagePredefiniModal(typeMessage);
    }
}

function sauvegarderMessage(idCommande) {
    const sujet = document.getElementById('sujet-message').value;
    const message = document.getElementById('texte-message').value;
    
    if (!sujet.trim() || !message.trim()) {
        showNotification('Veuillez remplir le sujet et le message', 'error');
        return;
    }
    
    // Sauvegarder le brouillon (à implémenter selon votre structure)
    console.log('Brouillon sauvegardé:', { idCommande, sujet, message });
    showNotification('Brouillon sauvegardé avec succès !', 'success');
}

// Fonction pour la gestion des fichiers (existant)
function initialiserGestionFichiers() {
    const fichierUpload = document.getElementById('fichier-upload');
    const listeFichiers = document.getElementById('liste-fichiers');
    
    if (fichierUpload && listeFichiers) {
        fichierUpload.addEventListener('change', function() {
            if (this.files.length > 0) {
                let html = '';
                for (let file of this.files) {
                    html += `<div class="d-flex justify-content-between align-items-center border-bottom py-1">
                        <small><i class="bi bi-file-earmark"></i> ${file.name}</small>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="supprimerFichier(this)">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>`;
                }
                listeFichiers.innerHTML = html;
            } else {
                listeFichiers.innerHTML = '<small class="text-muted">Aucun fichier sélectionné</small>';
            }
        });
    }
}

function ajouterLienFichierModal() {
    const lien = prompt('Entrez le lien de téléchargement:');
    if (lien) {
        const listeFichiers = document.getElementById('liste-fichiers');
        const nouveauLien = `<div class="d-flex justify-content-between align-items-center border-bottom py-1">
            <small><i class="bi bi-link"></i> <a href="${lien}" target="_blank">Lien externe</a></small>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="supprimerFichier(this)">
                <i class="bi bi-trash"></i>
            </button>
        </div>`;
        
        if (listeFichiers.innerHTML.includes('Aucun fichier')) {
            listeFichiers.innerHTML = nouveauLien;
        } else {
            listeFichiers.innerHTML += nouveauLien;
        }
    }
}

function supprimerFichier(bouton) {
    bouton.closest('div').remove();
    const listeFichiers = document.getElementById('liste-fichiers');
    if (listeFichiers.children.length === 0) {
        listeFichiers.innerHTML = '<small class="text-muted">Aucun fichier sélectionné</small>';
    }
}

// Fonctions spécifiques au modal de message
function initialiserEcouteursMessageModal() {
    // Écouteur pour les instructions de reformulation
    const instructionsSelect = document.getElementById('instructionsReformulation');
    if (instructionsSelect) {
        instructionsSelect.addEventListener('change', function() {
            const sectionPerso = document.getElementById('sectionInstructionsPerso');
            sectionPerso.style.display = this.value === 'personnalise' ? 'block' : 'none';
        });
    }

    // Écouteur pour la sélection du type de message
    const typeMessageSelect = document.getElementById('type-message');
    if (typeMessageSelect) {
        typeMessageSelect.addEventListener('change', function() {
            chargerMessagePredefiniModal(this.value);
        });
    }
}

function chargerMessagePredefiniModal(messageId) {
    const langue = document.getElementById('langue-message').value;
    const commandes = dataManager.getCommandes();
    const commandeId = document.getElementById('modalMessage').dataset.commandeId;
    const commande = commandes.find(c => c.id == commandeId);
    
    if (!commande || !messageId) return;

    const messageData = MESSAGES_PRE_ENREGISTRES[langue]?.[messageId];
    
    if (!messageData) {
        showNotification('Message non trouvé pour cette langue', 'error');
        return;
    }

    // Remplacer les placeholders
    let message = messageData.message;
    message = message.replace(/\[client\]/g, commande.client)
                     .replace(/\[référence\]/g, commande.reference)
                     .replace(/\[reference\]/g, commande.reference)
                     .replace(/\[montant\]/g, commande.total || '')
                     .replace(/\[services\]/g, commande.services.map(s => s.nom).join(', '));

    // Mettre à jour les champs
    document.getElementById('sujet-message').value = messageData.titre;
    document.getElementById('texte-message').value = message;

    // Afficher le bouton de reformulation
    afficherBoutonReformulationModal(messageId, langue);
}

function afficherBoutonReformulationModal(messageId, langue) {
    const container = document.getElementById('containerMessage');
    container.innerHTML = '';
    
    const btnReformulation = document.createElement('button');
    btnReformulation.type = 'button';
    btnReformulation.className = 'btn btn-outline-primary btn-sm';
    btnReformulation.innerHTML = '<i class="bi bi-magic"></i> Reformuler avec IA';
    btnReformulation.onclick = () => ouvrirReformulationIAModal(messageId, langue);
    
    container.appendChild(btnReformulation);
}

function ouvrirReformulationIAModal(messageId, langue) {
    const messageData = MESSAGES_PRE_ENREGISTRES[langue]?.[messageId];
    
    if (!messageData) {
        alert('Message non trouvé');
        return;
    }
    
    document.getElementById('messageOriginal').value = document.getElementById('texte-message').value;
    document.getElementById('langueReformulation').value = langue;
    document.getElementById('instructionsReformulation').value = '';
    document.getElementById('instructionsPersonnalisees').value = '';
    document.getElementById('resultatReformulation').style.display = 'none';
    
    const modal = new bootstrap.Modal(document.getElementById('modalReformulationIA'));
    modal.show();
}

// Autres fonctions utilitaires pour le modal
function previsualiserMessageModal() {
    const message = document.getElementById('texte-message').value;
    const sujet = document.getElementById('sujet-message').value;
    
    if (!message.trim()) {
        alert('Aucun message à prévisualiser');
        return;
    }
    
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
        <html>
            <head>
                <title>Prévisualisation: ${sujet}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                    .message-container { max-width: 600px; margin: 0 auto; }
                    .signature { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc; }
                </style>
            </head>
            <body>
                <div class="message-container">
                    <h3>${sujet}</h3>
                    <div class="message-content">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <div class="signature">
                        <strong>L'équipe Multi-Services Numériques</strong><br>
                        WhatsApp: +261 34 39 677 44
                    </div>
                </div>
            </body>
        </html>
    `);
}

function copierMessageModal() {
    const messageText = document.getElementById('texte-message');
    messageText.select();
    document.execCommand('copy');
    showNotification('Message copié dans le presse-papier !', 'success');
}

function reinitialiserMessageModal() {
    document.getElementById('texte-message').value = '';
    document.getElementById('sujet-message').value = '';
    document.getElementById('containerMessage').innerHTML = '';
}

function changerLangueMessageModal() {
    const typeMessage = document.getElementById('type-message').value;
    if (typeMessage) {
        chargerMessagePredefiniModal(typeMessage);
    }
}

// Fonctions de reformulation IA (adaptées pour ce modal)
// Lancer la reformulation directement - VERSION CORRIGÉE
// Fonction simplifiée pour la reformulation IA
async function lancerReformulationDirecte() {
    // 1. Récupérer le message actuel
    const messageActuel = document.getElementById('texte-message').value;
    
    if (!messageActuel.trim()) {
        showNotification('Veuillez d\'abord sélectionner un message', 'error');
        return;
    }
    
    // 2. Récupérer les paramètres
    const style = document.getElementById('styleReformulation').value;
    const instructionsPerso = document.getElementById('instructionsReformulation').value;
    const langue = document.getElementById('langue-message').value;
    
    // 3. Préparer les instructions
    let instructions = style;
    if (style === 'personnalise' && instructionsPerso) {
        instructions = instructionsPerso;
    }
    
    // 4. Afficher le chargement
    const btn = document.querySelector('.btn-primary[onclick="lancerReformulationDirecte()"]');
    const chargement = document.getElementById('chargementReformulation');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i>...';
    chargement.style.display = 'block';
    
    try {
        // 5. Appeler l'IA en arrière-plan
        const messageReformule = await reformulateurIA.reformulerMessage(
            messageActuel, 
            instructions, 
            langue
        );
        
        // 6. Appliquer directement le résultat
        document.getElementById('texte-message').value = messageReformule;
        showNotification('Message reformulé avec succès !', 'success');
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de reformulation', 'error');
    } finally {
        // 7. Restaurer le bouton
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-magic"></i> Reformuler';
        chargement.style.display = 'none';
    }
}

function utiliserMessageReformuleModal() {
    const messageReformule = document.getElementById('messageReformule').value;
    document.getElementById('texte-message').value = messageReformule;
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalReformulationIA'));
    modal.hide();
    
    showNotification('Message reformulé appliqué avec succès !', 'success');
}

function reformulerAutrementModal() {
    document.getElementById('resultatReformulation').style.display = 'none';
    document.getElementById('instructionsReformulation').focus();
}

function sauvegarderMessage(idCommande) {
    const sujet = document.getElementById('sujet-message').value;
    const message = document.getElementById('texte-message').value;
    
    if (!sujet.trim() || !message.trim()) {
        showNotification('Veuillez remplir le sujet et le message', 'error');
        return;
    }
    
    // Sauvegarder le brouillon (à implémenter selon votre structure)
    console.log('Brouillon sauvegardé:', { idCommande, sujet, message });
    showNotification('Brouillon sauvegardé avec succès !', 'success');
}


// Gestion des fichiers joints
let fichiersSelectionnes = [];
let liensFichiers = [];

function initialiserGestionFichiers() {
    const inputFichier = document.getElementById('fichier-upload');
    if (inputFichier) {
        inputFichier.addEventListener('change', function(e) {
            gererSelectionFichiers(e.target.files);
        });
    }
}

function gererSelectionFichiers(files) {
    fichiersSelectionnes = [];
    const listeFichiers = document.getElementById('liste-fichiers');
    
    if (!files || files.length === 0) {
        listeFichiers.innerHTML = '<small class="text-muted">Aucun fichier selectionne</small>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Vérifier la taille du fichier (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showNotification(`Le fichier "${file.name}" depasse 10MB`, 'error');
            continue;
        }
        
        fichiersSelectionnes.push(file);
        
        html += `
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <div>
                    <i class="bi bi-file-earmark"></i>
                    <span class="ms-2">${file.name}</span>
                    <small class="text-muted ms-2">(${(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="supprimerFichier(${i})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
    }
    
    listeFichiers.innerHTML = html || '<small class="text-muted">Aucun fichier selectionne</small>';
}

function supprimerFichier(index) {
    fichiersSelectionnes.splice(index, 1);
    // Mettre à jour l'affichage
    const input = document.getElementById('fichier-upload');
    gererSelectionFichiers(input.files);
}

function ajouterLienFichier() {
    const url = prompt('Entrez le lien de telechargement du fichier:');
    if (url && url.trim()) {
        liensFichiers.push(url.trim());
        afficherLiensFichiers();
        showNotification('Lien ajoute avec succes', 'success');
    }
}

function afficherLiensFichiers() {
    const listeFichiers = document.getElementById('liste-fichiers');
    let html = '';
    
    if (fichiersSelectionnes.length === 0 && liensFichiers.length === 0) {
        listeFichiers.innerHTML = '<small class="text-muted">Aucun fichier selectionne</small>';
        return;
    }
    
    // Afficher les fichiers uploadés
    fichiersSelectionnes.forEach((file, index) => {
        html += `
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <div>
                    <i class="bi bi-file-earmark"></i>
                    <span class="ms-2">${file.name}</span>
                    <small class="text-muted ms-2">(${(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                    <span class="badge bg-secondary ms-2">Fichier</span>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="supprimerFichier(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
    });
    
    // Afficher les liens
    liensFichiers.forEach((lien, index) => {
        html += `
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <div>
                    <i class="bi bi-link-45deg"></i>
                    <span class="ms-2">${lien}</span>
                    <span class="badge bg-info ms-2">Lien</span>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="supprimerLien(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
    });
    
    listeFichiers.innerHTML = html;
}

function supprimerLien(index) {
    liensFichiers.splice(index, 1);
    afficherLiensFichiers();
}

function chargerMessagePredefini() {
    const type = document.getElementById('type-message').value;
    const langue = document.getElementById('langue-message').value;
    
    console.log('Type sélectionné:', type);
    console.log('Langue sélectionnée:', langue);
    console.log('Messages disponibles:', MESSAGES_PRE_ENREGISTRES[langue]);
    
    if (type && MESSAGES_PRE_ENREGISTRES[langue] && MESSAGES_PRE_ENREGISTRES[langue][type]) {
        const message = MESSAGES_PRE_ENREGISTRES[langue][type];
        document.getElementById('sujet-message').value = message.titre;
        document.getElementById('texte-message').value = message.message;
        
        // Remplacer automatiquement les variables
        remplacerVariablesAutomatiques();
    } else {
        console.warn('Message non trouvé pour:', type, 'en', langue);
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
        '[reference]': commande.reference,  // SANS ACCENT - CORRECTION
        '[référence]': commande.reference,  // AVEC ACCENT
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
// ===== FONCTIONS UTILITAIRES =====

function nettoyerTexteCorrompu(texte) {
    if (!texte) return '';
    return texte
        .replace(/[RSBNMCLD]\d+/g, '')
        .replace(/\d{3,}/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// ===== FONCTION SUPPRIMER EMOJIS =====
function supprimerEmojis(texte) {
    if (!texte) return '';
    
    // Garde les lettres, chiffres, ponctuation et accents, supprime les emojis
    return texte.replace(/[^\w\s\u00C0-\u017F.,!?;:()\-@#$%&*+=/\\]/g, '');
}
function calculerDateLimite(dateCreation) {
    const date = new Date(dateCreation);
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('fr-FR');
}
// ... reste des fonctions utilitaires
function envoyerMessageViaPlateforme(plateforme, idCommande) {
    console.log('=== DÉBOGAGE ENVOI MESSAGE ===');
    console.log('Plateforme:', plateforme, 'ID Commande:', idCommande);
    
    // Récupérer les données AVANT le timeout
    const sujetInput = document.getElementById('sujet-message');
    const messageInput = document.getElementById('texte-message');
    
    if (!sujetInput || !messageInput) {
        showNotification('Erreur: impossible de trouver les champs de message', 'error');
        return;
    }
    
    const sujet = sujetInput.value.trim();
    const message = messageInput.value.trim();
    
    console.log('Sujet récupéré:', sujet);
    console.log('Message récupéré:', message);
    console.log('Référence dans message:', message.includes('DEV-'));
    
    if (!sujet || !message) {
        showNotification('Veuillez remplir le sujet et le message', 'error');
        return;
    }
    
    // Appeler directement sans timeout
    continuerEnvoiMessage(plateforme, idCommande, sujet, message);
}

function continuerEnvoiMessage(plateforme, idCommande, sujet, message) {
    // Debug
    debuggerEnvoiMessage(plateforme, idCommande, sujet, message);
    
    // ... le reste de votre code existant ...
    
    // Appel de la nouvelle fonction
    ouvrirApplicationMessage(plateforme, commande.contact, sujet, message, fichiersSelectionnes, liensFichiers);
    
    // ... suite ...
}
function reinitialiserFichiers() {
    fichiersSelectionnes = [];
    liensFichiers = [];
    const inputFichier = document.getElementById('fichier-upload');
    if (inputFichier) inputFichier.value = '';
    afficherLiensFichiers();
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
        
        // CORRECTION : Passer la commande en paramètre
        ouvrirApplicationMessage(plateforme, commande.contact, sujetFinal, messageFinal, fichiersSelectionnes, liensFichiers, commande);
        
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
// Fonction dédiée pour WhatsApp
function ouvrirWhatsApp(contact, message) {
    let numeroWhatsapp = '';
    
    if (contact) {
        // Nettoyer le numéro pour WhatsApp
        numeroWhatsapp = contact.replace(/[^0-9+]/g, '');
        // S'assurer que le numéro commence par +
        if (!numeroWhatsapp.startsWith('+')) {
            // Ajouter l'indicatif Madagascar par défaut
            if (numeroWhatsapp.startsWith('0')) {
                numeroWhatsapp = '+261' + numeroWhatsapp.substring(1);
            } else if (numeroWhatsapp.length === 9) {
                numeroWhatsapp = '+261' + numeroWhatsapp;
            }
        }
    }
    
    console.log('Numéro WhatsApp nettoyé:', numeroWhatsapp);
    
    // URL WhatsApp avec vérification
    let urlWhatsApp;
    if (numeroWhatsapp && numeroWhatsapp.length >= 9) {
        urlWhatsApp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(message)}`;
    } else {
        urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(message)}`;
    }
    
    console.log('URL WhatsApp:', urlWhatsApp);
    
    // Ouvrir dans un nouvel onglet avec des options pour éviter la fermeture
    const newWindow = window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
    
    if (newWindow) {
        newWindow.focus();
    } else {
        // Fallback si le popup est bloqué
        showNotification('Popup bloqué! Veuillez autoriser les popups ou copier manuellement le message.', 'warning');
        copierDansPressePapiers(message);
    }
    
    if (fichiersSelectionnes.length > 0) {
        showNotification('Ouvrez WhatsApp et ajoutez les fichiers manuellement', 'info');
    }
}

// Fonction dédiée pour Email
function ouvrirEmail(contact, sujet, message) {
    let email = '';
    
    if (contact && contact.includes('@')) {
        email = contact;
    }
    
    const subjectEncoded = encodeURIComponent(sujet);
    const bodyEncoded = encodeURIComponent(message);
    
    let urlEmail;
    if (email) {
        urlEmail = `mailto:${email}?subject=${subjectEncoded}&body=${bodyEncoded}`;
    } else {
        urlEmail = `mailto:?subject=${subjectEncoded}&body=${bodyEncoded}`;
    }
    
    window.open(urlEmail, '_blank');
    
    if (fichiersSelectionnes.length > 0) {
        showNotification('Ajoutez les fichiers en pièces jointes dans votre client email', 'info');
    }
}

// Fonction dédiée pour Facebook
function ouvrirFacebook(message) {
    window.open('https://www.facebook.com/messages', '_blank', 'noopener,noreferrer');
    copierDansPressePapiers(message);
    
    if (fichiersSelectionnes.length > 0) {
        showNotification('Ajoutez les fichiers manuellement dans Messenger', 'info');
    }
}

// Fonction utilitaire pour copier dans le presse-papiers
function copierDansPressePapiers(texte) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texte)
            .then(() => showNotification('✅ Message copié dans le presse-papiers', 'success'))
            .catch(() => showNotification('❌ Échec de la copie, ouvrez Messenger et collez manuellement', 'error'));
    } else {
        // Fallback pour anciens navigateurs
        const textArea = document.createElement('textarea');
        textArea.value = texte;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showNotification('✅ Message copié dans le presse-papiers', 'success');
            } else {
                showNotification('❌ Échec de la copie, ouvrez Messenger et collez manuellement', 'error');
            }
        } catch (err) {
            showNotification('❌ Échec de la copie, ouvrez Messenger et collez manuellement', 'error');
        }
        
        document.body.removeChild(textArea);
    }
}

// ===== FONCTION PRINCIPALE OUVERTURE APPLICATION =====
function ouvrirApplicationMessage(plateforme, contact, sujet, message, fichiers = [], liens = [], commande = null) {
    try {
        console.log('=== OUVERTURE APPLICATION ===');
        console.log('Commande:', commande);
        console.log('Référence:', commande?.reference);
        
        // CORRECTION ULTIME : Vérifier et corriger la référence
        let messageCorrige = message;
        
        if (commande && commande.reference) {
            // Vérifier si la référence est manquante
            if (!message.includes(commande.reference)) {
                console.warn('Référence manquante, correction...');
                // Remplacer DEV-- par la vraie référence
                messageCorrige = message.replace(/DEV--/g, commande.reference);
                console.log('Message corrigé:', messageCorrige);
            }
        }
        
        const messageAvecFichiers = ajouterFichiersAuMessage(messageCorrige, fichiers, liens);
        const messageComplet = `${sujet}\n\n${messageAvecFichiers}`;
        
        console.log('Message final:', messageComplet);
        
        // OUVERTURE SPÉCIFIQUE
        switch(plateforme) {
            case 'whatsapp':
                ouvrirWhatsApp(contact, messageComplet);
                break;
            case 'email':
                ouvrirEmail(contact, sujet, messageAvecFichiers);
                break;
            case 'facebook':
                ouvrirFacebook(messageComplet);
                break;
            default:
                throw new Error(`Plateforme non supportée: ${plateforme}`);
        }
        
    } catch (error) {
        console.error('Erreur ouverture application:', error);
        showNotification(`Erreur: ${error.message}`, 'error');
    }
}

// ===== FONCTIONS SPÉCIFIQUES PAR PLATEFORME =====

function ouvrirWhatsApp(contact, message) {
    console.group('📱 Ouverture WhatsApp');
    
    // Préparation du numéro
    const numeroWhatsapp = formaterNumeroWhatsApp(contact);
    console.log('Numéro formaté:', numeroWhatsapp);
    
    // Encodage URL sécurisé
    const messageEncode = encoderMessageURL(message);
    console.log('Message encodé:', messageEncode.substring(0, 100) + '...');
    
    // Construction URL
    const urlWhatsApp = numeroWhatsapp 
        ? `https://wa.me/${numeroWhatsapp}?text=${messageEncode}`
        : `https://wa.me/?text=${messageEncode}`;
    
    console.log('URL WhatsApp générée');
    
    // Vérification finale
    if (!verifierReferenceDansMessage(message)) {
        console.warn('⚠️ Attention: référence potentiellement perdue');
    }
    
    // Ouverture
    ouvrirFenetreSecurisee(urlWhatsApp, 'WhatsApp');
    
    // Notification fichiers
    if (fichiersSelectionnes.length > 0) {
        showNotification('📎 Ajoutez les fichiers manuellement dans WhatsApp', 'info');
    }
    
    console.groupEnd();
}

function ouvrirEmail(contact, sujet, message) {
    console.group('📧 Ouverture Email');
    
    const email = contact && contact.includes('@') ? contact : '';
    const sujetEncode = encodeURIComponent(sujet);
    const messageEncode = encodeURIComponent(message);
    
    const urlEmail = email
        ? `mailto:${email}?subject=${sujetEncode}&body=${messageEncode}`
        : `mailto:?subject=${sujetEncode}&body=${messageEncode}`;
    
    console.log('URL Email générée');
    ouvrirFenetreSecurisee(urlEmail, 'Email');
    
    if (fichiersSelectionnes.length > 0) {
        showNotification('📎 Ajoutez les pièces jointes dans votre client email', 'info');
    }
    
    console.groupEnd();
}

function ouvrirFacebook(message) {
    console.group('💬 Ouverture Facebook Messenger');
    
    // Ouvrir Messenger
    ouvrirFenetreSecurisee('https://www.facebook.com/messages', 'Facebook Messenger');
    
    // Copier le message dans le presse-papiers
    copierMessagePressePapiers(message);
    
    console.groupEnd();
}

// ===== FONCTIONS UTILITAIRES AVANCÉES =====

function formaterNumeroWhatsApp(contact) {
    if (!contact) return '';
    
    let numero = contact.replace(/[^0-9+]/g, '');
    
    // Formatage pour Madagascar
    if (numero.startsWith('0')) {
        numero = '+261' + numero.substring(1);
    } else if (numero.length === 9 && !numero.startsWith('+')) {
        numero = '+261' + numero;
    }
    
    // Validation du format international
    if (!numero.startsWith('+')) {
        console.warn('Format de numéro non international:', numero);
    }
    
    return numero;
}

function encoderMessageURL(message) {
    // Encodage URL standard - ne pas nettoyer les caractères des références
    return encodeURIComponent(message);
}

function ajouterFichiersAuMessage(message, fichiers, liens) {
    if (fichiers.length === 0 && liens.length === 0) {
        return message;
    }
    
    let messageAvecFichiers = message + "\n\n--- FICHIERS JOINTS ---\n";
    
    // Ajouter les fichiers
    fichiers.forEach(fichier => {
        const tailleMo = (fichier.size / 1024 / 1024).toFixed(2);
        messageAvecFichiers += `\n📄 ${fichier.name} (${tailleMo} MB) - ${fichier.type || 'Type inconnu'}`;
    });
    
    // Ajouter les liens
    liens.forEach(lien => {
        messageAvecFichiers += `\n🔗 ${lien}`;
    });
    
    messageAvecFichiers += "\n\nLes fichiers vous seront transmis par les moyens appropriés.";
    
    return messageAvecFichiers;
}

function verifierReferenceDansMessage(message) {
    // Vérifier la présence des formats de référence courants
    const formatsReference = [
        /DEV-\d{6}-\d+/i,    // DEV-251109-443
        /FAC-\d{6}-\d+/i,    // FAC-251109-443  
        /MSN-\d{6}-\d+/i,    // MSN-251109-443
        /[A-Z]{3}-\d+-\d+/i  // Format générique
    ];
    
    return formatsReference.some(format => format.test(message));
}

function ouvrirFenetreSecurisee(url, nomApplication) {
    const fenetre = window.open(url, '_blank', 'noopener,noreferrer,width=800,height=600');
    
    if (fenetre) {
        fenetre.focus();
        console.log(`✅ ${nomApplication} ouvert avec succès`);
    } else {
        throw new Error(`Impossible d'ouvrir ${nomApplication}. Vérifiez les bloqueurs de popup.`);
    }
    
    return fenetre;
}

function copierMessagePressePapiers(message) {
    const succes = copierDansPressePapiers(message);
    
    if (succes) {
        showNotification('✅ Message copié dans le presse-papiers - Collez-le dans Messenger', 'success');
    } else {
        showNotification('❌ Échec de la copie - Ouvrez Messenger et collez manuellement le message', 'error');
    }
}

// ===== FONCTION AMÉLIORÉE POUR LE PRESSE-PAPIERS =====
function copierDansPressePapiers(texte) {
    return new Promise((resolve) => {
        // Méthode moderne
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(texte)
                .then(() => resolve(true))
                .catch(() => {
                    // Fallback pour anciens navigateurs
                    resolve(copierFallback(texte));
                });
        } else {
            // Méthode legacy
            resolve(copierFallback(texte));
        }
    });
}

function copierFallback(texte) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = texte;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, 99999); // Pour mobile
        
        const succes = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return succes;
    } catch (err) {
        console.error('Erreur copie fallback:', err);
        return false;
    }
}

// ===== FONCTION DE GESTION DES FICHIERS =====
function reinitialiserFichiers() {
    fichiersSelectionnes = [];
    liensFichiers = [];
    
    const inputFichier = document.getElementById('fichier-upload');
    if (inputFichier) inputFichier.value = '';
    
    const listeFichiers = document.getElementById('liste-fichiers');
    if (listeFichiers) {
        listeFichiers.innerHTML = '<small class="text-muted">Aucun fichier sélectionné</small>';
    }
    
    console.log('🗂️ Fichiers réinitialisés pour nouvel envoi');
}
// Fonction de nettoyage spécifique pour les URLs
function nettoyerPourURL(texte) {
    if (!texte) return '';
    
    // Garder tous les caractères importants y compris les tirets et chiffres des références
    return texte
        // Supprimer seulement les emojis problématiques
        .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu, '')
        // Garder les tirets, chiffres, lettres, accents, ponctuation normale
        .replace(/[^\w\s\u00C0-\u017F.,!?;:()\-@#$%&*+=/\\]/g, '')
        // Nettoyer les espaces multiples
        .replace(/\s+/g, ' ')
        .trim();
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

function exporterDonneesExcel() {
    const commandes = dataManager.getCommandes();
    const clients = extraireDonneesClients();
    const finances = calculerStatistiquesFinancieres();
    
    // Créer les données Excel
    const donnees = {
        commandes: commandes.map(cmd => ({
            'Référence': cmd.reference,
            'Client': cmd.client,
            'Contact': cmd.contact,
            'Services': cmd.services.map(s => s.nom).join('; '),
            'Total': cmd.total,
            'Statut': getStatutTexte(cmd.statut),
            'Paiement': getPaiementTexte(cmd.paiement),
            'Validation': getValidationTexte(cmd.validation),
            'Date création': new Date(cmd.dateCreation).toLocaleDateString('fr-FR'),
            'Durée estimée': cmd.duree || ''
        })),
        clients: clients.map(cli => ({
            'Client': cli.nom,
            'Contact': cli.contact,
            'Commandes totales': cli.totalCommandes,
            'Total dépensé': cli.totalDepense + ' Ar',
            'Dernière commande': new Date(cli.derniereCommande).toLocaleDateString('fr-FR')
        })),
        finances: [
            {
                'Type': 'Total encaissé',
                'Montant': finances.totalEncaisse + ' Ar'
            },
            {
                'Type': 'CA mensuel', 
                'Montant': finances.caMensuel + ' Ar'
            },
            {
                'Type': 'En attente de paiement',
                'Montant': finances.totalAttente + ' Ar'
            }
        ]
    };
    
    // Générer le fichier Excel (version simplifiée)
    genererFichierExcel(donnees);
}

function genererFichierExcel(donnees) {
    // Créer le contenu CSV (version simplifiée sans bibliothèque externe)
    let contenuCSV = '';
    
    // Feuille Commandes
    contenuCSV += "FEUILLE COMMANDES\n";
    if (donnees.commandes.length > 0) {
        const entetes = Object.keys(donnees.commandes[0]);
        contenuCSV += entetes.join(';') + '\n';
        
        donnees.commandes.forEach(ligne => {
            contenuCSV += Object.values(ligne).join(';') + '\n';
        });
    }
    
    contenuCSV += "\nFEUILLE CLIENTS\n";
    if (donnees.clients.length > 0) {
        const entetes = Object.keys(donnees.clients[0]);
        contenuCSV += entetes.join(';') + '\n';
        
        donnees.clients.forEach(ligne => {
            contenuCSV += Object.values(ligne).join(';') + '\n';
        });
    }
    
    contenuCSV += "\nFEUILLE FINANCES\n";
    if (donnees.finances.length > 0) {
        const entetes = Object.keys(donnees.finances[0]);
        contenuCSV += entetes.join(';') + '\n';
        
        donnees.finances.forEach(ligne => {
            contenuCSV += Object.values(ligne).join(';') + '\n';
        });
    }
    
    // Créer et télécharger le fichier
    const blob = new Blob(["\uFEFF" + contenuCSV], { type: 'text/csv;charset=utf-8;' });
    const lien = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    lien.setAttribute('href', url);
    lien.setAttribute('download', `backup_msn_${new Date().toISOString().split('T')[0]}.csv`);
    lien.style.visibility = 'hidden';
    
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
    
    showNotification('Données exportées avec succès', 'success');
}

function importerDonneesExcel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                traiterFichierImport(e.target.result, file.name);
            } catch (error) {
                showNotification('Erreur lors de l\'import: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function traiterFichierImport(contenu, nomFichier) {
    if (!confirm(`Voulez-vous importer les données depuis ${nomFichier} ? Les données existantes seront sauvegardées.`)) {
        return;
    }
    
    // Sauvegarder les données existantes
    const backup = {
        commandes: dataManager.getCommandes(),
        parametres: dataManager.getParametres(),
        notifications: dataManager.getNotifications()
    };
    
    localStorage.setItem('msn_backup_' + new Date().toISOString(), JSON.stringify(backup));
    
    // Traiter le fichier CSV (version simplifiée)
    const lignes = contenu.split('\n');
    let sectionActuelle = '';
    const donneesImportees = {
        commandes: [],
        clients: []
    };
    
    lignes.forEach(ligne => {
        ligne = ligne.trim();
        if (!ligne) return;
        
        if (ligne.includes('FEUILLE COMMANDES')) {
            sectionActuelle = 'commandes';
        } else if (ligne.includes('FEUILLE CLIENTS')) {
            sectionActuelle = 'clients';
        } else if (sectionActuelle && !ligne.includes('FEUILLE')) {
            const colonnes = ligne.split(';');
            
            if (sectionActuelle === 'commandes' && colonnes.length > 1) {
                // Traiter les commandes (simplifié)
                if (!isNaN(colonnes[0])) return; // Ignorer l'en-tête
                
                const commande = {
                    id: Date.now() + Math.random(),
                    reference: colonnes[0] || 'IMP-' + Date.now(),
                    client: colonnes[1] || 'Client importé',
                    contact: colonnes[2] || '',
                    services: [{ nom: colonnes[3] || 'Service importé', quantite: 1, prixUnitaire: 0, sousTotal: 0 }],
                    total: colonnes[4] || '0 Ar',
                    statut: 'devis',
                    paiement: 'en_attente',
                    validation: 'en_cours',
                    dateCreation: new Date().toISOString()
                };
                
                donneesImportees.commandes.push(commande);
            }
        }
    });
    
    // Fusionner avec les données existantes
    if (donneesImportees.commandes.length > 0) {
        const commandesExistantes = dataManager.getCommandes();
        const nouvellesCommandes = [...commandesExistantes, ...donneesImportees.commandes];
        localStorage.setItem('msn_commandes', JSON.stringify(nouvellesCommandes));
    }
    
    showNotification(`${donneesImportees.commandes.length} commandes importées avec succès`, 'success');
    actualiserDonnees();
}

function extraireDonneesClients() {
    const commandes = dataManager.getCommandes();
    const clients = {};
    
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
    
    return Object.values(clients);
}

function calculerStatistiquesFinancieres() {
    const commandes = dataManager.getCommandes();
    const commandesPayees = commandes.filter(c => c.paiement === 'paye');
    const commandesEnAttente = commandes.filter(c => c.paiement === 'en_attente');
    
    const totalEncaisse = commandesPayees.reduce((total, cmd) => {
        const montant = parseFloat(cmd.total.replace(/[^0-9]/g, '')) || 0;
        return total + montant;
    }, 0);
    
    const totalAttente = commandesEnAttente.reduce((total, cmd) => {
        const montant = parseFloat(cmd.total.replace(/[^0-9]/g, '')) || 0;
        return total + montant;
    }, 0);
    
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    const caMensuel = commandes
        .filter(cmd => new Date(cmd.dateCreation) >= debutMois)
        .reduce((total, cmd) => {
            const montant = parseFloat(cmd.total.replace(/[^0-9]/g, '')) || 0;
            return total + montant;
        }, 0);
    
    return { totalEncaisse, totalAttente, caMensuel };
}

function importerDonneesExcel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                traiterFichierImport(e.target.result, file.name);
            } catch (error) {
                showNotification('Erreur lors de l\'import: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function traiterFichierImport(contenu, nomFichier) {
    if (!confirm(`Voulez-vous importer les données depuis ${nomFichier} ? Les données existantes seront sauvegardées.`)) {
        return;
    }
    
    // Sauvegarder les données existantes
    const backup = {
        commandes: dataManager.getCommandes(),
        parametres: dataManager.getParametres(),
        notifications: dataManager.getNotifications()
    };
    
    localStorage.setItem('msn_backup_' + new Date().toISOString(), JSON.stringify(backup));
    
    // Traiter le fichier CSV (version simplifiée)
    const lignes = contenu.split('\n');
    let sectionActuelle = '';
    const donneesImportees = {
        commandes: [],
        clients: []
    };
    
    lignes.forEach(ligne => {
        ligne = ligne.trim();
        if (!ligne) return;
        
        if (ligne.includes('FEUILLE COMMANDES')) {
            sectionActuelle = 'commandes';
        } else if (ligne.includes('FEUILLE CLIENTS')) {
            sectionActuelle = 'clients';
        } else if (sectionActuelle && !ligne.includes('FEUILLE')) {
            const colonnes = ligne.split(';');
            
            if (sectionActuelle === 'commandes' && colonnes.length > 1) {
                // Traiter les commandes (simplifié)
                if (!isNaN(colonnes[0])) return; // Ignorer l'en-tête
                
                const commande = {
                    id: Date.now() + Math.random(),
                    reference: colonnes[0] || 'IMP-' + Date.now(),
                    client: colonnes[1] || 'Client importé',
                    contact: colonnes[2] || '',
                    services: [{ nom: colonnes[3] || 'Service importé', quantite: 1, prixUnitaire: 0, sousTotal: 0 }],
                    total: colonnes[4] || '0 Ar',
                    statut: 'devis',
                    paiement: 'en_attente',
                    validation: 'en_cours',
                    dateCreation: new Date().toISOString()
                };
                
                donneesImportees.commandes.push(commande);
            }
        }
    });
    
    // Fusionner avec les données existantes
    if (donneesImportees.commandes.length > 0) {
        const commandesExistantes = dataManager.getCommandes();
        const nouvellesCommandes = [...commandesExistantes, ...donneesImportees.commandes];
        localStorage.setItem('msn_commandes', JSON.stringify(nouvellesCommandes));
    }
    
    showNotification(`${donneesImportees.commandes.length} commandes importées avec succès`, 'success');
    actualiserDonnees();
}

function extraireDonneesClients() {
    const commandes = dataManager.getCommandes();
    const clients = {};
    
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
    
    return Object.values(clients);
}

function extraireDonneesClients() {
    const commandes = dataManager.getCommandes();
    const clients = {};
    
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
    
    return Object.values(clients);
}

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
                                        <button onclick="exporterCommande(${commande.id})" class="btn btn-sm btn-outline-primary btn-action-mobile" title="Exporter PDF">
                                            <i class="bi bi-file-pdf"></i>
                                        </button>
                                        <button onclick="voirDetails(${commande.id})" class="btn btn-sm btn-outline-secondary btn-action-mobile" title="Voir détails">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button onclick="afficherFormulaireMessage(${commande.id})" class="btn btn-sm btn-outline-info btn-action-mobile" title="Envoyer message">
                                            <i class="bi bi-chat"></i>
                                        </button>
                                        <button onclick="modifierCommande(${commande.id})" class="btn btn-sm btn-outline-warning btn-action-mobile" title="Modifier">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button onclick="supprimerCommande(${commande.id})" class="btn btn-sm btn-outline-danger btn-action-mobile" title="Supprimer">
                                            <i class="bi bi-trash"></i>
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
    
    // ... reste du code ...
}
// Initialisation des onglets Commandes
function initialiserOngletsCommandes() {
    const tabEl = document.querySelector('button[data-bs-target="#devis"]');
    if (tabEl) {
        tabEl.addEventListener('shown.bs.tab', function (event) {
            const target = event.target.getAttribute('data-bs-target');
            const filtre = target.replace('#', '');
            console.log('🔍 Changement onglet:', filtre);
            chargerCommandes(filtre === 'toutes' ? 'toutes' : filtre);
        });
    }
    
    // Écouter tous les onglets
    const allTabs = document.querySelectorAll('#ordersTab button[data-bs-toggle="tab"]');
    allTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            const target = event.target.getAttribute('data-bs-target');
            const filtre = target.replace('#', '');
            console.log('📊 Chargement commandes avec filtre:', filtre);
            chargerCommandes(filtre === 'toutes' ? 'toutes' : filtre);
        });
    });
}

// Appeler cette fonction après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    initialiserOngletsCommandes();
});

function chargerCommandes(filtre = 'toutes') {
    let commandes = dataManager.getCommandes();
    
    // FILTRAGE CORRECT DES COMMANDES
    if (filtre !== 'toutes') {
        commandes = commandes.filter(cmd => {
            switch(filtre) {
                case 'devis':
                    return cmd.statut === 'devis';
                case 'traitement':
                    return cmd.statut === 'traitement';
                case 'termine':
                    return cmd.statut === 'termine';
                case 'paye':
                    return cmd.paiement === 'paye';
                default:
                    return true;
            }
        });
    }

    commandes = commandes.reverse();

    const containerId = `liste-commandes${filtre !== 'toutes' ? '-' + filtre : ''}`;
    const container = document.getElementById(containerId) || document.getElementById('liste-commandes');

    if (!container) {
        console.error('Container non trouvé:', containerId);
        return;
    }

    if (commandes.length === 0) {
        let messageVide = '';
        switch(filtre) {
            case 'devis':
                messageVide = 'Aucun devis en attente';
                break;
            case 'traitement':
                messageVide = 'Aucune commande en traitement';
                break;
            case 'termine':
                messageVide = 'Aucune commande terminée';
                break;
            case 'paye':
                messageVide = 'Aucune commande payée';
                break;
            default:
                messageVide = 'Aucune commande';
        }
        
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📭</div>
                <h3>${messageVide}</h3>
                <p>Les commandes apparaîtront ici après leur création.</p>
                ${filtre === 'toutes' ? `
                    <button onclick="ajouterNouvelleCommande()" class="btn btn-success mt-3">
                        <i class="bi bi-plus-circle"></i> Créer votre première commande
                    </button>
                ` : ''}
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
                                        <div class="actions-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;">
                                            <button onclick="exporterCommande(${commande.id})" class="btn btn-sm btn-outline-primary" title="Exporter PDF">
                                                <i class="bi bi-file-pdf"></i>
                                            </button>
                                            <button onclick="voirDetails(${commande.id})" class="btn btn-sm btn-outline-secondary" title="Voir détails">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                            <button onclick="afficherFormulaireMessage(${commande.id})" class="btn btn-sm btn-outline-info" title="Envoyer message">
                                                <i class="bi bi-chat"></i>
                                            </button>
                                            <button onclick="modifierCommande(${commande.id})" class="btn btn-sm btn-outline-warning" title="Modifier">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button onclick="supprimerCommande(${commande.id})" class="btn btn-sm btn-outline-danger" title="Supprimer">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                            <button onclick="dupliquerCommande(${commande.id})" class="btn btn-sm btn-outline-success" title="Dupliquer">
                                                <i class="bi bi-copy"></i>
                                            </button>
                                            ${(commande.validation === 'en_cours' || !commande.validation) ? `
                                                <button onclick="genererRapportMiseAJour(${commande.id})" class="btn btn-sm btn-outline-warning" title="Générer rapport">
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

    // Mettre à jour les compteurs
    actualiserCompteurs();
}

function changerLivraison(idCommande, nouvelleLivraison) {
    if (dataManager.mettreAJourCommande(idCommande, { livraison: nouvelleLivraison })) {
        actualiserDonnees();
        showNotification('Statut livraison mis à jour', 'success');
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
// ===== GESTION COMPLÈTE DES COMMANDES =====

// ===== FONCTION COMPLÈTE AJOUTER NOUVELLE COMMANDE =====
function ajouterNouvelleCommande() {
    // Générer la référence AVANT d'ouvrir le modal
    const referenceDevis = referenceManager.genererReferenceDevis();
    const referenceFacture = referenceManager.genererReferenceFacture();

    const modalHTML = `
        <div class="modal fade" id="modalNouvelleCommande" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-plus-circle me-2"></i>Nouvelle Commande
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            <strong>Références générées :</strong><br>
                            • Devis: <code>${referenceDevis}</code><br>
                            • Facture: <code>${referenceFacture}</code>
                        </div>

                        <form id="formNouvelleCommande">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Client *</label>
                                    <input type="text" class="form-control" id="nouveau-client" required 
                                           placeholder="Nom complet du client">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Contact *</label>
                                    <input type="text" class="form-control" id="nouveau-contact" required 
                                           placeholder="Téléphone / Email client">
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Référence Devis</label>
                                    <input type="text" class="form-control bg-light" value="${referenceDevis}" readonly>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Durée estimée</label>
                                    <select class="form-select" id="nouvelle-duree">
                                        <option value="1 jour">1 jour</option>
                                        <option value="2 jours">2 jours</option>
                                        <option value="3 jours" selected>3 jours</option>
                                        <option value="5 jours">5 jours</option>
                                        <option value="7 jours">7 jours</option>
                                        <option value="À confirmer">À confirmer</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- SERVICES PRÉDÉFINIS RAPIDES -->
                            <div class="mb-4">
                                <label class="form-label fw-semibold">
                                    <i class="bi bi-lightning me-2"></i>Services Rapides
                                </label>
                                <div class="row g-2" id="services-rapides">
                                    <!-- Services seront ajoutés dynamiquement -->
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label fw-semibold">
                                    <i class="bi bi-list-check me-2"></i>Services Détaillés *
                                </label>
                                <div id="liste-services-nouvelle">
                                    <div class="service-item card border mb-3">
                                        <div class="card-body">
                                            <div class="row g-2 align-items-center">
                                                <div class="col-md-5">
                                                    <input type="text" class="form-control" placeholder="Nom du service" 
                                                           name="service-nom" required>
                                                </div>
                                                <div class="col-md-2">
                                                    <input type="number" class="form-control" placeholder="Qté" 
                                                           name="service-quantite" value="1" min="1" required>
                                                </div>
                                                <div class="col-md-2">
                                                    <select class="form-select" name="service-unite" required>
                                                        <option value="unité">unité</option>
                                                        <option value="heure">heure</option>
                                                        <option value="jour">jour</option>
                                                        <option value="page">page</option>
                                                        <option value="mot">mot</option>
                                                        <option value="projet">projet</option>
                                                    </select>
                                                </div>
                                                <div class="col-md-2">
                                                    <input type="number" class="form-control" placeholder="Prix (Ar)" 
                                                           name="service-prix" min="0" step="100" required>
                                                </div>
                                                <div class="col-md-1">
                                                    <button type="button" class="btn btn-danger btn-sm" onclick="supprimerService(this)" 
                                                            title="Supprimer ce service">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-outline-primary btn-sm" onclick="ajouterService()">
                                    <i class="bi bi-plus-circle me-1"></i>Ajouter un service
                                </button>
                                <button type="button" class="btn btn-info btn-sm ms-2" onclick="debugServices()">
                                    <i class="bi bi-bug me-1"></i>Debug
                                </button>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Total estimé</label>
                                    <input type="text" class="form-control bg-light fw-bold" 
                                           id="nouveau-total" value="0 Ar" readonly>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Nombre de services</label>
                                    <input type="text" class="form-control bg-light" 
                                           id="nombre-services" value="1 service" readonly>
                                </div>
                            </div>

                            <!-- OPTIONS AVANCÉES -->
                            <div class="accordion mb-3" id="accordionOptions">
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed" type="button" 
                                                data-bs-toggle="collapse" data-bs-target="#collapseOptions">
                                            <i class="bi bi-gear me-2"></i>Options avancées
                                        </button>
                                    </h2>
                                    <div id="collapseOptions" class="accordion-collapse collapse" 
                                         data-bs-parent="#accordionOptions">
                                        <div class="accordion-body">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <div class="form-check form-switch">
                                                        <input class="form-check-input" type="checkbox" 
                                                               id="option-notification" checked>
                                                        <label class="form-check-label" for="option-notification">
                                                            Notifier le client
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="form-check form-switch">
                                                        <input class="form-check-input" type="checkbox" 
                                                               id="option-rappel" checked>
                                                        <label class="form-check-label" for="option-rappel">
                                                            Rappel automatique
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle me-1"></i>Annuler
                        </button>
                        <button type="button" class="btn btn-success" onclick="sauvegarderNouvelleCommande('${referenceDevis}', '${referenceFacture}')">
                            <i class="bi bi-check-circle me-1"></i>Créer la commande
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancien modal s'il existe
    const existingModal = document.getElementById('modalNouvelleCommande');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Ajouter le nouveau modal au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialiser les services rapides
    initialiserServicesRapides();
    
    // Initialiser les écouteurs après un court délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
        initialiserEcouteursNouvelleCommande();
        calculerTotalNouvelleCommande(); // Calcul initial
        console.log('✅ Modal nouvelle commande initialisé');
    }, 200);
    
    // Afficher le modal
    const modalElement = document.getElementById('modalNouvelleCommande');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Écouter la fermeture du modal pour nettoyer
    modalElement.addEventListener('hidden.bs.modal', function() {
        console.log('Modal fermé - nettoyage');
        // Réinitialiser les variables si nécessaire
    });
}// ===== FONCTION PRINCIPALE SIMPLIFIÉE =====
function ajouterNouvelleCommande() {
    // Générer les références
    const referenceDevis = 'DEV-' + Date.now().toString().slice(-6);
    const referenceFacture = 'FAC-' + Date.now().toString().slice(-6);

    const modalHTML = `
        <div class="modal fade" id="modalNouvelleCommande" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">➕ Nouvelle Commande</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <strong>Références :</strong> Devis: ${referenceDevis} | Facture: ${referenceFacture}
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Client *</label>
                                <input type="text" class="form-control" id="nouveau-client" placeholder="Nom du client">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Contact *</label>
                                <input type="text" class="form-control" id="nouveau-contact" placeholder="Téléphone/Email">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Durée</label>
                            <select class="form-select" id="nouvelle-duree">
                                <option value="3 jours" selected>3 jours</option>
                                <option value="1 jour">1 jour</option>
                                <option value="5 jours">5 jours</option>
                                <option value="7 jours">7 jours</option>
                            </select>
                        </div>
                        
                        <!-- SERVICES -->
                        <div class="mb-3">
                            <label class="form-label">Services *</label>
                            <div id="liste-services-nouvelle">
                                <!-- Premier service -->
                                <div class="service-item border p-3 mb-2">
                                    <div class="row">
                                        <div class="col-md-5">
                                            <input type="text" class="form-control" placeholder="Nom du service" name="service-nom">
                                        </div>
                                        <div class="col-md-2">
                                            <input type="number" class="form-control" placeholder="Qté" name="service-quantite" value="1" min="1">
                                        </div>
                                        <div class="col-md-2">
                                            <select class="form-select" name="service-unite">
                                                <option value="unité">unité</option>
                                                <option value="page">page</option>
                                                <option value="heure">heure</option>
                                            </select>
                                        </div>
                                        <div class="col-md-2">
                                            <input type="number" class="form-control" placeholder="Prix (Ar)" name="service-prix" min="0">
                                        </div>
                                        <div class="col-md-1">
                                            <button type="button" class="btn btn-danger btn-sm" onclick="supprimerServiceSimple(this)">🗑️</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="button" class="btn btn-outline-primary btn-sm mt-2" onclick="ajouterServiceSimple()">
                                ➕ Ajouter un service
                            </button>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Total</label>
                                <input type="text" class="form-control bg-success text-white fw-bold" id="nouveau-total" value="0 Ar" readonly>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Nombre de services</label>
                                <input type="text" class="form-control bg-info text-white" id="nombre-services" value="1 service" readonly>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-success" onclick="sauvegarderCommandeSimple('${referenceDevis}', '${referenceFacture}')">
                            ✅ Créer la commande
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter le modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('modalNouvelleCommande'));
    modal.show();
    
    // Initialiser les écouteurs
    setTimeout(initialiserEcouteursSimples, 100);
}

// ===== FONCTION AJOUTER SERVICE SIMPLE =====
function ajouterServiceSimple() {
    const listeServices = document.getElementById('liste-services-nouvelle');
    
    const nouveauService = `
        <div class="service-item border p-3 mb-2">
            <div class="row">
                <div class="col-md-5">
                    <input type="text" class="form-control" placeholder="Nom du service" name="service-nom">
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control" placeholder="Qté" name="service-quantite" value="1" min="1">
                </div>
                <div class="col-md-2">
                    <select class="form-select" name="service-unite">
                        <option value="unité">unité</option>
                        <option value="page">page</option>
                        <option value="heure">heure</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control" placeholder="Prix (Ar)" name="service-prix" min="0">
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-danger btn-sm" onclick="supprimerServiceSimple(this)">🗑️</button>
                </div>
            </div>
        </div>
    `;
    
    listeServices.insertAdjacentHTML('beforeend', nouveauService);
    calculerTotalSimple();
}

// ===== FONCTION SUPPRIMER SERVICE SIMPLE =====
function supprimerServiceSimple(bouton) {
    bouton.closest('.service-item').remove();
    calculerTotalSimple();
}

// ===== CALCUL DU TOTAL SIMPLE =====
function calculerTotalSimple() {
    let total = 0;
    let nbServices = 0;
    
    document.querySelectorAll('.service-item').forEach(item => {
        const quantite = parseInt(item.querySelector('input[name="service-quantite"]').value) || 0;
        const prix = parseInt(item.querySelector('input[name="service-prix"]').value) || 0;
        
        if (quantite > 0 && prix > 0) {
            total += quantite * prix;
            nbServices++;
        }
    });
    
    document.getElementById('nouveau-total').value = total.toLocaleString('fr-FR') + ' Ar';
    document.getElementById('nombre-services').value = nbServices + ' service' + (nbServices > 1 ? 's' : '');
}

// ===== INITIALISATION DES ÉCOUTEURS =====
function initialiserEcouteursSimples() {
    // Écouter les changements de prix et quantité
    document.addEventListener('input', function(e) {
        if (e.target.matches('input[name="service-prix"], input[name="service-quantite"]')) {
            calculerTotalSimple();
        }
    });
}

// ===== SAUVEGARDE SIMPLIFIÉE =====
function sauvegarderCommandeSimple(referenceDevis, referenceFacture) {
    // Récupérer les données de base
    const client = document.getElementById('nouveau-client').value.trim();
    const contact = document.getElementById('nouveau-contact').value.trim();
    const duree = document.getElementById('nouvelle-duree').value;
    
    // Vérification simple
    if (!client || !contact) {
        alert('❌ Veuillez remplir le client et le contact');
        return;
    }
    
    // Récupérer les services
    const services = [];
    document.querySelectorAll('.service-item').forEach(item => {
        const nom = item.querySelector('input[name="service-nom"]').value.trim();
        const quantite = parseInt(item.querySelector('input[name="service-quantite"]').value) || 1;
        const unite = item.querySelector('select[name="service-unite"]').value;
        const prix = parseInt(item.querySelector('input[name="service-prix"]').value) || 0;
        
        // Vérifier que le service a un nom et un prix
        if (nom && prix > 0) {
            services.push({
                nom: nom,
                quantite: quantite,
                unite: unite,
                prixUnitaire: prix,
                sousTotal: quantite * prix
            });
        }
    });
    
    // Vérifier qu'il y a au moins un service
    if (services.length === 0) {
        alert('❌ Veuillez ajouter au moins un service valide (avec nom et prix)');
        return;
    }
    
    // Calculer le total
    const total = services.reduce((sum, service) => sum + service.sousTotal, 0);
    
    // Créer l'objet commande
    const nouvelleCommande = {
        id: Date.now(),
        reference: referenceDevis,
        client: client,
        contact: contact,
        services: services,
        total: total.toLocaleString('fr-FR') + ' Ar',
        statut: 'devis',
        paiement: 'en_attente',
        dateCreation: new Date().toISOString(),
        duree: duree
    };
    
    // Sauvegarder dans localStorage
    let commandesExistantes = JSON.parse(localStorage.getItem('msn_commandes') || '[]');
    commandesExistantes.push(nouvelleCommande);
    localStorage.setItem('msn_commandes', JSON.stringify(commandesExistantes));
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalNouvelleCommande'));
    modal.hide();
    
    // Message de succès
    alert('✅ Commande créée avec succès !');
    
    // Actualiser l'affichage
    actualiserDonnees();
}

// ===== FONCTIONS DE SUPPORT POUR LA NOUVELLE COMMANDE =====

function initialiserServicesRapides() {
    const servicesRapides = [
        { nom: "Saisie document", prix: 700, unite: "page", icone: "📄" },
        { nom: "Mise en forme", prix: 400, unite: "page", icone: "✏️" },
        { nom: "Tableau", prix: 1000, unite: "tableau", icone: "📊" },
        { nom: "Figure complexe", prix: 1500, unite: "figure", icone: "🖼️" },
        { nom: "Graphique", prix: 1500, unite: "élément", icone: "📈" },
        { nom: "Logo", prix: 50000, unite: "logo", icone: "🎨" },
        { nom: "Affiche Standard", prix: 20000, unite: "affiche", icone: "🖼️" },
        { nom: "Vectorisation", prix: 25000, unite: "image", icone: "✏️" }
    ];

    const container = document.getElementById('services-rapides');
    if (!container) {
        console.error('❌ Container services-rapides non trouvé');
        return;
    }

    container.innerHTML = servicesRapides.map(service => `
        <div class="col-6 col-md-3">
            <div class="service-rapide-card" 
                 onclick="ajouterServiceRapide('${service.nom}', ${service.prix}, '${service.unite}')"
                 title="Ajouter ${service.nom} - ${service.prix.toLocaleString()} Ar/${service.unite}">
                <div class="service-rapide-icon">${service.icone}</div>
                <div class="service-rapide-name">${service.nom}</div>
                <div class="service-rapide-price">${service.prix.toLocaleString()} Ar</div>
            </div>
        </div>
    `).join('');
    
    console.log('✅ Services rapides initialisés');
}

function ajouterServiceRapide(nom, prix, unite) {
    console.log(`➕ Ajout service rapide: ${nom} - ${prix} Ar - ${unite}`);
    
    // Ajouter une nouvelle ligne de service
    ajouterService();
    
    // Remplir avec les valeurs du service rapide
    const derniereLigne = document.querySelector('#liste-services-nouvelle .service-item:last-child');
    if (derniereLigne) {
        const inputNom = derniereLigne.querySelector('input[name="service-nom"]');
        const inputPrix = derniereLigne.querySelector('input[name="service-prix"]');
        const selectUnite = derniereLigne.querySelector('select[name="service-unite"]');
        
        if (inputNom) inputNom.value = nom;
        if (inputPrix) inputPrix.value = prix;
        if (selectUnite) selectUnite.value = unite;
        
        console.log(`✅ Service rapide "${nom}" ajouté`);
    }
    
    // Recalculer le total
    calculerTotalNouvelleCommande();
    
    // Petit feedback visuel
    const serviceCard = event.target.closest('.service-rapide-card');
    if (serviceCard) {
        serviceCard.style.background = '#e8f5e8';
        setTimeout(() => {
            serviceCard.style.background = '';
        }, 500);
    }
}

function ajouterService() {
    console.log('🔄 Ajout d\'un nouveau service...');
    
    const listeServices = document.getElementById('liste-services-nouvelle');
    if (!listeServices) {
        console.error('❌ Élément liste-services-nouvelle non trouvé');
        return;
    }

    const nouveauServiceHTML = `
        <div class="service-item card border mb-3">
            <div class="card-body">
                <div class="row g-2 align-items-center">
                    <div class="col-md-5">
                        <input type="text" class="form-control" placeholder="Nom du service" 
                               name="service-nom" required>
                    </div>
                    <div class="col-md-2">
                        <input type="number" class="form-control" placeholder="Qté" 
                               name="service-quantite" value="1" min="1" required>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" name="service-unite" required>
                            <option value="unité">unité</option>
                            <option value="heure">heure</option>
                            <option value="jour">jour</option>
                            <option value="page">page</option>
                            <option value="mot">mot</option>
                            <option value="projet">projet</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <input type="number" class="form-control" placeholder="Prix (Ar)" 
                               name="service-prix" min="0" step="100" required>
                    </div>
                    <div class="col-md-1">
                        <button type="button" class="btn btn-danger btn-sm" onclick="supprimerService(this)" 
                                title="Supprimer ce service">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    listeServices.insertAdjacentHTML('beforeend', nouveauServiceHTML);
    
    // Réattacher les écouteurs d'événements pour le nouveau service
    attacherEcouteursNouveauService(listeServices.lastElementChild);
    
    // Recalculer le total
    calculerTotalNouvelleCommande();
    
    console.log('✅ Nouveau service ajouté');
}

function attacherEcouteursNouveauService(serviceElement) {
    const inputsPrix = serviceElement.querySelectorAll('input[name="service-prix"]');
    const inputsQuantite = serviceElement.querySelectorAll('input[name="service-quantite"]');
    const selectsUnite = serviceElement.querySelectorAll('select[name="service-unite"]');
    
    inputsPrix.forEach(input => {
        input.addEventListener('input', calculerTotalNouvelleCommande);
    });
    
    inputsQuantite.forEach(input => {
        input.addEventListener('input', calculerTotalNouvelleCommande);
    });
    
    selectsUnite.forEach(select => {
        select.addEventListener('change', calculerTotalNouvelleCommande);
    });
}

function supprimerService(bouton) {
    const serviceItem = bouton.closest('.service-item');
    if (serviceItem) {
        serviceItem.remove();
        calculerTotalNouvelleCommande();
        console.log('🗑️ Service supprimé');
    }
}

function initialiserEcouteursNouvelleCommande() {
    console.log('🔧 Initialisation des écouteurs nouvelle commande...');
    
    // Attacher les écouteurs aux services existants
    document.querySelectorAll('.service-item').forEach(service => {
        attacherEcouteursNouveauService(service);
    });

    // Écouteur global pour les nouveaux services
    document.addEventListener('click', function(e) {
        if (e.target.closest('.service-item') && e.target.matches('button[onclick*="supprimerService"]')) {
            const bouton = e.target.closest('button');
            supprimerService(bouton);
        }
    });

    // Écouteurs pour les changements en temps réel
    document.addEventListener('input', function(e) {
        if (e.target.matches('input[name="service-prix"], input[name="service-quantite"]')) {
            calculerTotalNouvelleCommande();
        }
    });

    document.addEventListener('change', function(e) {
        if (e.target.matches('select[name="service-unite"]')) {
            calculerTotalNouvelleCommande();
        }
    });
    
    console.log('✅ Écouteurs initialisés');
}

function calculerTotalNouvelleCommande() {
    console.log('🧮 Calcul du total...');
    
    let total = 0;
    let nombreServices = 0;
    
    const servicesElements = document.querySelectorAll('#liste-services-nouvelle .service-item');
    
    servicesElements.forEach((item, index) => {
        const inputNom = item.querySelector('input[name="service-nom"]');
        const inputQuantite = item.querySelector('input[name="service-quantite"]');
        const inputPrix = item.querySelector('input[name="service-prix"]');
        
        if (inputNom && inputQuantite && inputPrix) {
            const quantite = parseInt(inputQuantite.value) || 0;
            const prix = parseInt(inputPrix.value) || 0;
            
            console.log(`Service ${index + 1}: ${quantite} x ${prix} = ${quantite * prix}`);
            
            if (quantite > 0 && prix > 0) {
                total += quantite * prix;
                nombreServices++;
            }
        }
    });
    
    // Mettre à jour l'affichage
    const totalElement = document.getElementById('nouveau-total');
    const servicesElement = document.getElementById('nombre-services');
    
    if (totalElement) {
        totalElement.value = total.toLocaleString('fr-FR') + ' Ar';
        totalElement.className = `form-control fw-bold ${total > 0 ? 'bg-success text-white' : 'bg-light text-dark'}`;
    }
    
    if (servicesElement) {
        const texteServices = nombreServices === 0 ? 'Aucun service' : 
                             nombreServices === 1 ? '1 service' : 
                             `${nombreServices} services`;
        servicesElement.value = texteServices;
        servicesElement.className = `form-control ${nombreServices > 0 ? 'bg-info text-white' : 'bg-light text-dark'}`;
    }
    
    console.log(`📊 Total calculé: ${total} Ar, ${nombreServices} services`);
    return total;
}

function debugServices() {
    console.log('=== DÉBOGAGE SERVICES ===');
    const services = document.querySelectorAll('#liste-services-nouvelle .service-item');
    console.log(`Nombre de services: ${services.length}`);
    
    services.forEach((service, index) => {
        const nom = service.querySelector('input[name="service-nom"]')?.value;
        const quantite = service.querySelector('input[name="service-quantite"]')?.value;
        const prix = service.querySelector('input[name="service-prix"]')?.value;
        const unite = service.querySelector('select[name="service-unite"]')?.value;
        console.log(`Service ${index + 1}: "${nom}" - ${quantite} ${unite} x ${prix} Ar`);
    });
    
    const total = calculerTotalNouvelleCommande();
    console.log(`Total: ${total} Ar`);
    console.log('========================');
}

// ===== SAUVEGARDE DE LA NOUVELLE COMMANDE =====
function sauvegarderNouvelleCommande(referenceDevis, referenceFacture) {
    console.log('💾 Sauvegarde nouvelle commande...');
    
    const client = document.getElementById('nouveau-client')?.value.trim();
    const contact = document.getElementById('nouveau-contact')?.value.trim();
    const duree = document.getElementById('nouvelle-duree')?.value;
    
    // Validation
    if (!client || !contact) {
        showNotification('Veuillez remplir le client et le contact', 'error');
        return;
    }
    
    // Récupérer les services
    const services = [];
    document.querySelectorAll('#liste-services-nouvelle .service-item').forEach((item, index) => {
        const nom = item.querySelector('input[name="service-nom"]')?.value.trim();
        const quantite = parseInt(item.querySelector('input[name="service-quantite"]')?.value) || 1;
        const unite = item.querySelector('select[name="service-unite"]')?.value;
        const prixUnitaire = parseInt(item.querySelector('input[name="service-prix"]')?.value) || 0;
        
        if (nom && prixUnitaire > 0) {
            services.push({
                nom: nom,
                quantite: quantite,
                unite: unite,
                prixUnitaire: prixUnitaire,
                sousTotal: quantite * prixUnitaire
            });
            console.log(`✅ Service ${index + 1}: ${nom} - ${quantite} ${unite} - ${prixUnitaire} Ar`);
        }
    });
    
    if (services.length === 0) {
        showNotification('Veuillez ajouter au moins un service valide', 'error');
        return;
    }
    
    const total = services.reduce((sum, service) => sum + service.sousTotal, 0);
    
    // Créer la commande
    const nouvelleCommande = {
        id: Date.now(),
        reference: referenceDevis,
        referenceFacture: referenceFacture,
        client: client,
        contact: contact,
        services: services,
        total: total.toLocaleString('fr-FR') + ' Ar',
        statut: 'devis',
        paiement: 'en_attente',
        validation: 'en_cours',
        dateCreation: new Date().toISOString(),
        duree: duree,
        typeDocument: 'Devis',
        options: {
            notification: document.getElementById('option-notification')?.checked || true,
            rappel: document.getElementById('option-rappel')?.checked || true
        }
    };
    
    console.log('📦 Commande à sauvegarder:', nouvelleCommande);
    
    // Sauvegarder via DataManager
    const resultat = dataManager.ajouterCommande(nouvelleCommande);
    
    if (resultat && resultat.success) {
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalNouvelleCommande'));
        if (modal) modal.hide();
        
        // Afficher notification
        showNotification(`✅ Commande créée : ${referenceDevis}`, 'success');
        
        // Mettre à jour les données
        actualiserDonnees();
        
        // Générer le devis PDF automatiquement
        setTimeout(() => {
            genererDevisDashboard(nouvelleCommande.id);
        }, 1000);
        
    } else {
        showNotification('Erreur lors de la sauvegarde de la commande', 'error');
    }
}

// ===== SERVICES RAPIDES PRÉDÉFINIS =====

function initialiserServicesRapides() {
    const servicesRapides = [
        { nom: "Saisie document", prix: 700, unite: "page", icone: "📄" },
        { nom: "Mise en forme", prix: 400, unite: "page", icone: "✏️" },
        { nom: "Tableau", prix: 1000, unite: "tableau", icone: "📊" },
        { nom: "Figure complexe", prix: 1500, unite: "figure", icone: "🖼️" },
        { nom: "Graphique", prix: 1500, unite: "élément", icone: "📈" },
        { nom: "Logo", prix: 50000, unite: "logo", icone: "🎨" },
        { nom: "Affiche Standard", prix: 20000, unite: "affiche", icone: "🖼️" },
        { nom: "Vectorisation", prix: 25000, unite: "image", icone: "✏️" }
    ];

    const container = document.getElementById('services-rapides');
    if (!container) return;

    container.innerHTML = servicesRapides.map(service => `
        <div class="col-6 col-md-3">
            <div class="service-rapide-card" 
                 onclick="ajouterServiceRapide('${service.nom}', ${service.prix}, '${service.unite}')"
                 title="Ajouter ${service.nom} - ${service.prix.toLocaleString()} Ar/${service.unite}">
                <div class="service-rapide-icon">${service.icone}</div>
                <div class="service-rapide-name">${service.nom}</div>
                <div class="service-rapide-price">${service.prix.toLocaleString()} Ar</div>
            </div>
        </div>
    `).join('');
}

// ===== FONCTION AJOUTER SERVICE CORRIGÉE =====
function ajouterService() {
    const listeServices = document.getElementById('liste-services-nouvelle');
    if (!listeServices) {
        console.error('Élément liste-services-nouvelle non trouvé');
        return;
    }

    const nouveauServiceHTML = `
        <div class="service-item card border mb-3">
            <div class="card-body">
                <div class="row g-2 align-items-center">
                    <div class="col-md-5">
                        <input type="text" class="form-control" placeholder="Nom du service" 
                               name="service-nom" required>
                    </div>
                    <div class="col-md-2">
                        <input type="number" class="form-control" placeholder="Qté" 
                               name="service-quantite" value="1" min="1" required>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" name="service-unite" required>
                            <option value="unité">unité</option>
                            <option value="heure">heure</option>
                            <option value="jour">jour</option>
                            <option value="page">page</option>
                            <option value="mot">mot</option>
                            <option value="projet">projet</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <input type="number" class="form-control" placeholder="Prix (Ar)" 
                               name="service-prix" min="0" step="100" required>
                    </div>
                    <div class="col-md-1">
                        <button type="button" class="btn btn-danger btn-sm" onclick="supprimerService(this)" 
                                title="Supprimer ce service">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    listeServices.insertAdjacentHTML('beforeend', nouveauServiceHTML);
    
    // Réattacher les écouteurs d'événements pour le nouveau service
    attacherEcouteursNouveauService(listeServices.lastElementChild);
    
    // Recalculer le total
    calculerTotalNouvelleCommande();
    
    console.log('✅ Nouveau service ajouté');
}

// ===== FONCTION POUR ATTACHER LES ÉCOUTEURS =====
function attacherEcouteursNouveauService(serviceElement) {
    const inputsPrix = serviceElement.querySelectorAll('input[name="service-prix"]');
    const inputsQuantite = serviceElement.querySelectorAll('input[name="service-quantite"]');
    const selectsUnite = serviceElement.querySelectorAll('select[name="service-unite"]');
    
    inputsPrix.forEach(input => {
        input.addEventListener('input', calculerTotalNouvelleCommande);
    });
    
    inputsQuantite.forEach(input => {
        input.addEventListener('input', calculerTotalNouvelleCommande);
    });
    
    selectsUnite.forEach(select => {
        select.addEventListener('change', calculerTotalNouvelleCommande);
    });
}

// ===== FONCTION SUPPRIMER SERVICE CORRIGÉE =====
function supprimerService(bouton) {
    const serviceItem = bouton.closest('.service-item');
    if (serviceItem) {
        serviceItem.remove();
        calculerTotalNouvelleCommande();
        console.log('🗑️ Service supprimé');
    }
}

// ===== INITIALISATION DES ÉCOUTEURS AU CHARGEMENT =====
function initialiserEcouteursNouvelleCommande() {
    console.log('🔧 Initialisation des écouteurs nouvelle commande...');
    
    // Attacher les écouteurs aux services existants
    document.querySelectorAll('.service-item').forEach(service => {
        attacherEcouteursNouveauService(service);
    });

    // Écouteur global pour les nouveaux services
    document.addEventListener('click', function(e) {
        if (e.target.closest('.service-item') && e.target.matches('button[onclick*="supprimerService"]')) {
            const bouton = e.target.closest('button');
            supprimerService(bouton);
        }
    });

    // Écouteurs pour les changements en temps réel
    document.addEventListener('input', function(e) {
        if (e.target.matches('input[name="service-prix"], input[name="service-quantite"]')) {
            calculerTotalNouvelleCommande();
        }
    });

    document.addEventListener('change', function(e) {
        if (e.target.matches('select[name="service-unite"]')) {
            calculerTotalNouvelleCommande();
        }
    });
    
    console.log('✅ Écouteurs initialisés');
}

// ===== FONCTION CALCUL TOTAL AMÉLIORÉE =====
function calculerTotalNouvelleCommande() {
    console.log('🧮 Calcul du total...');
    
    let total = 0;
    let nombreServices = 0;
    
    const servicesElements = document.querySelectorAll('#liste-services-nouvelle .service-item');
    
    servicesElements.forEach((item, index) => {
        const inputNom = item.querySelector('input[name="service-nom"]');
        const inputQuantite = item.querySelector('input[name="service-quantite"]');
        const inputPrix = item.querySelector('input[name="service-prix"]');
        
        if (inputNom && inputQuantite && inputPrix) {
            const quantite = parseInt(inputQuantite.value) || 0;
            const prix = parseInt(inputPrix.value) || 0;
            
            console.log(`Service ${index + 1}: ${quantite} x ${prix} = ${quantite * prix}`);
            
            if (quantite > 0 && prix > 0) {
                total += quantite * prix;
                nombreServices++;
            }
        }
    });
    
    // Mettre à jour l'affichage
    const totalElement = document.getElementById('nouveau-total');
    const servicesElement = document.getElementById('nombre-services');
    
    if (totalElement) {
        totalElement.value = total.toLocaleString('fr-FR') + ' Ar';
        totalElement.className = `form-control fw-bold ${total > 0 ? 'bg-success text-white' : 'bg-light text-dark'}`;
    }
    
    if (servicesElement) {
        const texteServices = nombreServices === 0 ? 'Aucun service' : 
                             nombreServices === 1 ? '1 service' : 
                             `${nombreServices} services`;
        servicesElement.value = texteServices;
        servicesElement.className = `form-control ${nombreServices > 0 ? 'bg-info text-white' : 'bg-light text-dark'}`;
    }
    
    console.log(`📊 Total calculé: ${total} Ar, ${nombreServices} services`);
    return total;
}

// ===== ÉCOUTEURS NOUVELLE COMMANDE =====

function initialiserEcouteursNouvelleCommande() {
    // Écouteurs pour les changements de prix/quantité
    document.addEventListener('input', function(e) {
        if (e.target.matches('input[name="service-prix"], input[name="service-quantite"]')) {
            calculerTotalNouvelleCommande();
        }
    });

    // Écouteur pour les changements de sélecteur
    document.addEventListener('change', function(e) {
        if (e.target.matches('select[name="service-unite"]')) {
            calculerTotalNouvelleCommande();
        }
    });

    // Écouteur pour la suppression de services
    document.addEventListener('click', function(e) {
        if (e.target.closest('button') && e.target.closest('button').onclick && 
            e.target.closest('button').onclick.toString().includes('supprimerService')) {
            setTimeout(calculerTotalNouvelleCommande, 100);
        }
    });
}

// ===== CALCUL TOTAL AMÉLIORÉ =====

function calculerTotalNouvelleCommande() {
    let total = 0;
    let nombreServices = 0;
    
    document.querySelectorAll('.service-item').forEach(item => {
        const quantite = parseInt(item.querySelector('input[name="service-quantite"]').value) || 0;
        const prix = parseInt(item.querySelector('input[name="service-prix"]').value) || 0;
        
        if (quantite > 0 && prix > 0) {
            total += quantite * prix;
            nombreServices++;
        }
    });
    
    // Mettre à jour l'affichage
    const totalElement = document.getElementById('nouveau-total');
    const servicesElement = document.getElementById('nombre-services');
    
    if (totalElement) {
        totalElement.value = total.toLocaleString('fr-FR') + ' Ar';
        totalElement.className = `form-control fw-bold ${total > 0 ? 'bg-success text-white' : 'bg-light'}`;
    }
    
    if (servicesElement) {
        const texteServices = nombreServices === 0 ? 'Aucun service' : 
                             nombreServices === 1 ? '1 service' : 
                             `${nombreServices} services`;
        servicesElement.value = texteServices;
        servicesElement.className = `form-control ${nombreServices > 0 ? 'bg-info text-white' : 'bg-light'}`;
    }
    
    return total;
}

// ===== SAUVEGARDE NOUVELLE COMMANDE =====

function sauvegarderNouvelleCommande(referenceDevis, referenceFacture) {
    const client = document.getElementById('nouveau-client').value.trim();
    const contact = document.getElementById('nouveau-contact').value.trim();
    const duree = document.getElementById('nouvelle-duree').value;
    
    // Validation
    if (!client || !contact) {
        afficherAlerteDashboard('Veuillez remplir le client et le contact', 'error');
        return;
    }
    
    // Récupérer les services
    const services = [];
    document.querySelectorAll('.service-item').forEach(item => {
        const nom = item.querySelector('input[name="service-nom"]').value.trim();
        const quantite = parseInt(item.querySelector('input[name="service-quantite"]').value) || 1;
        const unite = item.querySelector('select[name="service-unite"]').value;
        const prixUnitaire = parseInt(item.querySelector('input[name="service-prix"]').value) || 0;
        
        if (nom && prixUnitaire > 0) {
            services.push({
                nom: nom,
                quantite: quantite,
                unite: unite,
                prixUnitaire: prixUnitaire,
                sousTotal: quantite * prixUnitaire
            });
        }
    });
    
    if (services.length === 0) {
        afficherAlerteDashboard('Veuillez ajouter au moins un service valide', 'error');
        return;
    }
    
    const total = services.reduce((sum, service) => sum + service.sousTotal, 0);
    
    // Créer la commande avec le système unifié
    const nouvelleCommande = {
        id: Date.now(),
        reference: referenceDevis,
        referenceFacture: referenceFacture,
        client: client,
        contact: contact,
        services: services,
        total: total.toLocaleString('fr-FR') + ' Ar',
        statut: 'devis',
        paiement: 'en_attente',
        validation: 'en_cours',
        dateCreation: new Date().toISOString(),
        duree: duree,
        typeDocument: 'Devis',
        options: {
            notification: document.getElementById('option-notification')?.checked || true,
            rappel: document.getElementById('option-rappel')?.checked || true
        }
    };
    
    // Sauvegarder via DataManager
    const resultat = dataManager.ajouterCommande(nouvelleCommande);
    
    if (resultat && resultat.success) {
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalNouvelleCommande'));
        if (modal) modal.hide();
        
        // Afficher notification
        showNotification(`✅ Commande créée : ${referenceDevis}`, 'success');
        
        // Mettre à jour les données
        actualiserDonnees();
        
        // Mettre à jour le badge
        creerBadgeStatistiquesUnifie();
        
        // Générer le devis PDF automatiquement
        setTimeout(() => {
            genererDevisDashboard(nouvelleCommande.id);
        }, 1000);
        
    } else {
        afficherAlerteDashboard('Erreur lors de la sauvegarde de la commande', 'error');
    }
}

// ===== ALERTE DASHBOARD =====

function afficherAlerteDashboard(message, type = 'info') {
    showNotification(message, type);
}

function ajouterService() {
    const listeServices = document.getElementById('liste-services-nouvelle');
    const nouveauService = `
        <div class="service-item border p-3 mb-2">
            <div class="row">
                <div class="col-md-5">
                    <input type="text" class="form-control" placeholder="Nom du service" name="service-nom">
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control" placeholder="Qté" name="service-quantite" value="1" min="1">
                </div>
                <div class="col-md-2">
                    <select class="form-control" name="service-unite">
                        <option value="unité">unité</option>
                        <option value="heure">heure</option>
                        <option value="jour">jour</option>
                        <option value="page">page</option>
                        <option value="mot">mot</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control" placeholder="Prix" name="service-prix" min="0">
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-danger btn-sm" onclick="supprimerService(this)">🗑️</button>
                </div>
            </div>
        </div>
    `;
    listeServices.insertAdjacentHTML('beforeend', nouveauService);
    
    // Réattacher les écouteurs d'événements
    document.querySelectorAll('input[name="service-prix"], input[name="service-quantite"]').forEach(input => {
        input.addEventListener('input', calculerTotalNouvelleCommande);
    });
}

function supprimerService(bouton) {
    bouton.closest('.service-item').remove();
    calculerTotalNouvelleCommande();
}

function calculerTotalNouvelleCommande() {
    let total = 0;
    
    document.querySelectorAll('.service-item').forEach(item => {
        const quantite = parseInt(item.querySelector('input[name="service-quantite"]').value) || 0;
        const prix = parseInt(item.querySelector('input[name="service-prix"]').value) || 0;
        total += quantite * prix;
    });
    
    document.getElementById('nouveau-total').value = total.toLocaleString('fr-MG') + ' Ar';
}

function sauvegarderNouvelleCommande() {
    const client = document.getElementById('nouveau-client').value.trim();
    const contact = document.getElementById('nouveau-contact').value.trim();
    const reference = document.getElementById('nouvelle-reference').value;
    const duree = document.getElementById('nouvelle-duree').value.trim();
    
    if (!client || !contact) {
        showNotification('Veuillez remplir le client et le contact', 'error');
        return;
    }
    
    // Récupérer les services
    const services = [];
    document.querySelectorAll('.service-item').forEach(item => {
        const nom = item.querySelector('input[name="service-nom"]').value.trim();
        const quantite = parseInt(item.querySelector('input[name="service-quantite"]').value) || 1;
        const unite = item.querySelector('select[name="service-unite"]').value;
        const prixUnitaire = parseInt(item.querySelector('input[name="service-prix"]').value) || 0;
        
        if (nom) {
            services.push({
                nom: nom,
                quantite: quantite,
                unite: unite,
                prixUnitaire: prixUnitaire,
                sousTotal: quantite * prixUnitaire
            });
        }
    });
    
    if (services.length === 0) {
        showNotification('Veuillez ajouter au moins un service', 'error');
        return;
    }
    
    const total = services.reduce((sum, service) => sum + service.sousTotal, 0);
    
    const nouvelleCommande = {
        id: Date.now(),
        reference: reference,
        client: client,
        contact: contact,
        services: services,
        total: total.toLocaleString('fr-MG') + ' Ar',
        statut: 'devis',
        paiement: 'en_attente',
        validation: 'en_cours',
        dateCreation: new Date().toISOString(),
        duree: duree || 'À confirmer'
    };
    
    // Sauvegarder
    const commandes = dataManager.getCommandes();
    commandes.push(nouvelleCommande);
    localStorage.setItem('msn_commandes', JSON.stringify(commandes));
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalNouvelleCommande'));
    modal.hide();
    
    showNotification('Nouvelle commande créée avec succès', 'success');
    actualiserDonnees();
}

function supprimerCommande(idCommande) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
        return;
    }
    
    const commandes = dataManager.getCommandes();
    const commandesFiltrees = commandes.filter(c => c.id !== idCommande);
    
    localStorage.setItem('msn_commandes', JSON.stringify(commandesFiltrees));
    
    showNotification('Commande supprimée avec succès', 'success');
    actualiserDonnees();
}

function modifierCommande(idCommande) {
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id === idCommande);
    
    if (!commande) {
        showNotification('Commande non trouvée', 'error');
        return;
    }
    
    const modalHTML = `
        <div class="modal fade" id="modalModifierCommande" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">✏️ Modifier Commande - ${commande.reference}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="formModifierCommande">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Client *</label>
                                    <input type="text" class="form-control" id="modifier-client" value="${commande.client}" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Contact *</label>
                                    <input type="text" class="form-control" id="modifier-contact" value="${commande.contact}" required>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Référence</label>
                                <input type="text" class="form-control" id="modifier-reference" value="${commande.reference}" readonly>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Durée estimée</label>
                                <input type="text" class="form-control" id="modifier-duree" value="${commande.duree || ''}">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Services *</label>
                                <div id="liste-services-modifier">
                                    ${commande.services.map((service, index) => `
                                        <div class="service-item border p-3 mb-2">
                                            <div class="row">
                                                <div class="col-md-5">
                                                    <input type="text" class="form-control" name="service-nom" value="${service.nom}">
                                                </div>
                                                <div class="col-md-2">
                                                    <input type="number" class="form-control" name="service-quantite" value="${service.quantite}" min="1">
                                                </div>
                                                <div class="col-md-2">
                                                    <select class="form-control" name="service-unite">
                                                        <option value="unité" ${service.unite === 'unité' ? 'selected' : ''}>unité</option>
                                                        <option value="heure" ${service.unite === 'heure' ? 'selected' : ''}>heure</option>
                                                        <option value="jour" ${service.unite === 'jour' ? 'selected' : ''}>jour</option>
                                                        <option value="page" ${service.unite === 'page' ? 'selected' : ''}>page</option>
                                                        <option value="mot" ${service.unite === 'mot' ? 'selected' : ''}>mot</option>
                                                    </select>
                                                </div>
                                                <div class="col-md-2">
                                                    <input type="number" class="form-control" name="service-prix" value="${service.prixUnitaire}" min="0">
                                                </div>
                                                <div class="col-md-1">
                                                    <button type="button" class="btn btn-danger btn-sm" onclick="supprimerService(this)">🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-primary" onclick="ajouterServiceModifier()">
                                    ➕ Ajouter un service
                                </button>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Total</label>
                                <input type="text" class="form-control" id="modifier-total" value="${commande.total}" readonly>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-warning" onclick="sauvegarderModificationCommande(${idCommande})">💾 Sauvegarder</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('modalModifierCommande');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('modalModifierCommande'));
    modal.show();
    
    // Écouter les changements pour recalculer le total
    document.querySelectorAll('input[name="service-prix"], input[name="service-quantite"]').forEach(input => {
        input.addEventListener('input', calculerTotalModification);
    });
}

function ajouterServiceModifier() {
    const listeServices = document.getElementById('liste-services-modifier');
    const nouveauService = `
        <div class="service-item border p-3 mb-2">
            <div class="row">
                <div class="col-md-5">
                    <input type="text" class="form-control" placeholder="Nom du service" name="service-nom">
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control" placeholder="Qté" name="service-quantite" value="1" min="1">
                </div>
                <div class="col-md-2">
                    <select class="form-control" name="service-unite">
                        <option value="unité">unité</option>
                        <option value="heure">heure</option>
                        <option value="jour">jour</option>
                        <option value="page">page</option>
                        <option value="mot">mot</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control" placeholder="Prix" name="service-prix" min="0">
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-danger btn-sm" onclick="supprimerService(this)">🗑️</button>
                </div>
            </div>
        </div>
    `;
    listeServices.insertAdjacentHTML('beforeend', nouveauService);
    
    document.querySelectorAll('input[name="service-prix"], input[name="service-quantite"]').forEach(input => {
        input.addEventListener('input', calculerTotalModification);
    });
}

function calculerTotalModification() {
    let total = 0;
    
    document.querySelectorAll('#liste-services-modifier .service-item').forEach(item => {
        const quantite = parseInt(item.querySelector('input[name="service-quantite"]').value) || 0;
        const prix = parseInt(item.querySelector('input[name="service-prix"]').value) || 0;
        total += quantite * prix;
    });
    
    document.getElementById('modifier-total').value = total.toLocaleString('fr-MG') + ' Ar';
}

function sauvegarderModificationCommande(idCommande) {
    const client = document.getElementById('modifier-client').value.trim();
    const contact = document.getElementById('modifier-contact').value.trim();
    const duree = document.getElementById('modifier-duree').value.trim();
    
    if (!client || !contact) {
        showNotification('Veuillez remplir le client et le contact', 'error');
        return;
    }
    
    // Récupérer les services
    const services = [];
    document.querySelectorAll('#liste-services-modifier .service-item').forEach(item => {
        const nom = item.querySelector('input[name="service-nom"]').value.trim();
        const quantite = parseInt(item.querySelector('input[name="service-quantite"]').value) || 1;
        const unite = item.querySelector('select[name="service-unite"]').value;
        const prixUnitaire = parseInt(item.querySelector('input[name="service-prix"]').value) || 0;
        
        if (nom) {
            services.push({
                nom: nom,
                quantite: quantite,
                unite: unite,
                prixUnitaire: prixUnitaire,
                sousTotal: quantite * prixUnitaire
            });
        }
    });
    
    if (services.length === 0) {
        showNotification('Veuillez ajouter au moins un service', 'error');
        return;
    }
    
    const total = services.reduce((sum, service) => sum + service.sousTotal, 0);
    
    // Mettre à jour la commande
    const commandes = dataManager.getCommandes();
    const commandeIndex = commandes.findIndex(c => c.id === idCommande);
    
    if (commandeIndex !== -1) {
        commandes[commandeIndex] = {
            ...commandes[commandeIndex],
            client: client,
            contact: contact,
            services: services,
            total: total.toLocaleString('fr-MG') + ' Ar',
            duree: duree || commandes[commandeIndex].duree
        };
        
        localStorage.setItem('msn_commandes', JSON.stringify(commandes));
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalModifierCommande'));
        modal.hide();
        
        showNotification('Commande modifiée avec succès', 'success');
        actualiserDonnees();
    }
}
// ===== SYSTÈME DE RÉFÉRENCE UNIFIÉ =====

class ReferenceManager {
    constructor() {
        this.cle = 'msn_reference_manager';
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
                    references: {},
                    dateDerniereSauvegarde: new Date().toISOString()
                };
                this.sauvegarder();
            }
        } catch (error) {
            console.error('Erreur chargement référence:', error);
            this.donnees = {
                dernierNumero: 0,
                references: {},
                dateDerniereSauvegarde: new Date().toISOString()
            };
        }
    }

    sauvegarder() {
        try {
            this.donnees.dateDerniereSauvegarde = new Date().toISOString();
            localStorage.setItem(this.cle, JSON.stringify(this.donnees));
        } catch (error) {
            console.error('Erreur sauvegarde référence:', error);
        }
    }

    genererReference(type = 'DEV') {
        const maintenant = new Date();
    const annee = maintenant.getFullYear().toString().slice(-2);
    const mois = (maintenant.getMonth() + 1).toString().padStart(2, '0');
    const jour = maintenant.getDate().toString().padStart(2, '0');
    
    // Récupérer le dernier numéro depuis le localStorage
    let compteur = JSON.parse(localStorage.getItem('msn_compteur_references') || '{}');
    const aujourdhui = `${annee}${mois}${jour}`;
    
    if (!compteur[aujourdhui]) {
        compteur[aujourdhui] = 1;
    } else {
        compteur[aujourdhui]++;
    }

    localStorage.setItem('msn_compteur_references', JSON.stringify(compteur));

    const sequence = compteur[aujourdhui].toString().padStart(3, '0');
    const reference = `${type}-${annee}${mois}${jour}-${sequence}`;

    this.sauvegarder();
    return reference;
}

    genererReferenceFacture() {
        return this.genererReference('FAC');
    }

    genererReferenceDevis() {
        return this.genererReference('DEV');
    }

    getNumeroActuel() {
        return this.donnees.dernierNumero;
    }

    getStatistiquesReferences() {
        const references = Object.values(this.donnees.references);
        return {
            total: references.length,
            devis: references.filter(r => r.type === 'DEV').length,
            factures: references.filter(r => r.type === 'FAC').length,
            dernierNumero: this.donnees.dernierNumero
        };
    }
}

// Initialisation globale
const referenceManager = new ReferenceManager();

// ===== CRÉATION COMMANDE AVEC RÉFÉRENCE UNIFIÉE =====

function creerNouvelleCommande(donneesCommande) {
    const reference = referenceManager.genererReferenceDevis();
    
    const nouvelleCommande = {
        id: Date.now(),
        reference: reference,
        client: donneesCommande.client,
        contact: donneesCommande.contact,
        services: donneesCommande.services,
        total: donneesCommande.total,
        statut: 'devis',
        paiement: 'en_attente',
        validation: 'en_cours',
        dateCreation: new Date().toISOString(),
        duree: donneesCommande.duree || '3 jours',
        // Champs supplémentaires pour compatibilité
        referenceFacture: referenceManager.genererReferenceFacture(),
        typeDocument: 'Devis'
    };

    // Sauvegarder
    const commandes = dataManager.getCommandes();
    commandes.push(nouvelleCommande);
    localStorage.setItem('msn_commandes', JSON.stringify(commandes));

    console.log('✅ Nouvelle commande créée:', nouvelleCommande);
    return nouvelleCommande;
}

function convertirDevisEnFacture(idCommande, donneesPaiement = {}) {
    const commandes = dataManager.getCommandes();
    const commandeIndex = commandes.findIndex(c => c.id === idCommande);
    
    if (commandeIndex === -1) {
        throw new Error('Commande non trouvée');
    }

    const commande = commandes[commandeIndex];
    
    // Générer une nouvelle référence facture
    const referenceFacture = referenceManager.genererReferenceFacture();
    
    // Mettre à jour la commande
    commandes[commandeIndex] = {
        ...commande,
        referenceFacture: referenceFacture,
        statut: 'traitement',
        paiement: donneesPaiement.statutPaiement || 'en_attente',
        referencePaiement: donneesPaiement.referencePaiement || '',
        typeDocument: 'Facture',
        dateFacturation: new Date().toISOString()
    };

    localStorage.setItem('msn_commandes', JSON.stringify(commandes));
    
    console.log('✅ Devis converti en facture:', commandes[commandeIndex]);
    return commandes[commandeIndex];
}

// ===== GÉNÉRATION DEVIS DASHBOARD =====

function genererDevisDashboard(commandeId) {
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id === commandeId);
    
    if (!commande) {
        showNotification('Commande non trouvée', 'error');
        return;
    }

    // Préparer les données pour le template
    const devisData = {
        reference: commande.reference,
        client: commande.client,
        contact: commande.contact,
        services: commande.services,
        total: commande.total,
        duree: commande.duree,
        date: new Date(commande.dateCreation).toLocaleDateString('fr-FR'),
        typeDocument: 'Devis'
    };

    // Générer le PDF
    genererPDFDevis(devisData);
}

function genererFactureDashboard(commandeId, donneesPaiement = {}) {
    const commandes = dataManager.getCommandes();
    const commande = commandes.find(c => c.id === commandeId);
    
    if (!commande) {
        showNotification('Commande non trouvée', 'error');
        return;
    }

    // Convertir en facture si ce n'est pas déjà fait
    let commandeFacture = commande;
    if (!commande.referenceFacture) {
        commandeFacture = convertirDevisEnFacture(commandeId, donneesPaiement);
    }

    // Préparer les données pour le template
    const factureData = {
        reference: commandeFacture.referenceFacture,
        referenceDevis: commandeFacture.reference,
        client: commandeFacture.client,
        contact: commandeFacture.contact,
        services: commandeFacture.services,
        total: commandeFacture.total,
        duree: commandeFacture.duree,
        date: new Date(commandeFacture.dateCreation).toLocaleDateString('fr-FR'),
        statutPaiement: commandeFacture.paiement,
        referencePaiement: commandeFacture.referencePaiement,
        typeDocument: 'Facture'
    };

    // Générer le PDF
    genererPDFFacture(factureData);
}

// ===== BADGE STATISTIQUES UNIFIÉ =====

function creerBadgeStatistiquesUnifie() {
    let badge = document.getElementById('badge-statistiques-unifie');
    
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'badge-statistiques-unifie';
        badge.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 1000;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            border: 2px solid white;
            animation: pulse 2s infinite;
            min-width: 120px;
            text-align: center;
        `;
        document.body.appendChild(badge);
    }
    
    // Récupérer les statistiques
    const statsCommandes = dataManager.getStatistiques();
    const statsReferences = referenceManager.getStatistiquesReferences();
    
    badge.innerHTML = `
        <div>📊 ${statsCommandes.totalCommandes} cmd</div>
        <div style="font-size: 12px; opacity: 0.9;">#${statsReferences.dernierNumero}</div>
    `;
    
    badge.title = `Commandes: ${statsCommandes.totalCommandes}
Devis: ${statsReferences.devis}
Factures: ${statsReferences.factures}
Dernier numéro: ${statsReferences.dernierNumero}
CA: ${statsCommandes.caMensuel.toLocaleString()} Ar

Cliquez pour plus d'infos`;
    
    badge.onclick = afficherStatistiquesCompletes;
}

function afficherStatistiquesCompletes() {
    const statsCommandes = dataManager.getStatistiques();
    const statsReferences = referenceManager.getStatistiquesReferences();
    const commandes = dataManager.getCommandes();
    
    const statsParStatut = {
        devis: commandes.filter(c => c.statut === 'devis').length,
        traitement: commandes.filter(c => c.statut === 'traitement').length,
        termine: commandes.filter(c => c.statut === 'termine').length
    };
    
    const statsPaiement = {
        paye: commandes.filter(c => c.paiement === 'paye').length,
        en_attente: commandes.filter(c => c.paiement === 'en_attente').length
    };
    
    const message = `📊 STATISTIQUES COMPLÈTES

📋 COMMANDES:
• Total: ${statsCommandes.totalCommandes}
• Devis: ${statsParStatut.devis}
• En traitement: ${statsParStatut.traitement}
• Terminées: ${statsParStatut.termine}

💰 FINANCES:
• CA mensuel: ${statsCommandes.caMensuel.toLocaleString('fr-FR')} Ar
• Paiements: ${statsPaiement.paye} payés / ${statsPaiement.en_attente} en attente

🔢 NUMÉROTATION:
• Dernier numéro: ${statsReferences.dernierNumero}
• Devis générés: ${statsReferences.devis}
• Factures générées: ${statsReferences.factures}

👥 CLIENTS:
• Clients uniques: ${statsCommandes.clientsUniques}

💾 SYSTÈME:
• Dernière sauvegarde: ${new Date().toLocaleString('fr-FR')}`;
    
    alert(message);
}

// Dans initialiserDashboard()
function initialiserDashboard() {
    afficherDate();
    chargerTableauDeBord();
    actualiserCompteurs();
    actualiserIndicateurNotifications();
    chargerNotificationsRecentes();
    
    // Remplacer l'ancien badge par le nouveau
    creerBadgeStatistiquesUnifie();
    
    // Nettoyer les données corrompues
    setTimeout(() => {
        nettoyerToutesLesDonneesCorrompues();
    }, 1000);
    
    // Actualiser toutes les 30 secondes
    setInterval(actualiserDonnees, 30000);
    
    console.log('✅ Dashboard initialisé avec système de référence unifié');
}
// ===== SYSTÈME DE SÉLECTION MULTIPLE AVEC PERSISTANCE =====
let commandesSelectionnees = new Set();

function initialiserSelectionCommandes() {
    console.log('🔄 Initialisation de la sélection multiple...');
    
    // Restaurer la sélection depuis le sessionStorage
    restaurerSelection();
    
    // Écouteur pour la case à cocher générale
    const selectAllCheckbox = document.getElementById('select-all-commandes');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function(e) {
            const checkboxes = document.querySelectorAll('.commande-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                const commandeId = parseInt(checkbox.dataset.id);
                if (e.target.checked) {
                    commandesSelectionnees.add(commandeId);
                } else {
                    commandesSelectionnees.delete(commandeId);
                }
            });
            sauvegarderSelection();
            actualiserActionsRapides();
        });
    }

    // Écouteur pour les cases individuelles
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('commande-checkbox')) {
            const commandeId = parseInt(e.target.dataset.id);
            
            if (e.target.checked) {
                commandesSelectionnees.add(commandeId);
            } else {
                commandesSelectionnees.delete(commandeId);
                // Désélectionner "tout sélectionner" si une case est décochée
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = false;
                }
            }
            
            sauvegarderSelection();
            actualiserActionsRapides();
        }
    });
    
    console.log('✅ Sélection multiple initialisée');
}

function restaurerSelection() {
    try {
        const savedSelection = sessionStorage.getItem('msn_commandes_selectionnees');
        if (savedSelection) {
            const ids = JSON.parse(savedSelection);
            commandesSelectionnees = new Set(ids);
            console.log(`📋 Sélection restaurée: ${commandesSelectionnees.size} commande(s)`);
        }
    } catch (error) {
        console.error('❌ Erreur restauration sélection:', error);
        commandesSelectionnees = new Set();
    }
}

function sauvegarderSelection() {
    try {
        const ids = Array.from(commandesSelectionnees);
        sessionStorage.setItem('msn_commandes_selectionnees', JSON.stringify(ids));
    } catch (error) {
        console.error('❌ Erreur sauvegarde sélection:', error);
    }
}

function actualiserActionsRapides() {
    const container = document.getElementById('actions-rapides-commandes');
    const count = commandesSelectionnees.size;
    
    if (count === 0) {
        if (container) container.innerHTML = '';
        return;
    }

    // Créer ou mettre à jour le container d'actions rapides
    if (!container) {
        const newContainer = document.createElement('div');
        newContainer.id = 'actions-rapides-commandes';
        newContainer.className = 'mb-3';
        
        const commandesContainer = document.querySelector('#commandes .table-responsive-custom');
        if (commandesContainer) {
            commandesContainer.parentNode.insertBefore(newContainer, commandesContainer);
        }
    }

    const actionsContainer = document.getElementById('actions-rapides-commandes');
    actionsContainer.innerHTML = `
        <div class="card bg-light border-primary">
            <div class="card-body py-2">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div class="d-flex align-items-center">
                        <strong class="text-primary me-2">${count} commande(s) sélectionnée(s)</strong>
                        <button class="btn btn-sm btn-outline-secondary" onclick="deselectionnerTout()">
                            <i class="bi bi-x-circle me-1"></i>Annuler
                        </button>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        <!-- Actions de statut -->
                        <div class="dropdown">
                            <button class="btn btn-success btn-sm dropdown-toggle" type="button" 
                                    data-bs-toggle="dropdown">
                                <i class="bi bi-check-circle me-1"></i>Statut
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="changerStatutSelection('devis')">
                                    <i class="bi bi-file-text me-2"></i>Devis
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="changerStatutSelection('traitement')">
                                    <i class="bi bi-gear me-2"></i>En traitement
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="changerStatutSelection('termine')">
                                    <i class="bi bi-check-lg me-2"></i>Terminé
                                </a></li>
                            </ul>
                        </div>
                        
                        <!-- Actions de paiement -->
                        <div class="dropdown">
                            <button class="btn btn-warning btn-sm dropdown-toggle" type="button" 
                                    data-bs-toggle="dropdown">
                                <i class="bi bi-currency-euro me-1"></i>Paiement
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="changerPaiementSelection('en_attente')">
                                    <i class="bi bi-clock me-2"></i>En attente
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="changerPaiementSelection('paye')">
                                    <i class="bi bi-check-circle me-2"></i>Payé
                                </a></li>
                            </ul>
                        </div>
                        
                        <!-- Message groupé -->
                        <button class="btn btn-primary btn-sm" onclick="envoyerMessageSelection()">
                            <i class="bi bi-chat me-1"></i>Message groupé
                        </button>
                        
                        <!-- Export groupé -->
                        <button class="btn btn-info btn-sm" onclick="exporterSelection()">
                            <i class="bi bi-download me-1"></i>Exporter
                        </button>
                        
                        <!-- Suppression groupée -->
                        <button class="btn btn-danger btn-sm" onclick="supprimerSelection()">
                            <i class="bi bi-trash me-1"></i>Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== FONCTIONS D'ACTION SUR SÉLECTION =====

function changerStatutSelection(nouveauStatut) {
    if (commandesSelectionnees.size === 0) return;
    
    const nomsStatuts = {
        'devis': 'Devis',
        'traitement': 'En traitement', 
        'termine': 'Terminé'
    };
    
    if (confirm(`Changer le statut de ${commandesSelectionnees.size} commande(s) en "${nomsStatuts[nouveauStatut]}" ?`)) {
        let succes = 0;
        let erreurs = 0;
        
        commandesSelectionnees.forEach(id => {
            if (dataManager.mettreAJourCommande(id, { statut: nouveauStatut })) {
                succes++;
            } else {
                erreurs++;
            }
        });
        
        if (succes > 0) {
            showNotification(`${succes} commande(s) marquée(s) comme "${nomsStatuts[nouveauStatut]}"`, 'success');
        }
        if (erreurs > 0) {
            showNotification(`${erreurs} erreur(s) lors de la mise à jour`, 'error');
        }
        
        actualiserDonnees();
        deselectionnerTout();
    }
}

function changerPaiementSelection(nouveauPaiement) {
    if (commandesSelectionnees.size === 0) return;
    
    const nomsPaiements = {
        'en_attente': 'En attente',
        'paye': 'Payé'
    };
    
    if (confirm(`Marquer ${commandesSelectionnees.size} commande(s) comme "${nomsPaiements[nouveauPaiement]}" ?`)) {
        let succes = 0;
        let erreurs = 0;
        
        commandesSelectionnees.forEach(id => {
            if (dataManager.mettreAJourCommande(id, { paiement: nouveauPaiement })) {
                succes++;
            } else {
                erreurs++;
            }
        });
        
        if (succes > 0) {
            showNotification(`${succes} commande(s) marquée(s) comme "${nomsPaiements[nouveauPaiement]}"`, 'success');
        }
        if (erreurs > 0) {
            showNotification(`${erreurs} erreur(s) lors de la mise à jour`, 'error');
        }
        
        actualiserDonnees();
        deselectionnerTout();
    }
}

function envoyerMessageSelection() {
    if (commandesSelectionnees.size === 0) return;
    
    // Ouvrir le modal de message avec les commandes sélectionnées
    ouvrirMessageGroupe(Array.from(commandesSelectionnees));
}

function exporterSelection() {
    if (commandesSelectionnees.size === 0) return;
    
    const commandes = dataManager.getCommandes().filter(c => 
        commandesSelectionnees.has(c.id)
    );
    
    if (commandes.length === 0) {
        showNotification('Aucune commande valide à exporter', 'warning');
        return;
    }
    
    // Générer un PDF groupé ou un ZIP
    genererExportGroupé(commandes);
}

function supprimerSelection() {
    if (commandesSelectionnees.size === 0) return;
    
    if (confirm(`Supprimer définitivement ${commandesSelectionnees.size} commande(s) ? Cette action est irréversible.`)) {
        let succes = 0;
        let erreurs = 0;
        
        commandesSelectionnees.forEach(id => {
            if (supprimerCommandeSilencieuse(id)) {
                succes++;
            } else {
                erreurs++;
            }
        });
        
        if (succes > 0) {
            showNotification(`${succes} commande(s) supprimée(s) avec succès`, 'success');
        }
        if (erreurs > 0) {
            showNotification(`${erreurs} erreur(s) lors de la suppression`, 'error');
        }
        
        deselectionnerTout();
        actualiserDonnees();
    }
}

function supprimerCommandeSilencieuse(idCommande) {
    try {
        const commandes = dataManager.getCommandes();
        const commandesFiltrees = commandes.filter(c => c.id !== idCommande);
        localStorage.setItem('msn_commandes', JSON.stringify(commandesFiltrees));
        return true;
    } catch (error) {
        console.error('Erreur suppression commande:', error);
        return false;
    }
}

function deselectionnerTout() {
    commandesSelectionnees.clear();
    sessionStorage.removeItem('msn_commandes_selectionnees');
    
    document.querySelectorAll('.commande-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    const selectAllCheckbox = document.getElementById('select-all-commandes');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    
    actualiserActionsRapides();
}

function ouvrirMessageGroupe(idsCommandes) {
    const commandes = dataManager.getCommandes().filter(c => 
        idsCommandes.includes(c.id)
    );
    
    if (commandes.length === 0) {
        showNotification('Aucune commande valide pour le message groupé', 'warning');
        return;
    }

    const modalHTML = `
        <div class="modal fade" id="modalMessageGroupe" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-chat-text me-2"></i>Message groupé (${commandes.length} clients)
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            Ce message sera envoyé à ${commandes.length} client(s) sélectionné(s)
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Clients destinataires</label>
                            <div class="border rounded p-2 bg-light" style="max-height: 150px; overflow-y: auto;">
                                ${commandes.map(c => `
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="client-${c.id}" checked 
                                               data-client-id="${c.id}" data-contact="${c.contact}">
                                        <label class="form-check-label" for="client-${c.id}">
                                            ${c.client} - ${c.contact} (${c.reference})
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <form id="formMessageGroupe">
                            <div class="mb-3">
                                <label class="form-label">Type de message</label>
                                <select class="form-select" id="type-message-groupe" onchange="chargerTemplateMessageGroupe()">
                                    <option value="">-- Choisir un template --</option>
                                    <option value="livraison_pret">📦 Votre commande est prête</option>
                                    <option value="rappel_paiement">💳 Rappel de paiement</option>
                                    <option value="suivi_commande">🔄 Suivi de commande</option>
                                    <option value="promotion">🎉 Offre promotionnelle</option>
                                    <option value="personnalise">✏️ Message personnalisé</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Sujet *</label>
                                <input type="text" class="form-control" id="sujet-message-groupe" 
                                       placeholder="Sujet du message groupé..." required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Message *</label>
                                <textarea class="form-control" id="texte-message-groupe" rows="6" 
                                          placeholder="Votre message... Les variables [client] et [reference] seront remplacées automatiquement." required></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Plateforme</label>
                                <select class="form-select" id="plateforme-message-groupe">
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="email">Email</option>
                                    <option value="facebook">Facebook Messenger</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-success" onclick="envoyerMessageGroupe()">
                            <i class="bi bi-send me-2"></i>Envoyer à ${commandes.length} client(s)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('modalMessageGroupe'));
    modal.show();
    
    // Nettoyer le modal après fermeture
    document.getElementById('modalMessageGroupe').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function chargerTemplateMessageGroupe() {
    const type = document.getElementById('type-message-groupe').value;
    
    const templates = {
        'livraison_pret': {
            sujet: '📦 Votre commande est prête !',
            message: 'Bonjour [client],\n\nVotre commande [reference] est maintenant terminée et prête pour la livraison.\n\nNous vous remercions pour votre confiance !\n\nL\'équipe Multi-Services Numériques'
        },
        'rappel_paiement': {
            sujet: '💳 Rappel de paiement',
            message: 'Bonjour [client],\n\nNous vous rappelons que le paiement de votre commande [reference] est en attente.\n\nMerci de procéder au règlement pour que nous puissions finaliser votre projet.\n\nCordialement,\nL\'équipe Multi-Services Numériques'
        },
        'suivi_commande': {
            sujet: '🔄 Suivi de votre commande',
            message: 'Bonjour [client],\n\nVoici un point d\'avancement sur votre commande [reference].\n\nN\'hésitez pas à nous contacter pour toute question.\n\nBien cordialement,\nL\'équipe Multi-Services Numériques'
        },
        'promotion': {
            sujet: '🎉 Offre spéciale pour vous !',
            message: 'Bonjour [client],\n\nEn tant que client fidèle, bénéficiez d\'une remise exclusive sur votre prochaine commande.\n\nN\'hésitez pas à nous consulter pour en savoir plus !\n\nL\'équipe Multi-Services Numériques'
        }
    };
    
    if (templates[type]) {
        document.getElementById('sujet-message-groupe').value = templates[type].sujet;
        document.getElementById('texte-message-groupe').value = templates[type].message;
    }
}

function envoyerMessageGroupe() {
    const sujet = document.getElementById('sujet-message-groupe').value;
    const message = document.getElementById('texte-message-groupe').value;
    const plateforme = document.getElementById('plateforme-message-groupe').value;
    
    if (!sujet.trim() || !message.trim()) {
        showNotification('Veuillez remplir le sujet et le message', 'error');
        return;
    }
    
    // Récupérer les clients sélectionnés dans le modal
    const clientsSelectionnes = Array.from(document.querySelectorAll('#modalMessageGroupe input[type="checkbox"]:checked'))
        .map(checkbox => ({
            id: parseInt(checkbox.dataset.clientId),
            contact: checkbox.dataset.contact
        }));
    
    if (clientsSelectionnes.length === 0) {
        showNotification('Veuillez sélectionner au moins un client', 'warning');
        return;
    }
    
    let messagesEnvoyes = 0;
    let erreurs = 0;
    
    clientsSelectionnes.forEach(({ id, contact }) => {
        const commande = dataManager.getCommandes().find(c => c.id === id);
        if (commande) {
            // Personnaliser le message pour chaque client
            const messagePersonnalise = message
                .replace(/\[client\]/g, commande.client)
                .replace(/\[reference\]/g, commande.reference);
                
            // Enregistrer la communication
            const communication = {
                id: Date.now() + Math.random(),
                commandeId: commande.id,
                date: new Date().toISOString(),
                type: 'message_groupe',
                plateforme: plateforme,
                sujet: sujet,
                message: messagePersonnalise,
                statut: 'prêt à envoyer',
                destinataire: contact,
                client: commande.client,
                reference: commande.reference
            };
            
            let communications = JSON.parse(localStorage.getItem('msn_communications') || '[]');
            communications.push(communication);
            localStorage.setItem('msn_communications', JSON.stringify(communications));
            
            messagesEnvoyes++;
        } else {
            erreurs++;
        }
    });
    
    if (messagesEnvoyes > 0) {
        showNotification(`${messagesEnvoyes} message(s) groupé(s) préparés avec succès`, 'success');
    }
    if (erreurs > 0) {
        showNotification(`${erreurs} erreur(s) lors de la préparation`, 'error');
    }
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalMessageGroupe'));
    if (modal) modal.hide();
    
    deselectionnerTout();
}

function genererExportGroupé(commandes) {
    if (commandes.length === 0) return;
    
    // Créer un ZIP avec tous les PDFs
    const zip = new JSZip();
    let fichiersAjoutes = 0;
    
    commandes.forEach(commande => {
        try {
            // Générer le PDF pour chaque commande
            const pdfData = genererPDFPourExport(commande);
            if (pdfData) {
                const nomFichier = `Commande_${commande.reference}_${commande.client.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                zip.file(nomFichier, pdfData);
                fichiersAjoutes++;
            }
        } catch (error) {
            console.error(`Erreur génération PDF ${commande.reference}:`, error);
        }
    });
    
    if (fichiersAjoutes === 0) {
        showNotification('Aucun PDF généré pour l\'export', 'warning');
        return;
    }
    
    // Générer et télécharger le ZIP
    zip.generateAsync({ type: 'blob' }).then(function(content) {
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `export_commandes_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification(`${fichiersAjoutes} commande(s) exportée(s) avec succès`, 'success');
    });
}

function genererPDFPourExport(commande) {
    // Utiliser la fonction existante d'export PDF
    // Cette fonction doit retourner les données du PDF
    // Pour l'instant, on simule avec un contenu texte
    const contenu = `
        COMMANDE: ${commande.reference}
        CLIENT: ${commande.client}
        CONTACT: ${commande.contact}
        TOTAL: ${commande.total}
        STATUT: ${commande.statut}
        DATE: ${new Date(commande.dateCreation).toLocaleDateString('fr-FR')}
        
        SERVICES:
        ${commande.services.map(s => `- ${s.nom} (${s.quantite} ${s.unite}) : ${s.sousTotal} Ar`).join('\n')}
    `;
    
    return new Blob([contenu], { type: 'text/plain' });
}

// ===== MODIFICATION DE LA FONCTION chargerCommandes =====

function modifierChargerCommandes() {
    // Cette fonction va wrapper la fonction chargerCommandes existante
    const originalChargerCommandes = window.chargerCommandes;
    
    window.chargerCommandes = function(filtre = 'toutes') {
        // Appeler la fonction originale
        originalChargerCommandes(filtre);
        
        // Ensuite, ajouter les cases à cocher
        setTimeout(() => {
            ajouterColonneSelection();
            initialiserSelectionCommandes();
            restaurerCoches();
        }, 100);
    };
}

function ajouterColonneSelection() {
    // Ajouter la colonne de sélection aux tableaux de commandes
    document.querySelectorAll('#liste-commandes table, #liste-commandes-toutes table, #liste-commandes-devis table, #liste-commandes-traitement table, #liste-commandes-termine table, #liste-commandes-paye table').forEach(table => {
        // Vérifier si la colonne de sélection existe déjà
        if (table.querySelector('th .commande-checkbox')) return;
        
        // Ajouter l'en-tête de sélection
        const headerRow = table.querySelector('thead tr');
        if (headerRow) {
            const thSelect = document.createElement('th');
            thSelect.style.width = '40px';
            thSelect.innerHTML = '<input type="checkbox" id="select-all-commandes" class="form-check-input">';
            headerRow.insertBefore(thSelect, headerRow.firstChild);
        }
        
        // Ajouter les cases à cocher pour chaque ligne
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const commandeId = trouverIdCommandeDansLigne(row);
            if (commandeId) {
                const tdSelect = document.createElement('td');
                tdSelect.innerHTML = `<input type="checkbox" class="form-check-input commande-checkbox" data-id="${commandeId}">`;
                row.insertBefore(tdSelect, row.firstChild);
            }
        });
    });
}

function trouverIdCommandeDansLigne(row) {
    // Chercher l'ID dans les boutons d'action
    const boutons = row.querySelectorAll('button');
    for (let bouton of boutons) {
        const onclick = bouton.getAttribute('onclick');
        if (onclick) {
            const match = onclick.match(/voirDetails\((\d+)\)/);
            if (match) return parseInt(match[1]);
            
            const match2 = onclick.match(/modifierCommande\((\d+)\)/);
            if (match2) return parseInt(match[2]);
            
            const match3 = onclick.match(/supprimerCommande\((\d+)\)/);
            if (match3) return parseInt(match[3]);
        }
    }
    
    // Si pas trouvé, chercher dans les données de la ligne
    const cells = row.querySelectorAll('td');
    for (let cell of cells) {
        if (cell.textContent.includes('DEV-') || cell.textContent.includes('FAC-')) {
            // Essayer d'extraire l'ID à partir de la référence
            const commandes = dataManager.getCommandes();
            const reference = cell.textContent.trim();
            const commande = commandes.find(c => c.reference === reference);
            if (commande) return commande.id;
        }
    }
    
    return null;
}

function restaurerCoches() {
    // Cocher les cases correspondant aux commandes sélectionnées
    document.querySelectorAll('.commande-checkbox').forEach(checkbox => {
        const commandeId = parseInt(checkbox.dataset.id);
        checkbox.checked = commandesSelectionnees.has(commandeId);
    });
    
    // Mettre à jour la case "tout sélectionner"
    const selectAllCheckbox = document.getElementById('select-all-commandes');
    if (selectAllCheckbox) {
        const totalCheckboxes = document.querySelectorAll('.commande-checkbox').length;
        const checkedCheckboxes = document.querySelectorAll('.commande-checkbox:checked').length;
        selectAllCheckbox.checked = totalCheckboxes > 0 && totalCheckboxes === checkedCheckboxes;
    }
    
    actualiserActionsRapides();
}

// ===== INITIALISATION AU CHARGEMENT =====

document.addEventListener('DOMContentLoaded', function() {
    // Modifier la fonction chargerCommandes pour inclure la sélection
    modifierChargerCommandes();
    
    // Initialiser la sélection
    initialiserSelectionCommandes();
    
    console.log('✅ Système de sélection multiple initialisé');
});

// ===== FONCTION DE DÉBOGAGE =====

function debugSelection() {
    console.log('=== DÉBOGAGE SÉLECTION ===');
    console.log('Commandes sélectionnées:', Array.from(commandesSelectionnees));
    console.log('Cases cochées:', document.querySelectorAll('.commande-checkbox:checked').length);
    console.log('Total cases:', document.querySelectorAll('.commande-checkbox').length);
    console.log('SessionStorage:', sessionStorage.getItem('msn_commandes_selectionnees'));
    console.log('==========================');
}

// ===== SYSTÈME DE CALENDRIER ÉDITORIAL AVEC IA =====
class CalendrierEditorial {
    constructor() {
        this.cle = 'msn_calendrier_editorial';
        this.initialiser();
    }

    initialiser() {
        this.publications = this.chargerPublications();
        this.initialiserIA();
    }

    initialiserIA() {
        this.apiKey = localStorage.getItem('msn_ia_api_key');
        this.endpoint = 'https://api.openai.com/v1/chat/completions';
    }

    chargerPublications() {
        return JSON.parse(localStorage.getItem(this.cle) || '[]');
    }

    sauvegarderPublications() {
        localStorage.setItem(this.cle, JSON.stringify(this.publications));
    }

    async genererIdeeContenuIA(theme, ton = 'professionnel', publicCible = 'clients') {
    let tentatives = 3;
    let dernierErreur = null;
    
    console.log(`🔄 Génération IA pour "${theme}" (${tentatives} tentatives max)`);

    while (tentatives > 0) {
        try {
            const resultat = await this.appelerAPIOpenAI(theme, ton, publicCible, tentatives);
            console.log(`✅ Succès génération IA (tentative ${4 - tentatives}/3)`);
            return resultat;
            
        } catch (error) {
            tentatives--;
            dernierErreur = error;
            
            console.warn(`❌ Erreur génération IA (tentative ${3 - tentatives}/3):`, error.message);
            
            if (tentatives > 0) {
                const delai = this.calculerDelaiRetry(3 - tentatives);
                console.log(`⏳ Nouvelle tentative dans ${delai}ms...`);
                await new Promise(resolve => setTimeout(resolve, delai));
            }
        }
    }
    
    // Si toutes les tentatives ont échoué
    console.error(`💥 Échec génération IA après 3 tentatives pour "${theme}"`, dernierErreur);
    return this.genererIdeeContenuBasique(theme);
}

// Nouvelle méthode pour appeler l'API OpenAI avec gestion d'erreurs détaillée
async appelerAPIOpenAI(theme, ton, publicCible, tentativesRestantes) {
    // Vérifier la clé API
    if (!this.apiKey || this.apiKey.trim() === '') {
        throw new Error('Clé API OpenAI non configurée');
    }

    // Vérifier la connexion internet
    if (!navigator.onLine) {
        throw new Error('Pas de connexion internet');
    }

    const prompt = this.creerPromptIdeeContenu(theme, ton, publicCible);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Timeout de 30 secondes

    try {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `Tu es un expert en marketing digital et création de contenu pour les réseaux sociaux. 
                                Tu crées des légendes engageantes et professionnelles pour Facebook.
                                Réponds UNIQUEMENT en français.
                                Format de réponse strict :
                                ACCROCHE: [texte avec emoji]
                                MESSAGE: [2-3 phrases maximum]
                                CTA: [texte clair avec emoji]
                                HASHTAGS: #[hashtag1] #[hashtag2] #[hashtag3] #[hashtag4] #[hashtag5]`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.8,
                max_tokens: 500,
                top_p: 0.9
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Gérer les différents codes de statut HTTP
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw this.analyserErreurHTTP(response.status, errorData);
        }

        const data = await response.json();
        
        // Vérifier la structure de la réponse
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Réponse API invalide');
        }

        const contenuIA = data.choices[0].message.content;
        
        // Valider le contenu retourné
        if (!contenuIA || contenuIA.length < 50) {
            throw new Error('Réponse IA trop courte ou vide');
        }

        return this.formaterReponseIA(contenuIA);

    } catch (error) {
        clearTimeout(timeoutId);
        
        // Re-lancer l'erreur avec plus de contexte
        if (error.name === 'AbortError') {
            throw new Error(`Timeout de l'API OpenAI (30s) - Tentatives restantes: ${tentativesRestantes}`);
        }
        
        throw error;
    }
}

// Méthode pour analyser les erreurs HTTP spécifiques
analyserErreurHTTP(statusCode, errorData) {
    switch (statusCode) {
        case 401:
            return new Error('Clé API OpenAI invalide ou expirée');
        case 429:
            const resetTime = errorData.reset_time || 'inconnue';
            return new Error(`Quota API dépassé - Réessayez après ${resetTime}`);
        case 500:
            return new Error('Erreur interne du serveur OpenAI - Réessayez plus tard');
        case 503:
            return new Error('Service OpenAI temporairement indisponible');
        default:
            return new Error(`Erreur API ${statusCode}: ${errorData.error?.message || 'Erreur inconnue'}`);
    }
}

// Méthode pour calculer le délai de retry exponentiel
calculerDelaiRetry(tentative) {
    const delais = {
        1: 1000,   // 1 seconde après 1ère erreur
        2: 3000,   // 3 secondes après 2ème erreur
        3: 5000    // 5 secondes après 3ème erreur
    };
    return delais[tentative] || 1000;
}

// Amélioration de la méthode de formatage avec validation
formaterReponseIA(reponse) {
    // Nettoyer la réponse
    const reponseNettoyee = reponse.trim();
    
    // Validation basique
    if (!reponseNettoyee.includes('ACCROCHE:') || !reponseNettoyee.includes('MESSAGE:')) {
        console.warn('Format de réponse IA non standard:', reponseNettoyee);
        return this.corrigerFormatReponse(reponseNettoyee);
    }

    const lignes = reponseNettoyee.split('\n');
    const resultat = {
        accroche: '',
        message: '',
        cta: '',
        hashtags: [],
        source: 'ia'
    };

    let sectionActuelle = '';

    lignes.forEach(ligne => {
        const ligneNettoyee = ligne.trim();
        
        if (ligneNettoyee.startsWith('ACCROCHE:')) {
            sectionActuelle = 'accroche';
            resultat.accroche = ligneNettoyee.replace('ACCROCHE:', '').trim();
        } else if (ligneNettoyee.startsWith('MESSAGE:')) {
            sectionActuelle = 'message';
            resultat.message = ligneNettoyee.replace('MESSAGE:', '').trim();
        } else if (ligneNettoyee.startsWith('CTA:')) {
            sectionActuelle = 'cta';
            resultat.cta = ligneNettoyee.replace('CTA:', '').trim();
        } else if (ligneNettoyee.startsWith('HASHTAGS:')) {
            sectionActuelle = 'hashtags';
            const tags = ligneNettoyee.replace('HASHTAGS:', '').trim();
            resultat.hashtags = tags.split(' ').filter(tag => tag.startsWith('#') && tag.length > 1);
        } else if (sectionActuelle && ligneNettoyee) {
            // Gérer les retours à la ligne dans les sections
            if (sectionActuelle === 'message') {
                resultat.message += ' ' + ligneNettoyee;
            }
        }
    });

    // Validation du résultat formaté
    return this.validerContenuIA(resultat);
}

// Méthode pour corriger les formats de réponse non standard
corrigerFormatReponse(reponse) {
    console.log('🔧 Correction du format de réponse IA');
    
    // Tentative d'extraction intelligente
    const lignes = reponse.split('\n').filter(l => l.trim());
    const resultat = {
        accroche: '',
        message: '',
        cta: '',
        hashtags: [],
        source: 'ia_corrige'
    };

    // Chercher une ligne qui ressemble à une accroche (avec emoji)
    const accroche = lignes.find(l => /[🔄🎨📄🎉⭐💡]/.test(l));
    if (accroche) resultat.accroche = accroche.trim();

    // Le reste comme message
    const autresLignes = lignes.filter(l => l !== accroche && !l.includes('#'));
    if (autresLignes.length > 0) {
        resultat.message = autresLignes.join(' ').trim();
    }

    // Extraire les hashtags
    const tousLesMots = reponse.split(' ');
    resultat.hashtags = tousLesMots.filter(mot => mot.startsWith('#') && mot.length > 1);

    // Générer un CTA basique si manquant
    if (!resultat.cta) {
        resultat.cta = "📞 Contactez-nous pour en savoir plus !";
    }

    return this.validerContenuIA(resultat);
}

// Méthode de validation du contenu généré
validerContenuIA(contenu) {
    const validations = [];

    // Validation de l'accroche
    if (!contenu.accroche || contenu.accroche.length < 10) {
        contenu.accroche = "🚀 Découvrez nos services professionnels !";
        validations.push('accroche corrigée');
    }

    // Validation du message
    if (!contenu.message || contenu.message.length < 20) {
        contenu.message = "Nous vous accompagnons dans tous vos projets avec expertise et professionnalisme.";
        validations.push('message corrigé');
    }

    // Validation du CTA
    if (!contenu.cta || contenu.cta.length < 5) {
        contenu.cta = "💼 Demandez votre devis gratuit dès maintenant !";
        validations.push('CTA corrigé');
    }

    // Validation des hashtags
    if (!contenu.hashtags || contenu.hashtags.length === 0) {
        contenu.hashtags = ['#service', '#professionnel', '#qualité', '#expert', '#digital'];
        validations.push('hashtags corrigés');
    } else if (contenu.hashtags.length > 10) {
        contenu.hashtags = contenu.hashtags.slice(0, 5); // Limiter à 5 hashtags
        validations.push('hashtags limités à 5');
    }

    if (validations.length > 0) {
        console.log(`⚠️ Validations appliquées: ${validations.join(', ')}`);
    }

    return contenu;
}

// Méthode pour tester la connexion à l'API
async testerConnexionAPI() {
    try {
        const testContenu = await this.genererIdeeContenuIA('test', 'professionnel', 'general');
        return {
            success: true,
            message: '✅ Connexion à l\'API OpenAI fonctionnelle',
            exemple: testContenu
        };
    } catch (error) {
        return {
            success: false,
            message: `❌ Erreur de connexion: ${error.message}`,
            error: error.message
        };
    }
}



    creerPromptIdeeContenu(theme, ton, publicCible) {
        return `Crée une publication Facebook engageante pour une entreprise de services numériques (saisie, conception graphique, mise en forme).

THÈME: ${theme}
TON: ${ton}
PUBLIC CIBLE: ${publicCible}

Génère une légende complète avec:
1. Un accroche percutante (avec emoji)
2. Le corps du message (2-3 phrases maximum)
3. Un call-to-action clair
4. 5 hashtags pertinents

Format de réponse:
ACCROCHE: [texte]
MESSAGE: [texte]  
CTA: [texte]
HASHTAGS: #[hashtag1] #[hashtag2] etc.

La publication doit être en français, engageante et professionnelle.`;
    }

    formaterReponseIA(reponse) {
        const lignes = reponse.split('\n');
        const resultat = {
            accroche: '',
            message: '',
            cta: '',
            hashtags: []
        };

        lignes.forEach(ligne => {
            if (ligne.startsWith('ACCROCHE:')) {
                resultat.accroche = ligne.replace('ACCROCHE:', '').trim();
            } else if (ligne.startsWith('MESSAGE:')) {
                resultat.message = ligne.replace('MESSAGE:', '').trim();
            } else if (ligne.startsWith('CTA:')) {
                resultat.cta = ligne.replace('CTA:', '').trim();
            } else if (ligne.startsWith('HASHTAGS:')) {
                const tags = ligne.replace('HASHTAGS:', '').trim();
                resultat.hashtags = tags.split(' ').filter(tag => tag.startsWith('#'));
            }
        });

        return resultat;
    }

    genererIdeeContenuBasique(theme) {
        const ideesBase = {
            'saisie': {
                accroche: "📄 Besoin d'une saisie de documents précise et rapide ?",
                message: "Confiez-nous vos documents à saisir et gagnez un temps précieux ! Notre équipe garantit une parfaite exactitude.",
                cta: "📩 Envoyez-nous vos documents dès maintenant !",
                hashtags: ['#saisie', '#document', '#precision', '#gainDeTemps', '#professionnel']
            },
            'design': {
                accroche: "🎨 Votre image mérite le meilleur !",
                message: "Logos, affiches, chartes graphiques... Donnez vie à vos projets avec notre expertise en design graphique.",
                cta: "💼 Demandez un devis gratuit pour votre projet !",
                hashtags: ['#design', '#graphisme', '#logo', '#creativite', '#branding']
            },
            'promotion': {
                accroche: "🎉 Offre spéciale cette semaine !",
                message: "Profitez de nos services à des tarifs préférentiels. Qualité professionnelle garantie.",
                cta: "⚡ Offre limitée - Contactez-nous vite !",
                hashtags: ['#promotion', '#offre', '#special', '#qualite', '#service']
            }
        };

        return ideesBase[theme] || ideesBase['promotion'];
    }

    ajouterPublication(publication) {
        publication.id = Date.now();
        publication.dateCreation = new Date().toISOString();
        publication.statut = 'programmee'; // programmee, publiee, annulee
        
        this.publications.push(publication);
        this.sauvegarderPublications();
        
        return publication;
    }

    getPublicationsMois(mois = new Date().getMonth(), annee = new Date().getFullYear()) {
        return this.publications.filter(pub => {
            const datePub = new Date(pub.datePublication);
            return datePub.getMonth() === mois && datePub.getFullYear() === annee;
        });
    }

    getProchainesPublications(jours = 30) {
        const maintenant = new Date();
        const limite = new Date();
        limite.setDate(maintenant.getDate() + jours);
        
        return this.publications.filter(pub => {
            const datePub = new Date(pub.datePublication);
            return datePub >= maintenant && datePub <= limite && pub.statut === 'programmee';
        }).sort((a, b) => new Date(a.datePublication) - new Date(b.datePublication));
    }

    // Génération automatique de contenu pour les 3 prochains mois
    async genererCalendrierAutomatique() {
    const themes = ['saisie', 'design', 'promotion', 'temoignage', 'conseil'];
    const tons = ['professionnel', 'amical', 'enthousiaste'];
    const publics = ['entreprises', 'etudiants', 'professionnels', 'general'];
    const plateformes = ['facebook', 'instagram', 'linkedin'];
    
    const publications = [];
    const aujourdhui = new Date();
    
    // 🔄 OPTIMISATION : 1 publication par semaine pendant 12 semaines (au lieu de 30 publications)
    for (let semaine = 0; semaine < 12; semaine++) {
        const datePublication = new Date(aujourdhui);
        datePublication.setDate(aujourdhui.getDate() + (semaine * 7)); // Toutes les semaines
        
        // Choisir un thème stratégique pour la semaine
        const theme = this.obtenirThemeStrategique(semaine, themes);
        const ton = tons[Math.floor(Math.random() * tons.length)];
        const publicCible = this.obtenirPublicCibleOptimal(theme);
        const plateforme = plateformes[Math.floor(Math.random() * plateformes.length)];
        
        try {
            console.log(`🔄 Génération semaine ${semaine + 1}: ${theme} pour ${publicCible}`);
            
            const contenu = await this.genererIdeeContenuIA(theme, ton, publicCible);
            
            const publication = {
                id: Date.now() + semaine,
                titre: `Publication ${theme} - Semaine ${semaine + 1}`,
                theme: theme,
                ton: ton,
                publicCible: publicCible,
                contenu: contenu,
                datePublication: datePublication.toISOString(),
                dateCreation: new Date().toISOString(),
                statut: 'programmee',
                plateforme: plateforme,
                media: this.genererSuggestionMedia(theme),
                notes: `Généré automatiquement - Semaine ${semaine + 1}`,
                priorite: this.determinerPriorite(semaine)
            };
            
            publications.push(publication);
            
            // 🔄 OPTIMISATION : Pause réduite entre les générations
            if (semaine % 3 === 0) { // Pause plus longue toutes les 3 semaines
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
        } catch (error) {
            console.error(`❌ Erreur semaine ${semaine + 1}:`, error);
            
            // Fallback : génération basique en cas d'erreur
            const publicationFallback = this.creerPublicationFallback(
                theme, 
                publicCible, 
                plateforme, 
                datePublication, 
                semaine
            );
            publications.push(publicationFallback);
        }
    }
    
    // Ajouter les publications au calendrier
    this.publications = [...this.publications, ...publications];
    this.sauvegarderPublications();
    
    console.log(`✅ Calendrier généré : ${publications.length} publications sur 12 semaines`);
    return publications;
}

// 🎯 Méthodes d'optimisation stratégique
obtenirThemeStrategique(semaine, themes) {
    // Stratégie de contenu variée sur 12 semaines
    const strategieThemes = [
        'saisie',      // Semaine 1 : Service principal
        'design',      // Semaine 2 : Service complémentaire  
        'promotion',   // Semaine 3 : Offre spéciale
        'temoignage',  // Semaine 4 : Social proof
        'conseil',     // Semaine 5 : Expertise
        'saisie',      // Semaine 6 : Rappel service principal
        'design',      // Semaine 7 : Nouveaux designs
        'promotion',   // Semaine 8 : Offre limitée
        'temoignage',  // Semaine 9 : Cas client
        'conseil',     // Semaine 10 : Conseils avancés
        'saisie',      // Semaine 11 : Bénéfices
        'promotion'    // Semaine 12 : Offre de fin de période
    ];
    
    return strategieThemes[semaine] || themes[Math.floor(Math.random() * themes.length)];
}

obtenirPublicCibleOptimal(theme) {
    // Associer le public cible optimal à chaque thème
    const mappingPublic = {
        'saisie': 'entreprises',
        'design': 'entreprises', 
        'promotion': 'general',
        'temoignage': 'professionnels',
        'conseil': 'entreprises'
    };
    
    return mappingPublic[theme] || 'general';
}

genererSuggestionMedia(theme) {
    // Suggestions d'images selon le thème
    const suggestionsMedia = {
        'saisie': '/assets/saisie-documents.jpg',
        'design': '/assets/creations-design.jpg', 
        'promotion': '/assets/offre-speciale.jpg',
        'temoignage': '/assets/temoignages-clients.jpg',
        'conseil': '/assets/expertise-conseil.jpg'
    };
    
    return suggestionsMedia[theme];
}

determinerPriorite(semaine) {
    // Priorités stratégiques : élevée en début/fin de période
    if (semaine === 0 || semaine === 11) return 'haute';
    if (semaine === 5 || semaine === 6) return 'moyenne';
    return 'normale';
}

creerPublicationFallback(theme, publicCible, plateforme, datePublication, semaine) {
    // Contenu de fallback soigné
    const contenusFallback = {
        'saisie': {
            accroche: "📄 Vos documents méritent une saisie parfaite !",
            message: "Notre équipe experte transforme vos documents papier en fichiers numériques précis et organisés. Gain de temps garanti !",
            cta: "🚀 Demandez votre devis gratuit dès maintenant !",
            hashtags: ['#saisie', '#documents', '#productivité', '#professionnel', '#numérisation']
        },
        'design': {
            accroche: "🎨 Donnez vie à vos idées avec un design percutant !",
            message: "Logos, affiches, supports de communication... Notre créativité au service de votre image professionnelle.",
            cta: "✨ Transformez votre identité visuelle - Contactez-nous !",
            hashtags: ['#design', '#graphisme', '#créativité', '#branding', '#identitéVisuelle']
        },
        'promotion': {
            accroche: "🎁 Offre exceptionnelle pour booster votre productivité !",
            message: "Profitez de nos services premium à des tarifs avantageux. Qualité et rapidité au rendez-vous.",
            cta: "⚡ Offre limitée - J'en profite !",
            hashtags: ['#promotion', '#offre', '#spécial', '#qualité', '#service']
        },
        'temoignage': {
            accroche: "⭐ Nos clients partagent leur expérience !",
            message: "Découvrez comment nous avons aidé des entreprises comme la vôtre à gagner en efficacité et en visibilité.",
            cta: "👥 Rejoignez nos clients satisfaits - Témoignez vous aussi !",
            hashtags: ['#témoignage', '#satisfaction', '#clients', '#réussite', '#confiance']
        },
        'conseil': {
            accroche: "💡 Expert en optimisation digitale à votre service !",
            message: "Besoin de conseils pour vos projets numériques ? Notre équipe d'experts vous guide vers les meilleures solutions.",
            cta: "📞 Consultation gratuite - Parlons de votre projet !",
            hashtags: ['#conseil', '#expertise', '#accompagnement', '#digital', '#solution']
        }
    };
    
    const contenu = contenusFallback[theme] || contenusFallback['saisie'];
    
    return {
        id: Date.now() + semaine + 1000, // ID différent des publications IA
        titre: `Publication ${theme} - Semaine ${semaine + 1} (Fallback)`,
        theme: theme,
        ton: 'professionnel',
        publicCible: publicCible,
        contenu: contenu,
        datePublication: datePublication.toISOString(),
        dateCreation: new Date().toISOString(),
        statut: 'programmee',
        plateforme: plateforme,
        media: this.genererSuggestionMedia(theme),
        notes: `Généré automatiquement (Fallback) - Semaine ${semaine + 1}`,
        priorite: this.determinerPriorite(semaine),
        source: 'fallback'
    };
}

// 📊 Méthode pour analyser la performance du calendrier
analyserPerformanceCalendrier() {
    const publications = this.getProchainesPublications(84); // 12 semaines
    
    const stats = {
        total: publications.length,
        parTheme: {},
        parPlateforme: {},
        parSemaine: {},
        avecIA: publications.filter(p => p.source !== 'fallback').length,
        fallbacks: publications.filter(p => p.source === 'fallback').length
    };
    
    publications.forEach(pub => {
        // Stats par thème
        stats.parTheme[pub.theme] = (stats.parTheme[pub.theme] || 0) + 1;
        
        // Stats par plateforme
        stats.parPlateforme[pub.plateforme] = (stats.parPlateforme[pub.plateforme] || 0) + 1;
        
        // Stats par semaine
        const datePub = new Date(pub.datePublication);
        const semaine = Math.floor((datePub - new Date()) / (7 * 24 * 60 * 60 * 1000));
        stats.parSemaine[semaine] = (stats.parSemaine[semaine] || 0) + 1;
    });
    
    console.log('📊 Analyse du calendrier généré:', stats);
    return stats;
}
}

// Dans votre dashboard.js - À AJOUTER dans le DOMContentLoaded
function ajouterOngletCalendrier() {
    const navbar = document.querySelector('.navbar-nav');
    
    if (!document.querySelector('[data-section="calendrier-editorial"]')) {
        const nouvelOnglet = `
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" 
                   onclick="showSection('calendrier-editorial')">
                    <i class="bi bi-calendar-check me-1"></i>Calendrier Éditorial
                </a>
            </li>
        `;
        
        // Insérer dans la navigation
        const avantParametres = document.querySelector('[data-section="parametres"]');
        if (avantParametres) {
            avantParametres.parentNode.insertAdjacentHTML('beforebegin', nouvelOnglet);
        } else {
            navbar.insertAdjacentHTML('beforeend', nouvelOnglet);
        }
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    ajouterOngletCalendrier();
    
    // Gestionnaire de clic pour le nouvel onglet
    document.addEventListener('click', function(e) {
        if (e.target.closest('[data-section="calendrier-editorial"]')) {
            e.preventDefault();
            afficherCalendrierEditorial();
            showSection('calendrier-editorial');
        }
    });
});

// FONCTIONS MANQUANTES POUR LE CALENDRIER
async function genererCalendrierAutomatique() {
    console.log('🔄 Génération du calendrier avec IA');
    
    // Vérifier si l'instance calendrierEditorial existe
    if (typeof calendrierEditorial === 'undefined') {
        alert('❌ Le système de calendrier n\'est pas initialisé');
        return;
    }

    // Confirmation utilisateur
    if (!confirm('🎯 Générer automatiquement un calendrier éditorial pour les 3 prochains mois ?\n\nCette opération peut prendre 2-3 minutes.')) {
        return;
    }

    // Afficher un indicateur de chargement
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Génération en cours...';
    btn.disabled = true;

    try {
        showNotification('🔄 Génération du calendrier en cours...', 'info');

        // Appeler la méthode de génération automatique
        const nouvellesPublications = await calendrierEditorial.genererCalendrierAutomatique();
        
        // Succès
        showNotification(`✅ ${nouvellesPublications.length} publications générées avec succès !`, 'success');
        
        // Recharger l'affichage du calendrier
        chargerAffichageCalendrier();
        
        console.log('📊 Publications générées:', nouvellesPublications);

    } catch (error) {
        console.error('❌ Erreur génération calendrier:', error);
        showNotification('❌ Erreur lors de la génération du calendrier', 'error');
        
        // Fallback : générer quelques publications basiques
        genererPublicationsBasiques();
    } finally {
        // Restaurer le bouton
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Fonction de fallback si l'IA échoue
function genererPublicationsBasiques() {
    console.log('🔄 Génération de publications basiques');
    
    const publicationsBasiques = [
        {
            id: Date.now() + 1,
            titre: "Publication Saisie - Démarrage",
            theme: "saisie",
            ton: "professionnel",
            publicCible: "entreprises",
            contenu: {
                accroche: "📄 Besoin d'une saisie de documents précise ?",
                message: "Confiez-nous vos documents et gagnez un temps précieux !",
                cta: "📩 Contactez-nous dès maintenant !",
                hashtags: ['#saisie', '#professionnel', '#gainDeTemps']
            },
            datePublication: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // +2 jours
            statut: "programmee",
            plateforme: "facebook"
        },
        {
            id: Date.now() + 2,
            titre: "Publication Design - Promotion",
            theme: "design",
            ton: "enthousiaste", 
            publicCible: "general",
            contenu: {
                accroche: "🎨 Votre image mérite le meilleur !",
                message: "Logos, affiches, chartes graphiques... Donnez vie à vos projets !",
                cta: "💼 Demandez un devis gratuit !",
                hashtags: ['#design', '#creativite', '#graphisme']
            },
            datePublication: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // +5 jours
            statut: "programmee",
            plateforme: "facebook"
        }
    ];

    // Ajouter aux publications existantes
    publicationsBasiques.forEach(pub => {
        calendrierEditorial.ajouterPublication(pub);
    });

    showNotification(`✅ ${publicationsBasiques.length} publications basiques créées !`, 'success');
    chargerAffichageCalendrier();
}

// Fonction pour charger l'affichage du calendrier
function chargerAffichageCalendrier() {
    console.log('📊 Chargement de l\'affichage du calendrier');
    
    const container = document.getElementById('liste-publications');
    if (!container) {
        console.error('❌ Container liste-publications non trouvé');
        return;
    }

    // Récupérer les publications des 3 prochains mois
    const publications = calendrierEditorial.getProchainesPublications(90);
    
    if (publications.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="empty-state">
                        <div class="icon">📅</div>
                        <h4>Aucune publication programmée</h4>
                        <p>Utilisez l'IA pour générer automatiquement un calendrier</p>
                        <button onclick="genererCalendrierAutomatique()" class="btn btn-primary mt-2">
                            <i class="bi bi-robot me-2"></i>Générer avec IA
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Afficher les publications
    container.innerHTML = publications.map(pub => {
        const datePub = new Date(pub.datePublication);
        const maintenant = new Date();
        const joursRestants = Math.ceil((datePub - maintenant) / (1000 * 60 * 60 * 24));
        
        const badgeStatut = pub.statut === 'programmee' ? 
            `<span class="badge bg-warning">Programmée (${joursRestants}j)</span>` :
            `<span class="badge bg-success">Publiée</span>`;

        return `
            <tr>
                <td>
                    <strong>${datePub.toLocaleDateString('fr-FR')}</strong><br>
                    <small class="text-muted">${datePub.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</small>
                </td>
                <td>
                    <span class="badge bg-secondary">${pub.theme}</span><br>
                    <small>${pub.publicCible}</small>
                </td>
                <td>
                    <div class="publication-preview">
                        <strong class="text-primary">${pub.contenu.accroche}</strong>
                        <p class="mb-1 small">${pub.contenu.message}</p>
                        <small class="text-success">${pub.contenu.cta}</small>
                        <div class="hashtags mt-1">
                            ${pub.contenu.hashtags.map(tag => 
                                `<span class="badge bg-light text-dark me-1">${tag}</span>`
                            ).join('')}
                        </div>
                    </div>
                </td>
                <td>${badgeStatut}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="previsualiserPublication(${pub.id})" title="Prévisualiser">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="publierMaintenant(${pub.id})" title="Publier maintenant">
                            <i class="bi bi-send"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="supprimerPublication(${pub.id})" title="Supprimer">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Mettre à jour les statistiques
    mettreAJourStatistiquesCalendrier();
}

// Fonction pour mettre à jour les statistiques
function mettreAJourStatistiquesCalendrier() {
    const publications = calendrierEditorial.getProchainesPublications(90);
    
    // Statistiques des 30 prochains jours
    const pubs30jours = publications.filter(pub => {
        const datePub = new Date(pub.datePublication);
        const maintenant = new Date();
        const diffJours = (datePub - maintenant) / (1000 * 60 * 60 * 24);
        return diffJours <= 30;
    });

    // Mettre à jour les compteurs
    const elements = {
        'stats-pubs-programmees': publications.length,
        'stats-pubs-mois': pubs30jours.length,
        'stats-pubs-semaine': pubs30jours.filter(p => {
            const datePub = new Date(p.datePublication);
            const maintenant = new Date();
            return (datePub - maintenant) / (1000 * 60 * 60 * 24) <= 7;
        }).length,
        'stats-themes': new Set(publications.map(p => p.theme)).size
    };

    for (const [id, valeur] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = valeur;
        }
    }
}

// Fonctions supplémentaires pour les actions
function previsualiserPublication(id) {
    const publication = calendrierEditorial.publications.find(p => p.id === id);
    if (publication) {
        alert(`📋 PRÉVISUALISATION\n\n${publication.contenu.accroche}\n\n${publication.contenu.message}\n\n${publication.contenu.cta}\n\n${publication.contenu.hashtags.join(' ')}`);
    }
}

async function publierMaintenant(id) {
    try {
        // Récupérer la publication
        const publication = calendrierEditorial.publications.find(p => p.id === id);
        
        if (!publication) {
            showNotification('❌ Publication non trouvée', 'error');
            return;
        }

        // Vérifier si la publication est déjà publiée
        if (publication.statut === 'publiee') {
            showNotification('⚠️ Cette publication est déjà publiée', 'warning');
            return;
        }

        // Confirmation utilisateur avec prévisualisation
        const confirmation = confirm(
            `📢 PUBLIER MAINTENANT ?\n\n` +
            `Thème: ${publication.theme}\n` +
            `Plateforme: ${publication.plateforme}\n` +
            `Date: ${new Date().toLocaleString('fr-FR')}\n\n` +
            `Êtes-vous sûr de vouloir publier immédiatement ?`
        );

        if (!confirmation) {
            return;
        }

        // Afficher un indicateur de progression
        const publicationBtn = event.target;
        const originalHTML = publicationBtn.innerHTML;
        publicationBtn.innerHTML = '<i class="bi bi-arrow-repeat spinner"></i>';
        publicationBtn.disabled = true;

        showNotification('🔄 Publication en cours...', 'info');

        // Simuler le processus de publication
        const resultat = await simulerPublicationReseauSocial(publication);

        if (resultat.success) {
            // Mettre à jour le statut de la publication
            publication.statut = 'publiee';
            publication.datePublicationReelle = new Date().toISOString();
            publication.idPublication = resultat.id; // ID de la publication sur le réseau
            
            // Sauvegarder les modifications
            calendrierEditorial.sauvegarderPublications();
            
            // Mettre à jour l'affichage
            chargerAffichageCalendrier();
            
            showNotification(
                `✅ Publication réussie sur ${publication.plateforme} !\n` +
                `ID: ${resultat.id}`,
                'success'
            );
            
            // Optionnel: Ouvrir le lien de la publication
            if (resultat.url) {
                const ouvrirLien = confirm('Publication réussie ! Voulez-vous ouvrir la publication ?');
                if (ouvrirLien) {
                    window.open(resultat.url, '_blank');
                }
            }
            
        } else {
            throw new Error(resultat.error || 'Erreur de publication');
        }

    } catch (error) {
        console.error('❌ Erreur publication:', error);
        showNotification(`❌ Échec de la publication: ${error.message}`, 'error');
        
    } finally {
        // Restaurer le bouton
        if (event && event.target) {
            event.target.innerHTML = originalHTML;
            event.target.disabled = false;
        }
    }
}

// Fonction pour simuler la publication sur les réseaux sociaux
async function simulerPublicationReseauSocial(publication) {
    // Simulation d'un délai de publication (1-3 secondes)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Selon la plateforme, adapter le format et le comportement
    switch (publication.plateforme) {
        case 'facebook':
            return simulerPublicationFacebook(publication);
        case 'instagram':
            return simulerPublicationInstagram(publication);
        case 'linkedin':
            return simulerPublicationLinkedIn(publication);
        default:
            return simulerPublicationGenerique(publication);
    }
}

function simulerPublicationFacebook(publication) {
    // Simulation des spécificités Facebook
    const idPublication = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
        success: true,
        id: idPublication,
        url: `https://facebook.com/100066319696351/posts/${idPublication}`,
        platform: 'facebook',
        timestamp: new Date().toISOString(),
        metrics: {
            reach: Math.floor(Math.random() * 1000) + 100,
            engagement: Math.floor(Math.random() * 50) + 10
        }
    };
}

function simulerPublicationInstagram(publication) {
    // Simulation des spécificités Instagram
    const idPublication = `ig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
        success: true,
        id: idPublication,
        url: `https://instagram.com/p/${idPublication}`,
        platform: 'instagram',
        timestamp: new Date().toISOString(),
        metrics: {
            likes: Math.floor(Math.random() * 200) + 50,
            comments: Math.floor(Math.random() * 20) + 5
        }
    };
}

function simulerPublicationLinkedIn(publication) {
    // Simulation des spécificités LinkedIn
    const idPublication = `li_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
        success: true,
        id: idPublication,
        url: `https://linkedin.com/feed/update/${idPublication}`,
        platform: 'linkedin',
        timestamp: new Date().toISOString(),
        metrics: {
            impressions: Math.floor(Math.random() * 500) + 200,
            clicks: Math.floor(Math.random() * 30) + 5
        }
    };
}

function simulerPublicationGenerique(publication) {
    // Publication générique pour les autres plateformes
    return {
        success: true,
        id: `pub_${Date.now()}`,
        url: null,
        platform: publication.plateforme,
        timestamp: new Date().toISOString()
    };
}

// Fonction pour publier plusieurs publications en lot
async function publierEnLot(publicationIds) {
    if (!publicationIds || publicationIds.length === 0) {
        showNotification('❌ Aucune publication sélectionnée', 'error');
        return;
    }

    const confirmation = confirm(
        `📦 PUBLIER ${publicationIds.length} PUBLICATIONS ?\n\n` +
        `Cette action publiera immédiatement ${publicationIds.length} publications.\n` +
        `Êtes-vous sûr de vouloir continuer ?`
    );

    if (!confirmation) {
        return;
    }

    showNotification(`🔄 Publication de ${publicationIds.length} publications...`, 'info');

    let succes = 0;
    let echecs = 0;

    for (const id of publicationIds) {
        try {
            await publierMaintenant(id);
            succes++;
            
            // Pause entre les publications pour éviter le spam
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error(`Échec publication ${id}:`, error);
            echecs++;
        }
    }

    // Résumé final
    if (echecs === 0) {
        showNotification(`✅ Toutes les ${succes} publications ont été publiées avec succès !`, 'success');
    } else {
        showNotification(
            `📊 Résultat publication :\n` +
            `✅ ${succes} publications réussies\n` +
            `❌ ${echecs} publications échouées`,
            echecs === publicationIds.length ? 'error' : 'warning'
        );
    }
}

// Fonction pour reprogrammer une publication
function reprogrammerPublication(id, nouvelleDate) {
    const publication = calendrierEditorial.publications.find(p => p.id === id);
    
    if (!publication) {
        showNotification('❌ Publication non trouvée', 'error');
        return;
    }

    if (publication.statut === 'publiee') {
        showNotification('⚠️ Impossible de reprogrammer une publication déjà publiée', 'warning');
        return;
    }

    const ancienneDate = new Date(publication.datePublication).toLocaleString('fr-FR');
    const nouvelleDateStr = new Date(nouvelleDate).toLocaleString('fr-FR');

    const confirmation = confirm(
        `📅 REPROGRAMMER LA PUBLICATION ?\n\n` +
        `Ancienne date: ${ancienneDate}\n` +
        `Nouvelle date: ${nouvelleDateStr}\n\n` +
        `Confirmer la reprogrammation ?`
    );

    if (confirmation) {
        publication.datePublication = new Date(nouvelleDate).toISOString();
        calendrierEditorial.sauvegarderPublications();
        chargerAffichageCalendrier();
        showNotification('✅ Publication reprogrammée avec succès !', 'success');
    }
}

// Ajouter le CSS pour le spinner
const style = document.createElement('style');
style.textContent = `
    .spinner {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .publication-publiee {
        opacity: 0.7;
        background-color: #f8f9fa !important;
    }
    .publication-publiee .badge {
        background-color: #28a745 !important;
    }
`;
document.head.appendChild(style);

function supprimerPublication(id) {
    if (confirm('Supprimer cette publication ?')) {
        calendrierEditorial.publications = calendrierEditorial.publications.filter(p => p.id !== id);
        calendrierEditorial.sauvegarderPublications();
        chargerAffichageCalendrier();
        showNotification('🗑️ Publication supprimée', 'success');
    }
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', function() {
    // ... votre code existant ...
    
    // Initialiser le calendrier éditorial
    window.calendrierEditorial = new CalendrierEditorial();
    console.log('✅ Calendrier éditorial initialisé');
    
    // Charger l'affichage si on est sur la section calendrier
    if (document.getElementById('calendrier-editorial')?.style.display !== 'none') {
        chargerAffichageCalendrier();
    }
});

function afficherModalNouvellePublication() {
    console.log('📝 Ouverture modal nouvelle publication');
    
    const modalHTML = `
        <div class="modal fade" id="modalNouvellePublication" tabindex="-1" aria-labelledby="modalNouvellePublicationLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="modalNouvellePublicationLabel">
                            <i class="bi bi-plus-circle me-2"></i>Nouvelle Publication
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="formNouvellePublication">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Thème *</label>
                                    <select class="form-select" id="publication-theme" required>
                                        <option value="">Choisir un thème...</option>
                                        <option value="saisie">📄 Saisie de documents</option>
                                        <option value="design">🎨 Design graphique</option>
                                        <option value="promotion">🎉 Promotion/Offre</option>
                                        <option value="temoignage">⭐ Témoignage client</option>
                                        <option value="conseil">💡 Conseil expertise</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Ton *</label>
                                    <select class="form-select" id="publication-ton" required>
                                        <option value="professionnel">Professionnel</option>
                                        <option value="amical">Amical</option>
                                        <option value="enthousiaste">Enthousiaste</option>
                                    </select>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Public cible *</label>
                                    <select class="form-select" id="publication-public" required>
                                        <option value="entreprises">Entreprises</option>
                                        <option value="etudiants">Étudiants</option>
                                        <option value="professionnels">Professionnels</option>
                                        <option value="general">Grand public</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Date de publication *</label>
                                    <input type="datetime-local" class="form-control" id="publication-date" required>
                                </div>
                            </div>

                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <label class="form-label">Contenu de la publication *</label>
                                    <button type="button" class="btn btn-outline-primary btn-sm" onclick="genererContenuAvecIA()">
                                        <i class="bi bi-robot me-1"></i>Générer avec IA
                                    </button>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small">Accroche *</label>
                                    <input type="text" class="form-control" id="publication-accroche" 
                                           placeholder="Ex: 🎨 Votre image mérite le meilleur !" required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small">Message *</label>
                                    <textarea class="form-control" id="publication-message" rows="3" 
                                              placeholder="Ex: Logos, affiches, chartes graphiques... Donnez vie à vos projets !" required></textarea>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small">Call-to-action *</label>
                                    <input type="text" class="form-control" id="publication-cta" 
                                           placeholder="Ex: 💼 Demandez un devis gratuit !" required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small">Hashtags</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="publication-hashtags" 
                                               placeholder="Ex: #design #graphisme #logo">
                                        <button type="button" class="btn btn-outline-secondary" onclick="suggérerHashtags()">
                                            <i class="bi bi-lightbulb"></i>
                                        </button>
                                    </div>
                                    <div class="form-text">Séparez les hashtags par des espaces</div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Plateforme</label>
                                <select class="form-select" id="publication-plateforme">
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="linkedin">LinkedIn</option>
                                </select>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Notes internes</label>
                                <textarea class="form-control" id="publication-notes" rows="2" 
                                          placeholder="Notes pour l'équipe..."></textarea>
                            </div>
                        </form>

                        <!-- Prévisualisation en temps réel -->
                        <div class="card mt-4">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="bi bi-eye me-2"></i>Prévisualisation</h6>
                            </div>
                            <div class="card-body">
                                <div id="preview-publication" class="publication-preview">
                                    <p class="text-muted mb-0">La prévisualisation apparaîtra ici...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle me-1"></i>Annuler
                        </button>
                        <button type="button" class="btn btn-outline-primary" onclick="previsualiserPublicationComplete()">
                            <i class="bi bi-eye me-1"></i>Prévisualiser
                        </button>
                        <button type="button" class="btn btn-success" onclick="sauvegarderPublication()">
                            <i class="bi bi-save me-1"></i>Programmer la publication
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Supprimer l'ancien modal s'il existe
    const existingModal = document.getElementById('modalNouvellePublication');
    if (existingModal) {
        existingModal.remove();
    }

    // Ajouter le modal au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Initialiser les écouteurs d'événements
    initialiserEcouteursModalPublication();

    // Définir la date par défaut (demain à 9h)
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    demain.setHours(9, 0, 0, 0);
    document.getElementById('publication-date').value = demain.toISOString().slice(0, 16);

    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('modalNouvellePublication'));
    modal.show();
}

// Fonctions auxiliaires pour le modal
function initialiserEcouteursModalPublication() {
    // Mise à jour de la prévisualisation en temps réel
    const champs = ['publication-accroche', 'publication-message', 'publication-cta', 'publication-hashtags'];
    
    champs.forEach(champId => {
        const element = document.getElementById(champId);
        if (element) {
            element.addEventListener('input', mettreAJourPrevisualisation);
        }
    });
}

function mettreAJourPrevisualisation() {
    const accroche = document.getElementById('publication-accroche')?.value || '';
    const message = document.getElementById('publication-message')?.value || '';
    const cta = document.getElementById('publication-cta')?.value || '';
    const hashtags = document.getElementById('publication-hashtags')?.value || '';
    
    const preview = document.getElementById('preview-publication');
    if (!preview) return;
    
    if (!accroche && !message && !cta) {
        preview.innerHTML = '<p class="text-muted mb-0">La prévisualisation apparaîtra ici...</p>';
        return;
    }

    let html = '';
    
    if (accroche) {
        html += `<div class="mb-2"><strong class="text-primary">${accroche}</strong></div>`;
    }
    
    if (message) {
        html += `<div class="mb-2 small">${message.replace(/\n/g, '<br>')}</div>`;
    }
    
    if (cta) {
        html += `<div class="mb-2"><small class="text-success">${cta}</small></div>`;
    }
    
    if (hashtags) {
        const tagsArray = hashtags.split(' ').filter(tag => tag.trim() !== '');
        html += `<div class="hashtags mt-2">${tagsArray.map(tag => 
            `<span class="badge bg-light text-dark me-1">${tag}</span>`
        ).join('')}</div>`;
    }

    preview.innerHTML = html;
}

function genererContenuAvecIA() {
    const theme = document.getElementById('publication-theme')?.value;
    
    if (!theme) {
        alert('Veuillez d\'abord sélectionner un thème');
        return;
    }

    // Contenu prédéfini selon le thème
    const contenusParTheme = {
        'saisie': {
            accroche: "📄 Besoin d'une saisie de documents précise et rapide ?",
            message: "Confiez-nous vos documents à saisir et gagnez un temps précieux ! Notre équipe garantit une parfaite exactitude et un traitement professionnel de tous vos fichiers.",
            cta: "📩 Envoyez-nous vos documents dès maintenant !",
            hashtags: "#saisie #document #precision #gainDeTemps #professionnel"
        },
        'design': {
            accroche: "🎨 Votre image mérite le meilleur !",
            message: "Logos, affiches, chartes graphiques, supports de communication... Donnez vie à vos projets avec notre expertise en design graphique professionnel.",
            cta: "💼 Demandez un devis gratuit pour votre projet !",
            hashtags: "#design #graphisme #logo #creativite #branding"
        },
        'promotion': {
            accroche: "🎉 Offre spéciale cette semaine !",
            message: "Profitez de nos services à des tarifs préférentiels. Qualité professionnelle garantie pour tous vos projets de saisie et design.",
            cta: "⚡ Offre limitée - Contactez-nous vite !",
            hashtags: "#promotion #offre #special #qualite #service"
        },
        'temoignage': {
            accroche: "⭐ Nos clients témoignent !",
            message: "Découvrez les retours de nos clients satisfaits. Qualité, rapidité et professionnalisme sont au rendez-vous.",
            cta: "👥 Rejoignez nos clients satisfaits !",
            hashtags: "#temoignage #client #satisfaction #recommandation"
        },
        'conseil': {
            accroche: "💡 Besoin de conseils pour votre projet ?",
            message: "Notre équipe d'experts est à votre disposition pour vous accompagner dans tous vos projets de saisie et conception graphique.",
            cta: "📞 Contactez nos experts dès aujourd'hui !",
            hashtags: "#conseil #expertise #professionnel #accompagnement"
        }
    };

    const contenu = contenusParTheme[theme] || contenusParTheme['saisie'];
    
    // Remplir les champs
    document.getElementById('publication-accroche').value = contenu.accroche;
    document.getElementById('publication-message').value = contenu.message;
    document.getElementById('publication-cta').value = contenu.cta;
    document.getElementById('publication-hashtags').value = contenu.hashtags;
    
    // Mettre à jour la prévisualisation
    mettreAJourPrevisualisation();
    
    showNotification('✅ Contenu généré avec succès !', 'success');
}

function suggérerHashtags() {
    const theme = document.getElementById('publication-theme')?.value;
    
    const hashtagsParTheme = {
        'saisie': '#saisie #document #precision #professionnel #gainDeTemps',
        'design': '#design #graphisme #logo #creativite #branding',
        'promotion': '#promotion #offre #special #qualite #service',
        'temoignage': '#temoignage #client #satisfaction #recommandation',
        'conseil': '#conseil #expertise #professionnel #qualite'
    };

    const hashtags = hashtagsParTheme[theme] || '#service #professionnel #qualite';
    document.getElementById('publication-hashtags').value = hashtags;
    mettreAJourPrevisualisation();
}

function previsualiserPublicationComplete() {
    const accroche = document.getElementById('publication-accroche')?.value;
    const message = document.getElementById('publication-message')?.value;
    const cta = document.getElementById('publication-cta')?.value;
    const hashtags = document.getElementById('publication-hashtags')?.value;

    if (!accroche || !message || !cta) {
        alert('Veuillez remplir au moins l\'accroche, le message et le CTA');
        return;
    }

    const previewHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Prévisualisation Publication</title>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 40px;
                    background: #f0f2f5;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .publication {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
                }
                .accroche { 
                    font-size: 18px; 
                    font-weight: bold; 
                    margin-bottom: 15px;
                    color: #1d1d1d;
                    line-height: 1.4;
                }
                .message { 
                    margin-bottom: 15px; 
                    line-height: 1.5;
                    color: #1d1d1d;
                    font-size: 14px;
                }
                .cta { 
                    color: #1877f2; 
                    font-weight: bold;
                    margin-bottom: 15px;
                    font-size: 14px;
                }
                .hashtags { 
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid #e4e6ea;
                }
                .badge {
                    background: #f0f2f5;
                    color: #65676b;
                    padding: 6px 10px;
                    border-radius: 12px;
                    margin-right: 8px;
                    margin-bottom: 5px;
                    font-size: 13px;
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            <div class="publication">
                <div class="accroche">${accroche}</div>
                <div class="message">${message.replace(/\n/g, '<br>')}</div>
                <div class="cta">${cta}</div>
                <div class="hashtags">
                    ${hashtags.split(' ').filter(tag => tag.trim() !== '').map(tag => 
                        `<span class="badge">${tag}</span>`
                    ).join('')}
                </div>
            </div>
        </body>
        </html>
    `;

    const previewWindow = window.open('', '_blank', 'width=600,height=500');
    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
}

function sauvegarderPublication() {
    // Récupérer les valeurs du formulaire
    const theme = document.getElementById('publication-theme')?.value;
    const ton = document.getElementById('publication-ton')?.value;
    const publicCible = document.getElementById('publication-public')?.value;
    const datePublication = document.getElementById('publication-date')?.value;
    const accroche = document.getElementById('publication-accroche')?.value;
    const message = document.getElementById('publication-message')?.value;
    const cta = document.getElementById('publication-cta')?.value;
    const hashtags = document.getElementById('publication-hashtags')?.value;
    const plateforme = document.getElementById('publication-plateforme')?.value;
    const notes = document.getElementById('publication-notes')?.value;

    // Validation
    if (!theme || !datePublication || !accroche || !message || !cta) {
        alert('Veuillez remplir tous les champs obligatoires (*)');
        return;
    }

    // Créer l'objet publication
    const nouvellePublication = {
        id: Date.now(),
        titre: `Publication ${theme} - ${new Date(datePublication).toLocaleDateString('fr-FR')}`,
        theme: theme,
        ton: ton,
        publicCible: publicCible,
        contenu: {
            accroche: accroche,
            message: message,
            cta: cta,
            hashtags: hashtags.split(' ').filter(tag => tag.trim() !== '')
        },
        datePublication: new Date(datePublication).toISOString(),
        dateCreation: new Date().toISOString(),
        statut: 'programmee',
        plateforme: plateforme,
        notes: notes || ''
    };

    // Vérifier que calendrierEditorial existe
    if (typeof calendrierEditorial === 'undefined') {
        alert('Erreur: Le système de calendrier n\'est pas initialisé');
        return;
    }

    // Sauvegarder la publication
    calendrierEditorial.ajouterPublication(nouvellePublication);

    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalNouvellePublication'));
    if (modal) {
        modal.hide();
    }

    // Recharger l'affichage si on est sur la section calendrier
    if (typeof chargerAffichageCalendrier === 'function') {
        chargerAffichageCalendrier();
    }

    // Notification de succès
    showNotification('✅ Publication programmée avec succès !', 'success');
    
    console.log('Nouvelle publication créée:', nouvellePublication);
}

function exporterCalendrier() {
    console.log('📤 Export du calendrier');
    
    // Vérifier qu'il y a des publications à exporter
    const publications = calendrierEditorial.getProchainesPublications(90);
    
    if (publications.length === 0) {
        alert('Aucune publication à exporter pour le moment.');
        return;
    }

    // Afficher un modal de choix du format d'export
    const modalHTML = `
        <div class="modal fade" id="modalExportCalendrier" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-download me-2"></i>Exporter le Calendrier
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Format d'export</label>
                            <select class="form-select" id="format-export">
                                <option value="pdf">📄 PDF (Rapport détaillé)</option>
                                <option value="csv">📊 CSV (Tableur Excel)</option>
                                <option value="json">🔧 JSON (Données brutes)</option>
                                <option value="ical">📅 Calendrier (iCal)</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Période</label>
                            <select class="form-select" id="periode-export">
                                <option value="30">30 prochains jours</option>
                                <option value="90" selected>3 prochains mois</option>
                                <option value="180">6 prochains mois</option>
                                <option value="365">1 an</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Inclure</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="include-contenu" checked>
                                <label class="form-check-label" for="include-contenu">
                                    Contenu des publications
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="include-hashtags" checked>
                                <label class="form-check-label" for="include-hashtags">
                                    Hashtags
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="include-statistiques" checked>
                                <label class="form-check-label" for="include-statistiques">
                                    Statistiques
                                </label>
                            </div>
                        </div>
                        
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            <strong>${publications.length} publications</strong> seront exportées
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-success" onclick="lancerExport()">
                            <i class="bi bi-download me-2"></i>Exporter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Supprimer l'ancien modal s'il existe
    const existingModal = document.getElementById('modalExportCalendrier');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = new bootstrap.Modal(document.getElementById('modalExportCalendrier'));
    modal.show();
}

function lancerExport() {
    const format = document.getElementById('format-export').value;
    const periode = parseInt(document.getElementById('periode-export').value);
    const includeContenu = document.getElementById('include-contenu').checked;
    const includeHashtags = document.getElementById('include-hashtags').checked;
    const includeStatistiques = document.getElementById('include-statistiques').checked;

    // Récupérer les publications selon la période
    const publications = calendrierEditorial.getProchainesPublications(periode);
    
    if (publications.length === 0) {
        alert('Aucune publication à exporter pour cette période.');
        return;
    }

    // Lancer l'export selon le format choisi
    switch(format) {
        case 'pdf':
            exporterPDF(publications, includeContenu, includeHashtags, includeStatistiques);
            break;
        case 'csv':
            exporterCSV(publications, includeContenu, includeHashtags);
            break;
        case 'json':
            exporterJSON(publications);
            break;
        case 'ical':
            exporterICal(publications);
            break;
    }

    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalExportCalendrier'));
    modal.hide();
}

function exporterPDF(publications, includeContenu, includeHashtags, includeStatistiques) {
    console.log('📄 Génération du PDF...');
    
    let contenuHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Calendrier Éditorial - Multi-Services Numériques</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px;
                    color: #333;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 3px solid #2c3e50;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 { 
                    color: #2c3e50; 
                    margin: 0; 
                }
                .header .subtitle { 
                    color: #7f8c8d; 
                    font-size: 16px;
                }
                .stats { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .publication { 
                    margin-bottom: 25px; 
                    padding: 15px;
                    border-left: 4px solid #3498db;
                    background: #f8f9fa;
                }
                .publication-date { 
                    font-weight: bold; 
                    color: #2c3e50;
                    margin-bottom: 8px;
                }
                .publication-theme { 
                    background: #3498db; 
                    color: white; 
                    padding: 2px 8px; 
                    border-radius: 12px;
                    font-size: 12px;
                    display: inline-block;
                    margin-right: 8px;
                }
                .publication-accroche { 
                    font-weight: bold; 
                    margin: 8px 0;
                    color: #2c3e50;
                }
                .publication-message { 
                    margin: 8px 0; 
                    line-height: 1.4;
                }
                .publication-cta { 
                    color: #27ae60; 
                    font-weight: bold;
                    margin: 8px 0;
                }
                .hashtags { 
                    margin-top: 8px;
                }
                .hashtag { 
                    background: #e9ecef; 
                    padding: 2px 6px; 
                    border-radius: 8px;
                    font-size: 11px;
                    margin-right: 4px;
                    display: inline-block;
                }
                .footer { 
                    text-align: center; 
                    margin-top: 40px;
                    color: #7f8c8d;
                    font-size: 12px;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                .page-break { 
                    page-break-after: always; 
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📅 Calendrier Éditorial</h1>
                <div class="subtitle">Multi-Services Numériques</div>
                <div class="subtitle">Généré le ${new Date().toLocaleDateString('fr-FR')}</div>
            </div>
    `;

    // Ajouter les statistiques si demandé
    if (includeStatistiques) {
        const stats = genererStatistiquesExport(publications);
        contenuHTML += `
            <div class="stats">
                <h3>📊 Statistiques</h3>
                <p><strong>Période :</strong> ${stats.periode}</p>
                <p><strong>Total publications :</strong> ${stats.total}</p>
                <p><strong>Prochaine publication :</strong> ${stats.prochaine}</p>
                <p><strong>Répartition par thème :</strong> ${stats.repartition}</p>
            </div>
        `;
    }

    // Ajouter les publications
    publications.forEach((pub, index) => {
        const datePub = new Date(pub.datePublication);
        
        contenuHTML += `
            <div class="publication">
                <div class="publication-date">
                    ${datePub.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
                    à ${datePub.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div>
                    <span class="publication-theme">${pub.theme}</span>
                    <small>${pub.publicCible} • ${pub.plateforme}</small>
                </div>
        `;

        if (includeContenu) {
            contenuHTML += `
                <div class="publication-accroche">${pub.contenu.accroche}</div>
                <div class="publication-message">${pub.contenu.message}</div>
                <div class="publication-cta">${pub.contenu.cta}</div>
            `;
        }

        if (includeHashtags && pub.contenu.hashtags.length > 0) {
            contenuHTML += `
                <div class="hashtags">
                    ${pub.contenu.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                </div>
            `;
        }

        contenuHTML += `</div>`;

        // Ajouter un saut de page tous les 10 éléments
        if ((index + 1) % 10 === 0) {
            contenuHTML += `<div class="page-break"></div>`;
        }
    });

    contenuHTML += `
            <div class="footer">
                Document généré automatiquement par Multi-Services Numériques<br>
                Tél: +261 34 396 77 44 | Email: multi.snumerique@gmail.com
            </div>
        </body>
        </html>
    `;

    // Ouvrir dans une nouvelle fenêtre pour impression
    const printWindow = window.open('', '_blank');
    printWindow.document.write(contenuHTML);
    printWindow.document.close();
    
    // Attendre le chargement puis proposer l'impression
    printWindow.onload = function() {
        printWindow.print();
    };
    
    showNotification('📄 PDF généré avec succès !', 'success');
}

function exporterCSV(publications, includeContenu, includeHashtags) {
    console.log('📊 Génération du CSV...');
    
    let csvContent = "Date;Heure;Thème;Public;Plateforme;Accroche;Message;CTA;Hashtags;Statut\n";
    
    publications.forEach(pub => {
        const datePub = new Date(pub.datePublication);
        const date = datePub.toLocaleDateString('fr-FR');
        const heure = datePub.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        // Échapper les caractères spéciaux pour CSV
        const escapeCSV = (str) => `"${(str || '').replace(/"/g, '""')}"`;
        
        let ligne = [
            date,
            heure,
            pub.theme,
            pub.publicCible,
            pub.plateforme,
            includeContenu ? escapeCSV(pub.contenu.accroche) : '',
            includeContenu ? escapeCSV(pub.contenu.message) : '',
            includeContenu ? escapeCSV(pub.contenu.cta) : '',
            includeHashtags ? escapeCSV(pub.contenu.hashtags.join(' ')) : '',
            pub.statut
        ].join(';');
        
        csvContent += ligne + '\n';
    });
    
    // Créer et télécharger le fichier
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `calendrier_editorial_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('📊 CSV exporté avec succès !', 'success');
}

function exporterJSON(publications) {
    console.log('🔧 Génération du JSON...');
    
    const data = {
        meta: {
            exportDate: new Date().toISOString(),
            totalPublications: publications.length,
            periode: "3 prochains mois",
            version: "1.0"
        },
        publications: publications
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `calendrier_editorial_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('🔧 JSON exporté avec succès !', 'success');
}

function exporterICal(publications) {
    console.log('📅 Génération du fichier iCal...');
    
    let icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Multi-Services Numériques//Calendrier Éditorial//FR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ].join('\n') + '\n';
    
    publications.forEach(pub => {
        const dateDebut = new Date(pub.datePublication);
        const dateFin = new Date(dateDebut.getTime() + 60 * 60 * 1000); // +1 heure
        
        const formatDateICal = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        icalContent += [
            'BEGIN:VEVENT',
            `UID:${pub.id}@multiservices-numeriques.com`,
            `DTSTAMP:${formatDateICal(new Date())}`,
            `DTSTART:${formatDateICal(dateDebut)}`,
            `DTEND:${formatDateICal(dateFin)}`,
            `SUMMARY:Publication ${pub.theme} - ${pub.plateforme}`,
            `DESCRIPTION:${pub.contenu.accroche}\\n\\n${pub.contenu.message}\\n\\n${pub.contenu.cta}`,
            `LOCATION:${pub.plateforme}`,
            `STATUS:CONFIRMED`,
            'END:VEVENT'
        ].join('\n') + '\n';
    });
    
    icalContent += 'END:VCALENDAR';
    
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `calendrier_editorial_${new Date().toISOString().split('T')[0]}.ics`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('📅 Calendrier iCal exporté avec succès !', 'success');
}

function genererStatistiquesExport(publications) {
    const maintenant = new Date();
    const prochainePub = publications
        .filter(p => new Date(p.datePublication) > maintenant)
        .sort((a, b) => new Date(a.datePublication) - new Date(b.datePublication))[0];
    
    // Compter par thème
    const themes = {};
    publications.forEach(pub => {
        themes[pub.theme] = (themes[pub.theme] || 0) + 1;
    });
    
    const repartition = Object.entries(themes)
        .map(([theme, count]) => `${theme}: ${count}`)
        .join(', ');
    
    return {
        periode: `${publications.length > 0 ? 
            `Du ${new Date(publications[0].datePublication).toLocaleDateString('fr-FR')} au ${new Date(publications[publications.length-1].datePublication).toLocaleDateString('fr-FR')}` : 
            'Aucune période'}`,
        total: publications.length,
        prochaine: prochainePub ? 
            `${new Date(prochainePub.datePublication).toLocaleDateString('fr-FR')} (${prochainePub.theme})` : 
            'Aucune',
        repartition: repartition
    };
}

// Initialisation du calendrier éditorial


// Initialisation globale
const calendrierEditorial = new CalendrierEditorial();
// ===== EXPOSITION DES FONCTIONS GLOBALES =====
// ===== EXPOSITION DES FONCTIONS GLOBALES =====
// ... autres fonctions existantes ...

// ===== EXPOSITION FONCTIONS UNIFIÉES =====

window.referenceManager = referenceManager;
window.creerNouvelleCommande = creerNouvelleCommande;
window.convertirDevisEnFacture = convertirDevisEnFacture;
window.genererDevisDashboard = genererDevisDashboard;
window.genererFactureDashboard = genererFactureDashboard;
window.afficherModalPaiement = afficherModalPaiement;
window.toggleReferencePaiement = toggleReferencePaiement;
window.enregistrerPaiement = enregistrerPaiement;
window.genererFactureAvecPaiement = genererFactureAvecPaiement;
window.creerBadgeStatistiquesUnifie = creerBadgeStatistiquesUnifie;
window.afficherStatistiquesCompletes = afficherStatistiquesCompletes;

// Remplacer l'ancien badge
window.creerBadgeStatistiques = creerBadgeStatistiquesUnifie;
window.ajouterNouvelleCommande = ajouterNouvelleCommande;
window.ajouterService = ajouterService;
window.supprimerService = supprimerService;
window.calculerTotalNouvelleCommande = calculerTotalNouvelleCommande;
window.sauvegarderNouvelleCommande = sauvegarderNouvelleCommande;
window.supprimerCommande = supprimerCommande;
window.modifierCommande = modifierCommande;
window.ajouterServiceModifier = ajouterServiceModifier;
window.calculerTotalModification = calculerTotalModification;
window.sauvegarderModificationCommande = sauvegarderModificationCommande;
window.initialiserGestionFichiers = initialiserGestionFichiers;
window.gererSelectionFichiers = gererSelectionFichiers;
window.supprimerFichier = supprimerFichier;
window.ajouterLienFichier = ajouterLienFichier;
window.supprimerLien = supprimerLien;
// ... suite ...
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