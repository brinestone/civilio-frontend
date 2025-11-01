package fr.civipol.civilio;

import java.io.*;
import java.util.*;

public class YamlTranslatorImproved {
	private static final String INPUT_EN_FILE = "civilio-frontend/assets/i18n/en.yml";
	private static final String INPUT_FR_DICTIONARY = "civilio-frontend/assets/i18n/fr.yml";
	private static final String OUTPUT_FR_FILE = "civilio-frontend/assets/i18n/fr_updated.yml";

	// Map qui stocke path complet -> traduction FR
	private Map<String, String> existingTranslations = new HashMap<>();
	private Set<String> translatedKeys = new HashSet<>();
	private List<String> missingTranslations = new ArrayList<>();
	private final Map<String, String> commonTranslations = getCommonTranslations();

	public static void main(String[] args) {
		YamlTranslatorImproved translator = new YamlTranslatorImproved();
		try {
			translator.loadExistingTranslations(INPUT_FR_DICTIONARY);
			translator.translateFile(INPUT_EN_FILE, OUTPUT_FR_FILE);
			translator.printStatistics();
		} catch (IOException e) {
			System.err.println("Erreur : " + e.getMessage());
			e.printStackTrace();
		}
	}

	private void loadExistingTranslations(String filePath) throws IOException {
		System.out.println("📖 Chargement du dictionnaire FR existant...");

		try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
			Stack<String> pathStack = new Stack<>();
			Stack<Integer> indentStack = new Stack<>();

			String line;
			while ((line = reader.readLine()) != null) {
				if (line.trim().isEmpty() || line.trim().startsWith("#")) {
					continue;
				}

				int indent = getIndentation(line);
				String trimmed = line.trim();

				// Ajuster la pile selon l'indentation
				while (!indentStack.isEmpty() && indent <= indentStack.peek()) {
					indentStack.pop();
					if (!pathStack.isEmpty()) {
						pathStack.pop();
					}
				}

				if (trimmed.contains(":")) {
					String[] parts = trimmed.split(":", 2);
					String key = parts[0].trim();
					String value = parts.length > 1 ? parts[1].trim() : "";

					// Construire le chemin complet
					String fullPath = pathStack.isEmpty() ? key : String.join(".", pathStack) + "." + key;

					// Si c'est une valeur (pas une section)
					if (!value.isEmpty() && !value.equals("''") && !value.equals("\"\"")) {
						String cleanValue = cleanQuotes(value);
						existingTranslations.put(fullPath, cleanValue);
					}

					pathStack.push(key);
					indentStack.push(indent);
				}
			}
		} catch (FileNotFoundException e) {
			System.err.println("⚠️ Fichier FR non trouvé. Utilisation du dictionnaire de base uniquement.");
		}

		System.out.println("✅ " + existingTranslations.size() + " traductions FR chargées");
	}

	private void translateFile(String inputFile, String outputFile) throws IOException {
		System.out.println("\n🔄 Traduction en cours...");

		try (BufferedReader reader = new BufferedReader(new FileReader(inputFile));
				 BufferedWriter writer = new BufferedWriter(new FileWriter(outputFile))) {

			Stack<String> pathStack = new Stack<>();
			Stack<Integer> indentStack = new Stack<>();
			int translatedCount = 0;

			String line;
			while ((line = reader.readLine()) != null) {
				// Préserver les lignes vides et commentaires
				if (line.trim().isEmpty() || line.trim().startsWith("#")) {
					writer.write(line + "\n");
					continue;
				}

				int indent = getIndentation(line);
				String trimmed = line.trim();

				// Ajuster la pile selon l'indentation
				while (!indentStack.isEmpty() && indent <= indentStack.peek()) {
					indentStack.pop();
					if (!pathStack.isEmpty()) {
						pathStack.pop();
					}
				}

				if (trimmed.contains(":")) {
					String[] parts = trimmed.split(":", 2);
					String key = parts[0].trim();
					String value = parts.length > 1 ? parts[1].trim() : "";

					// Construire le chemin complet
					String fullPath = pathStack.isEmpty() ? key : String.join(".", pathStack) + "." + key;

					if (!value.isEmpty() && !value.equals("''") && !value.equals("\"\"")) {
						String cleanValue = cleanQuotes(value);
						String translation = findTranslation(fullPath, cleanValue);

						if (translation != null && !translation.equals(cleanValue)) {
							String indentStr = " ".repeat(indent);
							String quote = value.startsWith("'") ? "'" : (value.startsWith("\"") ? "\"" : "");
							writer.write(indentStr + key + ": " + quote + translation + quote + "\n");
							translatedKeys.add(fullPath);
							translatedCount++;
						} else {
							writer.write(line + "\n");
							missingTranslations.add(fullPath + " = " + cleanValue);
						}
					} else {
						writer.write(line + "\n");
					}

					pathStack.push(key);
					indentStack.push(indent);
				} else {
					writer.write(line + "\n");
				}
			}

			System.out.println("✅ Traduction terminée !");
			System.out.println("   Fichier créé: " + outputFile);
			System.out.println("   Lignes traduites: " + translatedCount);
		}
	}

	private String findTranslation(String fullPath, String englishValue) {
		// 1. Chercher dans les traductions existantes par chemin complet
		if (existingTranslations.containsKey(fullPath)) {
			return existingTranslations.get(fullPath);
		}

		// 2. Chercher dans le dictionnaire commun par valeur
		if (commonTranslations.containsKey(englishValue)) {
			return commonTranslations.get(englishValue);
		}

		// 3. Chercher insensible à la casse
		String lowerValue = englishValue.toLowerCase();
		for (Map.Entry<String, String> entry : commonTranslations.entrySet()) {
			if (entry.getKey().toLowerCase().equals(lowerValue)) {
				return entry.getValue();
			}
		}

		return null;
	}

	private String cleanQuotes(String value) {
		return value.replaceAll("^['\"]|['\"]$", "");
	}

	private int getIndentation(String line) {
		int count = 0;
		for (char c : line.toCharArray()) {
			if (c == ' ') count++;
			else break;
		}
		return count;
	}

	private Map<String, String> getCommonTranslations() {
		Map<String, String> map = new HashMap<>();

		// Mots de base
		map.put("Username", "Nom d'utilisateur");
		map.put("Password", "Mot de passe");
		map.put("Email", "E-mail");
		map.put("Phone", "Téléphone");
		map.put("Name", "Nom");
		map.put("Date", "Date");
		map.put("Settings", "Paramètres");
		map.put("Language", "Langue");
		map.put("English", "Anglais");
		map.put("French", "Français");

		// Actions
		map.put("Save", "Enregistrer");
		map.put("Cancel", "Annuler");
		map.put("Delete", "Supprimer");
		map.put("Edit", "Modifier");
		map.put("Add", "Ajouter");
		map.put("Remove", "Retirer");
		map.put("Submit", "Soumettre");
		map.put("Search", "Rechercher");
		map.put("Filter", "Filtrer");
		map.put("Modify", "Modifier");
		map.put("Discard", "Annuler");
		map.put("Sign in", "Se connecter");
		map.put("Sign out", "Se déconnecter");
		map.put("Refresh", "Actualiser");

		// États
		map.put("Loading...", "Chargement...");
		map.put("Yes", "Oui");
		map.put("No", "Non");
		map.put("OK", "D'accord");
		map.put("Success", "Succès");
		map.put("Error", "Erreur");

		// Formulaires
		map.put("Title", "Titre");
		map.put("Description", "Description");
		map.put("Status", "Statut");
		map.put("Type", "Type");
		map.put("Category", "Catégorie");
		map.put("Region", "Région");
		map.put("Division", "Département");
		map.put("Quantity", "Quantité");
		map.put("Index", "Index");

		// Genre
		map.put("Male", "Homme");
		map.put("Female", "Femme");
		map.put("Man", "Homme");
		map.put("Woman", "Femme");
		map.put("Gender", "Sexe");
		map.put("Age", "Âge");

		// Navigation
		map.put("Next", "Suivant");
		map.put("Previous", "Précédent");
		map.put("Prev", "Préc.");
		map.put("Finish", "Terminer");
		map.put("Back", "Retour");

		// Messages
		map.put("This field is required", "Ce champ est obligatoire");
		map.put("Invalid value", "Valeur invalide");
		map.put("No data", "Aucune donnée");

		return map;
	}

	private void printStatistics() {
		System.out.println("\n📊 STATISTIQUES");
		System.out.println("================");
		System.out.println("Traductions trouvées: " + translatedKeys.size());
		System.out.println("Traductions manquantes: " + missingTranslations.size());

		if (!missingTranslations.isEmpty()) {
			System.out.println("\n⚠️ Traductions manquantes (premières 30):");
			int count = 0;
			Set<String> unique = new LinkedHashSet<>(missingTranslations);
			for (String missing : unique) {
				if (count++ < 30) {
					System.out.println("   - " + missing);
				}
			}
			if (unique.size() > 30) {
				System.out.println("   ... et " + (unique.size() - 30) + " autres");
			}
		}
	}
}
