<p align="center">
  <img src="assets/banner/mail-aura-banner-fr.webp" width="100%" alt="Mail Aura — Vérificateur d'e-mails et nettoyeur de listes" />
</p>

<h1 align="center">Mail Aura — Vérificateur d'e-mails et nettoyeur de listes</h1>

<p align="center">Vérifiez les adresses e-mail auprès de huit sources publiques gratuites, nettoyez les longues listes en un clic et exportez les résultats au format CSV — sans clé d'API, sans compte et sans approximation. L'interface est disponible en huit langues, dont l'arabe intégral en RTL.</p>

<p align="center">
  <a href="https://github.com/el9a7rawi/Mail-Aura/releases"><img src="https://img.shields.io/github/v/release/el9a7rawi/Mail-Aura?color=4f46e5" alt="Dernière version" /></a>
  <a href="https://github.com/el9a7rawi/Mail-Aura/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-E8710A" alt="Apache 2.0" /></a>
  <a href="https://github.com/el9a7rawi/Mail-Aura/pulls"><img src="https://img.shields.io/badge/PRs-Welcome-22C55E" alt="PRs bienvenues" /></a>
  <a href="https://developer.chrome.com/docs/extensions"><img src="https://img.shields.io/badge/Manifest-V3-4285F4" alt="Manifest V3" /></a>
  <img src="https://img.shields.io/badge/8_Languages-7c3aed" alt="8 langues" />
  <img src="https://img.shields.io/badge/Works-Offline-059669" alt="Fonctionne hors ligne" />
</p>

<p align="center">
  <sub><b>Langues :</b> <a href="README.md">English</a> · <a href="README.es.md">Español</a> · <a href="README.fr.md"><b>Français</b></a> · <a href="README.de.md">Deutsch</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.zh-CN.md">中文（简体）</a></sub>
</p>
<h3 align="center">Download for your browser — click the icon</h3>

<div align="center">

| [<img src="assets/browsers/chrome.svg" width="52" alt="Chrome" /><br><b>Chrome</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/edge.svg" width="52" alt="Edge" /><br><b>Edge</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/firefox.svg" width="52" alt="Firefox" /><br><b>Firefox</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/brave.svg" width="52" alt="Brave" /><br><b>Brave</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/opera.svg" width="52" alt="Opera" /><br><b>Opera</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) |
|---|---|---|---|---|

</div>

---

## 1. Pourquoi Mail Aura ?

<div align="center">

| Sans Mail Aura | Avec Mail Aura |
|---|---|
| Deviner d'après le seul format | Huit sources indépendantes et des signaux locaux |
| Des listes collées pleines de doublons | Doublons supprimés avant la vérification |
| Nettoyage manuel du CSV | Import et export CSV en un clic |
| Un badge 100 % qui ne veut rien dire | Un score honnête plafonné à 88 % pour les adresses valides |

</div>

Aucun service public ne peut prouver qu'une boîte mail donnée existe sans envoyer un e-mail réel. Mail Aura affiche donc un **score de confiance**, et non une garantie.

---

## 2. Comment ça marche — trois étapes

1. **Choisissez une source** — analysez la page en cours, collez une liste ou chargez un fichier CSV.
2. **Vérifiez** — les adresses sont vérifiées en parallèle auprès de huit services gratuits et mises en cache par domaine.
3. **Agissez** — copiez les adresses valides, corrigez les fautes de frappe en un clic ou exportez tout au format CSV.

---

## 3. Présentation de l'interface

### 3.1 Une action principale, trois modes de saisie
- **Analyser cette page** — collecte les adresses visibles et les met en évidence sans lire la page au préalable.
- **Coller des adresses** — une par ligne ou séparées par des virgules ; les doublons sont supprimés et la syntaxe invalide est affichée comme résultat.
- **Fichier CSV** — lit la première colonne et exporte un nouveau CSV avec le statut, la confiance, l'accord, la suggestion et les détails des sources.

### 3.2 Des résultats fiables
- Chaque ligne affiche l'adresse, un badge de statut et une courte ligne de détail : `Confiance N % · motif`.
- Filtrez par statut, recherchez dans les résultats et copiez les lignes valides ou visibles.
- Corrigez les fautes de frappe de domaine connues comme `gmial.com → gmail.com` en un seul clic.
- Les domaines jetables, les adresses de rôle et les fournisseurs gratuits sont signalés plutôt que masqués.

### 3.3 Mode confidentialité
- Arrête immédiatement tout appel externe ; la vérification devient uniquement locale.
- L'indicateur de connexion dans le pied de page affiche toujours l'état actuel.

### 3.4 Huit langues, un vrai RTL
- L'anglais est la langue par défaut ; la langue du navigateur est utilisée au premier lancement lorsqu'elle fait partie des huit.
- Le changement de langue est instantané et ne nécessite aucun rechargement.
- L'arabe utilise une disposition RTL intégrale avec des règles de pluriel correctes.

### 3.5 Thème sombre noir véritable
- Un fond noir réel avec un contraste réglé, activable depuis l'en-tête et mémorisé.

### 3.6 Support continued development

- Mail Aura est gratuit et open source. Un bouton InstaPay facultatif et PayPal en alternative aident à l’améliorer. Les deux liens s’ouvrent dans un nouvel onglet ; l’extension n’envoie aucune donnée.

---

## 4. Huit sources gratuites

1. Rapid Email Validator
2. Disify
3. DeBounce
4. MailCheck.ai
5. Disban
6. EmailProbe
7. Google DNS-over-HTTPS
8. Cloudflare DNS-over-HTTPS

Tous les appels passent par HTTPS et ne nécessitent aucune clé. Le mode confidentialité les désactive tous.

---

## 5. Installation (non empaquetée)

1. Ouvrez `chrome://extensions`.
2. Activez le **mode développeur**.
3. Cliquez sur **Charger l'extension non empaquetée** et sélectionnez ce dossier.
4. Cliquez sur l'icône Mail Aura dans la barre d'outils.

Aucune étape de compilation ni dépendance externe n'est requise.

---

## 6. Développement

```powershell
node --test tests/             # 49 tests unitaires
node --check ui.js             # vérification syntaxique de chaque fichier JS
node scripts/check-ui.mjs      # identifiants DOM, fichiers manifest, CSP, HTTPS
node scripts/build-preview.mjs # régénérer dev/preview.html et preview-side.html
```

Chrome est nécessaire pour l'utilitaire de capture d'écran :

```powershell
node scripts/screenshot.mjs --url "file:///C:/.../dev/preview.html?theme=light&tall=1" --out dev/preview-light.png
```

---

## 7. Confidentialité

Consultez `privacy.html`. Les adresses ne sont envoyées que lorsque vous demandez une vérification, rien n'est suivi et toutes les connexions utilisent HTTPS. La seule exception déclarée est une feuille de style Google Fonts chargée à l'ouverture de l'interface ; aucune donnée d'e-mail ni de vérification n'est transmise avec elle.

---

## 8. Licence

Le projet est open source et gratuit pour tous sous licence **Apache-2.0** — utilisez-le, modifiez-le et partagez-le librement ; le texte intégral se trouve dans [LICENSE](LICENSE).

---

<p align="center">Réalisé avec soin par <b>Ahmed Yousry</b> · <a href="https://github.com/el9a7rawi/Mail-Aura">Mail Aura</a> · <a href="LICENSE">Apache-2.0</a></p>
