document.addEventListener("DOMContentLoaded", function() {
    var nomRecetteInput = document.getElementById("nomRecette");
    var ingredientsTextarea = document.getElementById("ingredients");
    var ajouterRecetteBtn = document.getElementById("ajouterRecette");
    var listeRecettesContainer = document.getElementById("listeRecettes");
    var recetteSelectionneeContainer = document.getElementById("recetteSelectionnee");
    var validerCommandeContainer = document.getElementById("validerCommandeContainer");
    var recettesEnCours = {}; // Un objet pour stocker les recettes en cours avec une clé unique

    ajouterRecetteBtn.addEventListener("click", function() {
        var nomRecette = nomRecetteInput.value.trim();
        var ingredients = ingredientsTextarea.value.trim();

        if (nomRecette !== "" && ingredients !== "") {
            // Trouvez le plus grand index utilisé pour les clés "recette"
            var plusGrandIndex = 0;

            for (var i = 0; i < localStorage.length; i++) {
                var cle = localStorage.key(i);

                if (cle.startsWith("recette")) {
                    var index = parseInt(cle.replace("recette", ""), 10);
                    if (index > plusGrandIndex) {
                        plusGrandIndex = index;
                    }
                }
            }

            // Incrémente l'index pour la nouvelle recette
            var nouvelIndex = plusGrandIndex + 1;

            // Créez un objet pour stocker les informations de la recette
            var recette = {
                nom: nomRecette,
                ingredients: ingredients
            };

            // Convertissez l'objet en chaîne JSON
            var recetteJSON = JSON.stringify(recette);

            // Stockez la chaîne JSON dans le cache sous une clé unique basée sur l'index
            localStorage.setItem("recette" + nouvelIndex, recetteJSON);

            // Affichez un message de confirmation
            alert("Recette ajoutée avec succès!");

            // Effacez les champs du formulaire
            nomRecetteInput.value = "";
            ingredientsTextarea.value = "";

            // Actualisez la liste des recettes
            afficherToutesRecettes();
        } else {
            alert("Veuillez remplir tous les champs.");
        }
    });

    // Fonction pour afficher toutes les recettes
    function afficherToutesRecettes() {
        // Effacez le contenu précédent du conteneur
        listeRecettesContainer.innerHTML = "";

        // Parcourez toutes les clés du cache
        for (var i = 0; i < localStorage.length; i++) {
            var cle = localStorage.key(i);

            if (cle.startsWith("recette")) {
                // Obtenez la valeur associée à la clé
                var recetteJSON = localStorage.getItem(cle);

                // Parsez la valeur JSON en objet JavaScript
                var recette = JSON.parse(recetteJSON);

                // Créez un élément HTML pour afficher la recette
                var recetteElement = document.createElement("div");
                recetteElement.innerHTML = `
                    <strong>Nom de la recette:</strong> ${recette.nom} <br>
                    <strong>Ingrédients:</strong> ${recette.ingredients} <br>
                    <button type="button" class="btn btn-danger" onclick="supprimerRecette('${cle}')">Supprimer</button>
                    <button type="button" class="btn btn-success" onclick="lancerEnCuisine('${recette.nom}', '${cle}')">Lancer en cuisine</button>
                    <select class="form-select" id="selectRecette${cle}" aria-label="Sélectionner une option">
                        <option selected disabled>Choisir une option</option>
                        <option value="Rien">Rien</option>
                        <option value="Blanche">Blanche</option>
                        <option value="Algérienne">Algérienne</option>
                        <option value="Mayonaise">Mayonaise</option>
                        <option value="Moutarde">Moutarde</option>
                        <option value="Ketchup">Ketchup</option>
                        <option value="BBQ">BBQ</option>
                        <option value="Nature">Nature</option>
                        <option value="Comme d'hab chef">Comme d'hab chef</option>
                    </select>
                    <hr>
                `;

                // Ajoutez l'élément au conteneur
                listeRecettesContainer.appendChild(recetteElement);
            }
        }
    }

    // Fonction pour supprimer une recette
    window.supprimerRecette = function(cleRecette) {
        // Supprimez la recette du cache en utilisant la clé
        localStorage.removeItem(cleRecette);

        // Supprimez la recette en cours s'il existe
        delete recettesEnCours[cleRecette];

        // Actualisez la liste des recettes
        afficherToutesRecettes();
    };

    // Fonction pour lancer une recette en cuisine
    window.lancerEnCuisine = function(nomRecette, cleRecette) {
        // Obtenez la valeur sélectionnée dans la liste déroulante
        var selectElement = document.getElementById("selectRecette" + cleRecette);
        var selectedOption = selectElement.value;

        // Vérifiez si une option a été sélectionnée
        if (selectedOption) {
            // Ajoutez la recette en cours au tableau avec une clé unique
            recettesEnCours[cleRecette] = {
                nom: nomRecette,
                categorie: selectedOption
            };

            // Actualisez l'affichage des recettes en cours
            afficherRecettesEnCours();
        } else {
            alert("Veuillez choisir une option avant de lancer la recette en cuisine.");
        }
    };

    // Fonction pour afficher les recettes en cours
    function afficherRecettesEnCours() {
        // Effacez le contenu précédent du conteneur
        recetteSelectionneeContainer.innerHTML = "";

        for (var cleRecette in recettesEnCours) {
            var recetteEnCours = recettesEnCours[cleRecette];

            var recetteEnCoursElement = document.createElement("div");
            recetteEnCoursElement.innerHTML = `
                <strong>Nom de la recette:</strong> ${recetteEnCours.nom} <br>
                <strong>Catégorie:</strong> ${recetteEnCours.categorie} <br>
                <button type="button" class="btn btn-primary" onclick="validerCommande('${cleRecette}')">Valider la commande</button>
                <hr>
            `;

            recetteSelectionneeContainer.appendChild(recetteEnCoursElement);
        }
    }

    window.validerCommande = function(cleRecette) {
        delete recettesEnCours[cleRecette];

        afficherRecettesEnCours();

        alert("Commande validée!");
    };

    afficherToutesRecettes();
});