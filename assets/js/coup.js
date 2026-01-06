function chargerCommandes(filtre = 'toutes') {
    let commandes = dataManager.getCommandes();
    
  
    
    // AJOUT: En-tête avec sélection multiple
    const headerSelection = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="select-all-commandes">
                <label class="form-check-label fw-bold" for="select-all-commandes">
                    Sélectionner tout
                </label>
            </div>
            <div id="actions-rapides-commandes">
                <!-- Actions rapides apparaîtront ici quand des commandes sont sélectionnées -->
            </div>
        </div>
    `;
    
    if (commandes.length === 0) {
        // Affichage vide existant...
    } else {
        container.innerHTML = headerSelection + `
            <div class="table-responsive-custom">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th width="5%">#</th>
                            <th>Référence</th>
                            <th>Client</th>
                            <th>Contact</th>
                            <th>Services</th>
                            <th>Montant</th>
                            <th>Statut</th>
                            <th>Paiement</th>
                            <th>Livraison</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${commandes.map(commande => {
                            const statutLivraison = commande.livraison || 'non_defini';
                            const badgesLivraison = {
                                'non_defini': '<span class="badge bg-secondary">Non défini</span>',
                                'en_preparation': '<span class="badge bg-warning">En préparation</span>',
                                'pret_livraison': '<span class="badge bg-info">Prêt livraison</span>',
                                'livre': '<span class="badge bg-success">Livré</span>'
                            };
                            
                            return `
                                <tr>
                                    <td>
                                        <input type="checkbox" class="form-check-input commande-checkbox" 
                                               data-id="${commande.id}">
                                    </td>
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
                                        <select onchange="changerLivraison(${commande.id}, this.value)" class="form-control form-control-sm">
                                            <option value="non_defini" ${statutLivraison === 'non_defini' ? 'selected' : ''}>Non défini</option>
                                            <option value="en_preparation" ${statutLivraison === 'en_preparation' ? 'selected' : ''}>En préparation</option>
                                            <option value="pret_livraison" ${statutLivraison === 'pret_livraison' ? 'selected' : ''}>Prêt livraison</option>
                                            <option value="livre" ${statutLivraison === 'livre' ? 'selected' : ''}>Livré</option>
                                        </select>
                                    </td>
                                    <td>${new Date(commande.dateCreation).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        <div class="actions-grid">
                                            <!-- Actions existantes... -->
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Initialiser la sélection
        setTimeout(initialiserSelectionCommandes, 100);
    }
}

// Fonction pour changer la livraison individuelle
function changerLivraison(idCommande, nouvelleLivraison) {
    if (dataManager.mettreAJourCommande(idCommande, { livraison: nouvelleLivraison })) {
        actualiserDonnees();
        showNotification('Statut livraison mis à jour', 'success');
    }
}