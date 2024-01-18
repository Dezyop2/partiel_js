document.addEventListener("DOMContentLoaded", function() {
    var nomRecetteInput = document.getElementById("nomRecette");
    var ingredientsTextarea = document.getElementById("ingredients");
    var ajouterRecetteBtn = document.getElementById("ajouterRecette");
    var listeRecettesContainer = document.getElementById("listeRecettes");
    var recetteSelectionneeContainer = document.getElementById("recetteSelectionnee");
    var validerCommandeContainer = document.getElementById("validerCommandeContainer");
    var recettesEnCours = {};

    ajouterRecetteBtn.addEventListener("click", function() {
        var nomRecette = nomRecetteInput.value.trim();
        var ingredients = ingredientsTextarea.value.trim();

        if (nomRecette !== "" && ingredients !== "") {
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

            var nouvelIndex = plusGrandIndex + 1;

            var recette = {
                nom: nomRecette,
                ingredients: ingredients
            };

            var recetteJSON = JSON.stringify(recette);

            localStorage.setItem("recette" + nouvelIndex, recetteJSON);

            alert("Recette ajoutée avec succès!");

            nomRecetteInput.value = "";
            ingredientsTextarea.value = "";

            afficherToutesRecettes();
        } else {
            alert("Veuillez remplir tous les champs.");
        }
    });

    function afficherToutesRecettes() {
        listeRecettesContainer.innerHTML = "";

        for (var i = 0; i < localStorage.length; i++) {
            var cle = localStorage.key(i);

            if (cle.startsWith("recette")) {
                var recetteJSON = localStorage.getItem(cle);

                var recette = JSON.parse(recetteJSON);

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
                listeRecettesContainer.appendChild(recetteElement);
            }
        }
    }

    window.supprimerRecette = function(cleRecette) {
        localStorage.removeItem(cleRecette);

        delete recettesEnCours[cleRecette];

        afficherToutesRecettes();
    };

    window.lancerEnCuisine = function(nomRecette, cleRecette) {
        var selectElement = document.getElementById("selectRecette" + cleRecette);
        var selectedOption = selectElement.value;

        if (selectedOption) {
            recettesEnCours[cleRecette] = {
                nom: nomRecette,
                categorie: selectedOption
            };

            afficherRecettesEnCours();
        } else {
            alert("Veuillez choisir une option avant de lancer la recette en cuisine.");
        }
    };

    function afficherRecettesEnCours() {
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