// offcanvas-navbar.js - Version sécurisée
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initialisation de la navigation offcanvas...');
    
    // Vérifier que Bootstrap est chargé
    if (typeof bootstrap === 'undefined') {
        console.warn('⚠️ Bootstrap non détecté');
        return;
    }
    
    // Vérifier que l'élément existe
    const offcanvasElement = document.getElementById('offcanvasNavbar');
    
    if (offcanvasElement) {
        try {
            offcanvasElement.addEventListener('hidden.bs.offcanvas', function () {
                console.log('📱 Offcanvas fermé');
            });
            
            console.log('✅ Navigation offcanvas initialisée');
        } catch (error) {
            console.error('❌ Erreur avec l\'offcanvas:', error);
        }
    } else {
        console.log('ℹ️ Aucun offcanvas trouvé, continuation sans...');
    }
});