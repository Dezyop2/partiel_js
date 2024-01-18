document.addEventListener("DOMContentLoaded", function () {
    var nomRecetteInput = document.getElementById("nomRecette");
    var ingredientsTextarea = document.getElementById("ingredients");
    var ajouterRecetteBtn = document.getElementById("ajouterRecette");
    var listeRecettesContainer = document.getElementById("listeRecettes");
    var recetteSelectionneeContainer = document.getElementById("recetteSelectionnee");
    var validerCommandeContainer = document.getElementById("validerCommandeContainer");
    var recettesEnCours = {};
    var debutsRecettesEnCours = {};

    ajouterRecetteBtn.addEventListener("click", function () {
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
                listeRecettesContainer.appendChild(recetteElement);
            }
        }
    }

    window.supprimerRecette = function (cleRecette) {
        if (recettesEnCours[cleRecette]) {
            // Arrêtez le processus de mise à jour du temps écoulé pour la recette spécifique
            clearInterval(debutsRecettesEnCours[cleRecette]);

            delete recettesEnCours[cleRecette];

            afficherRecettesEnCours();
        }

        localStorage.removeItem(cleRecette);

        afficherToutesRecettes();
    };

    window.lancerEnCuisine = function (nomRecette, cleRecette) {
        var selectElement = document.getElementById("selectRecette" + cleRecette);
        var selectedOption = selectElement.value;

        // Récupérez l'élément du temps écoulé spécifique à la recette
        var tempsEcouleElement = document.getElementById("tempsEcouleRecette" + cleRecette);

        // Arrêtez le processus de mise à jour du temps écoulé s'il existait déjà
        clearInterval(debutsRecettesEnCours[cleRecette]);

        // Enregistrez le timestamp de début de la recette
        debutsRecettesEnCours[cleRecette] = Date.now();

        // Lancez la fonction de mise à jour du temps écoulé
        updateTempsEcoule(tempsEcouleElement, cleRecette);

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

    // Fonction pour mettre à jour le temps écoulé pour une recette spécifique
    function updateTempsEcoule(tempsEcouleElement, cleRecette) {
        // Mettez à jour le temps écoulé spécifique à la recette toutes les secondes
        setInterval(function () {
            // Récupérez l'heure actuelle de l'API de temps
            fetch("https://worldtimeapi.org/api/timezone/Europe/Paris")
                .then(response => response.json())
                .then(data => {
                    // Calculez la différence de temps entre maintenant et le début de la recette
                    var differenceTemps = Date.now() - debutsRecettesEnCours[cleRecette];

                    // Ajoutez le décalage horaire à la différence de temps pour obtenir l'heure actuelle
                    var heureActuelle = new Date(data.datetime).getTime() + data.raw_offset * 1000;

                    // Calculez le temps écoulé en minutes et secondes
                    var tempsEcoule = new Date(heureActuelle - differenceTemps);

                    // Mettez en forme les minutes et les secondes avec deux chiffres
                    var minutes = tempsEcoule.getUTCMinutes();
                    var secondes = tempsEcoule.getUTCSeconds();
                    var formatTemps = padZero(minutes) + "m" + padZero(secondes) + "s";

                    // Mettez à jour le contenu de l'élément du temps écoulé spécifique à la recette
                    tempsEcouleElement.innerText = formatTemps;
                })
                .catch(error => console.error("Erreur lors de la récupération de l'heure actuelle :", error));
        }, 1000); // Mettez à jour toutes les secondes
    }

    // Fonction pour ajouter un zéro devant les chiffres inférieurs à 10
    function padZero(nombre) {
        return nombre < 10 ? "0" + nombre : nombre;
    }

    // Fonction pour afficher toutes les recettes en cours de préparation
    function afficherRecettesEnCours() {
        recetteSelectionneeContainer.innerHTML = "";

        // Parcourez toutes les clés du cache
        for (var cleRecette in recettesEnCours) {
            var recetteEnCours = recettesEnCours[cleRecette];

            // Obtenez la valeur associée à la clé de recette
            var recetteJSON = localStorage.getItem(cleRecette);

            // Parsez la valeur JSON en objet JavaScript
            var recette = JSON.parse(recetteJSON);

            // Créez un élément HTML pour afficher la recette en cours de préparation
            var recetteEnCoursElement = document.createElement("div");
            recetteEnCoursElement.innerHTML = `
                <strong>Nom de la recette:</strong> ${recetteEnCours.nom} <br>
                <strong>Catégorie:</strong> ${recetteEnCours.categorie} <br>
                <div id="tempsEcouleRecette${cleRecette}">00m00s</div> <br>
                <button type="button" class="btn btn-primary" onclick="validerCommande('${cleRecette}')">Valider la commande</button>
                <hr>
            `;

            // Ajoutez l'élément au conteneur
            recetteSelectionneeContainer.appendChild(recetteEnCoursElement);

            // Lancez la fonction de mise à jour du temps écoulé
            updateTempsEcoule(document.getElementById("tempsEcouleRecette" + cleRecette), cleRecette);
        }
    }

    window.validerCommande = function (cleRecette) {
        // Arrêtez le processus de mise à jour du temps écoulé pour la recette spécifique
        clearInterval(debutsRecettesEnCours[cleRecette]);

        delete recettesEnCours[cleRecette];

        afficherRecettesEnCours();

        alert("Commande validée!");
    };

    afficherToutesRecettes();
    afficherRecettesEnCours();
});
