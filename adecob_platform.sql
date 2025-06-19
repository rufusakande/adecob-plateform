-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 06, 2025 at 04:42 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `adecob_platform`
--

-- --------------------------------------------------------

--
-- Table structure for table `communes`
--

CREATE TABLE `communes` (
  `id` int NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departement_id` int NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `communes`
--

INSERT INTO `communes` (`id`, `nom`, `departement_id`, `code`, `created_at`, `updated_at`) VALUES
(1, 'Parakou', 4, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(2, 'Tchaourou', 4, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(3, 'N\'Dali', 4, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(4, 'Nikki', 4, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(5, 'Bembèrèké', 4, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(6, 'Kalalé', 4, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(7, 'Sinendé', 4, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(8, 'Pèrèrè', 4, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(9, 'Cotonou', 8, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(10, 'Abomey-Calavi', 3, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(11, 'Allada', 3, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(12, 'Ouidah', 3, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(13, 'Sô-Ava', 3, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(14, 'Porto-Novo', 10, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(15, 'Sèmè-Kpodji', 10, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(16, 'Adjarra', 10, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(17, 'Abomey', 12, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(18, 'Bohicon', 12, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(19, 'Covè', 12, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(20, 'Lokossa', 9, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(21, 'Comè', 9, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(22, 'Natitingou', 2, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(23, 'Tanguiéta', 2, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(24, 'Kandi', 1, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(25, 'Malanville', 1, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(26, 'Djougou', 7, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(27, 'Bassila', 7, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(28, 'Aplahoué', 6, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(29, 'Dogbo', 6, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(30, 'Savalou', 5, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(31, 'Bantè', 5, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(32, 'Pobè', 11, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(33, 'Kétou', 11, NULL, '2025-06-02 09:53:33', '2025-06-02 09:53:33');

-- --------------------------------------------------------

--
-- Table structure for table `departements`
--

CREATE TABLE `departements` (
  `id` int NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departements`
--

INSERT INTO `departements` (`id`, `nom`, `code`, `created_at`, `updated_at`) VALUES
(1, 'Alibori', 'AL', '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(2, 'Atacora', 'AT', '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(3, 'Atlantique', 'AQ', '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(4, 'Borgou', 'BO', '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(5, 'Collines', 'CO', '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(6, 'Couffo', 'CF', '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(7, 'Donga', 'DO', '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(8, 'Littoral', 'LI', '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(9, 'Mono', 'MO', '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(10, 'Ouémé', 'OU', '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(11, 'Plateau', 'PL', '2025-06-02 09:53:33', '2025-06-02 09:53:33'),
(12, 'Zou', 'ZO', '2025-06-02 09:53:33', '2025-06-02 09:53:33');

-- --------------------------------------------------------

--
-- Table structure for table `importations`
--

CREATE TABLE `importations` (
  `id` int NOT NULL,
  `nom_fichier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taille_fichier` int DEFAULT NULL,
  `chemin_fichier` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_lignes_total` int DEFAULT '0',
  `nombre_lignes_importees` int DEFAULT '0',
  `nombre_erreurs` int DEFAULT '0',
  `statut` enum('en_cours','termine','erreur') COLLATE utf8mb4_unicode_ci DEFAULT 'en_cours',
  `utilisateur_id` int NOT NULL,
  `date_importation` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_fin_importation` datetime DEFAULT NULL,
  `rapport_erreurs` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `importations`
--

INSERT INTO `importations` (`id`, `nom_fichier`, `taille_fichier`, `chemin_fichier`, `nombre_lignes_total`, `nombre_lignes_importees`, `nombre_erreurs`, `statut`, `utilisateur_id`, `date_importation`, `date_fin_importation`, `rapport_erreurs`, `created_at`, `updated_at`) VALUES
(1, 'DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 9265, 'E:\\Developpement-web\\Site-web\\Projet\\adecob-platform\\backend\\uploads\\DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET___CONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2_1748953814496-118555887.xlsx', 1, 0, 1, 'termine', 2, '2025-06-03 13:30:15', '2025-06-03 13:30:16', '[{\"ligne\": 1, \"erreur\": \"Data truncated for column \'niveau_degradation\' at row 1\", \"donnees\": {\"_id\": \"id\", \"end\": \"end\", \"Date\": \"Date\", \"Nikki\": \"Nikki\", \"_tags\": \"b\", \"_uuid\": \"ui\", \"start\": \"start\", \"Hameau\": \"Hameau\", \"N\'Dali\": \"N\'Dali\", \"_index\": \"b\", \"_notes\": \"n\", \"Commune\": \"Commune\", \"Kalalé\": \"Kalalé\", \"Numéro\": \"Numéro\", \"PHOTO 1\": \"PHOTO 1\", \"PHOTO 2\": \"PHOTO 2\", \"PHOTO 3\": \"PHOTO 3\", \"PHOTO 4\": \"PHOTO 4\", \"Parakou\": \"Parakou\", \"_status\": \"s\", \"Bailleur\": \"Bailleur\", \"Sinendé\": \"Sinendé\", \"Préciser\": \"Préciser\", \"Pèrèrè\": \"Pèrèrè\", \"Tchaourou\": \"Tchaourou\", \"__version__\": \"bb\", \"Bembèrèké\": \"Bembèrèké\", \"Localisation\": \"Localisation\", \"_submitted_by\": \"bb\", \"Mode de gestion\": \"Mode de gestion\", \"Secteur/Domaine\": \"Secteur/Domaine\", \"Réhabilitation \": \"Réhabilitation \", \"Village/Quartier\": \"Village/Quartier\", \"_submission_time\": \"su\", \"MESURES PROPOSEES\": \"MESURES PROPOSEES\", \"Type de matériaux\": \"Type de matériaux\", \"_validation_status\": \"v\", \"Nom de l\'enquêteur\": \"Nom de l\'enquêteur\", \"OBSERVATION GENERALE\": \"OBSERVATION GENERALE\", \"Année de réalisation\": \"Année de réalisation\", \"Etat de fonctionnement\": \"Etat de fonctionnement\", \"Niveau de dégradation\": \"Niveau de dégradation\", \"Type d\'infrastructure \": \"Type d\'infrastructure \", \"_Localisation_altitude\": \"Lo\", \"_Localisation_latitude\": \"Lo\", \" DEFECTUOSITES RELEVEES\": \"DE\", \"Nom de l\'infrastructure\": \"Nom de l\'infrastructure\", \"_Localisation_longitude\": \"Lo\", \"_Localisation_precision\": \"Lo\"}}]', '2025-06-03 13:30:15', '2025-06-03 13:30:15'),
(2, 'DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 9265, 'E:\\Developpement-web\\Site-web\\Projet\\adecob-platform\\backend\\uploads\\DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET___CONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2_1748968177210-976862610.xlsx', 1, 0, 1, 'termine', 2, '2025-06-03 17:29:37', '2025-06-03 17:29:38', '[{\"ligne\": 1, \"erreur\": \"Data truncated for column \'niveau_degradation\' at row 1\", \"donnees\": {\"_id\": \"id\", \"end\": \"end\", \"Date\": \"Date\", \"Nikki\": \"Nikki\", \"_tags\": \"b\", \"_uuid\": \"ui\", \"start\": \"start\", \"Hameau\": \"Hameau\", \"N\'Dali\": \"N\'Dali\", \"_index\": \"b\", \"_notes\": \"n\", \"Commune\": \"Commune\", \"Kalalé\": \"Kalalé\", \"Numéro\": \"Numéro\", \"PHOTO 1\": \"PHOTO 1\", \"PHOTO 2\": \"PHOTO 2\", \"PHOTO 3\": \"PHOTO 3\", \"PHOTO 4\": \"PHOTO 4\", \"Parakou\": \"Parakou\", \"_status\": \"s\", \"Bailleur\": \"Bailleur\", \"Sinendé\": \"Sinendé\", \"Préciser\": \"Préciser\", \"Pèrèrè\": \"Pèrèrè\", \"Tchaourou\": \"Tchaourou\", \"__version__\": \"bb\", \"Bembèrèké\": \"Bembèrèké\", \"Localisation\": \"Localisation\", \"_submitted_by\": \"bb\", \"Mode de gestion\": \"Mode de gestion\", \"Secteur/Domaine\": \"Secteur/Domaine\", \"Réhabilitation \": \"Réhabilitation \", \"Village/Quartier\": \"Village/Quartier\", \"_submission_time\": \"su\", \"MESURES PROPOSEES\": \"MESURES PROPOSEES\", \"Type de matériaux\": \"Type de matériaux\", \"_validation_status\": \"v\", \"Nom de l\'enquêteur\": \"Nom de l\'enquêteur\", \"OBSERVATION GENERALE\": \"OBSERVATION GENERALE\", \"Année de réalisation\": \"Année de réalisation\", \"Etat de fonctionnement\": \"Etat de fonctionnement\", \"Niveau de dégradation\": \"Niveau de dégradation\", \"Type d\'infrastructure \": \"Type d\'infrastructure \", \"_Localisation_altitude\": \"Lo\", \"_Localisation_latitude\": \"Lo\", \" DEFECTUOSITES RELEVEES\": \"DE\", \"Nom de l\'infrastructure\": \"Nom de l\'infrastructure\", \"_Localisation_longitude\": \"Lo\", \"_Localisation_precision\": \"Lo\"}}]', '2025-06-03 17:29:37', '2025-06-03 17:29:37'),
(3, 'DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 9265, 'E:\\Developpement-web\\Site-web\\Projet\\adecob-platform\\backend\\uploads\\DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET___CONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2_1748969328349-954422937.xlsx', 1, 0, 1, 'termine', 2, '2025-06-03 17:48:48', '2025-06-03 17:48:48', '[{\"ligne\": 1, \"erreur\": \"Données invalides ou ligne d\'en-tête détectée\", \"donnees\": {\"_id\": \"id\", \"end\": \"end\", \"Date\": \"Date\", \"Nikki\": \"Nikki\", \"_tags\": \"b\", \"_uuid\": \"ui\", \"start\": \"start\", \"Hameau\": \"Hameau\", \"N\'Dali\": \"N\'Dali\", \"_index\": \"b\", \"_notes\": \"n\", \"Commune\": \"Commune\", \"Kalalé\": \"Kalalé\", \"Numéro\": \"Numéro\", \"PHOTO 1\": \"PHOTO 1\", \"PHOTO 2\": \"PHOTO 2\", \"PHOTO 3\": \"PHOTO 3\", \"PHOTO 4\": \"PHOTO 4\", \"Parakou\": \"Parakou\", \"_status\": \"s\", \"Bailleur\": \"Bailleur\", \"Sinendé\": \"Sinendé\", \"Préciser\": \"Préciser\", \"Pèrèrè\": \"Pèrèrè\", \"Tchaourou\": \"Tchaourou\", \"__version__\": \"bb\", \"Bembèrèké\": \"Bembèrèké\", \"Localisation\": \"Localisation\", \"_submitted_by\": \"bb\", \"Mode de gestion\": \"Mode de gestion\", \"Réhabilitation\": \"Réhabilitation \", \"Secteur/Domaine\": \"Secteur/Domaine\", \"Village/Quartier\": \"Village/Quartier\", \"_submission_time\": \"su\", \"MESURES PROPOSEES\": \"MESURES PROPOSEES\", \"Type de matériaux\": \"Type de matériaux\", \"_validation_status\": \"v\", \"Nom de l\'enquêteur\": \"Nom de l\'enquêteur\", \"OBSERVATION GENERALE\": \"OBSERVATION GENERALE\", \"Type d\'infrastructure\": \"Type d\'infrastructure \", \"Année de réalisation\": \"Année de réalisation\", \"DEFECTUOSITES RELEVEES\": \"DE\", \"Etat de fonctionnement\": \"Etat de fonctionnement\", \"Niveau de dégradation\": \"Niveau de dégradation\", \"_Localisation_altitude\": \"Lo\", \"_Localisation_latitude\": \"Lo\", \"Nom de l\'infrastructure\": \"Nom de l\'infrastructure\", \"_Localisation_longitude\": \"Lo\", \"_Localisation_precision\": \"Lo\"}}]', '2025-06-03 17:48:48', '2025-06-03 17:48:48'),
(4, 'DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 9491, 'E:\\Developpement-web\\Site-web\\Projet\\adecob-platform\\backend\\uploads\\DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET___CONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2_1748969966381-212188521.xlsx', 1, 0, 1, 'termine', 2, '2025-06-03 17:59:26', '2025-06-03 17:59:26', '[{\"ligne\": 1, \"erreur\": \"Out of range value for column \'localisation\' at row 1\", \"donnees\": {\"_id\": 75, \"end\": 22, \"Date\": 45810, \"Nikki\": \"na\", \"_tags\": \"b\", \"_uuid\": 45, \"start\": 12, \"Hameau\": \"oui\", \"N\'Dali\": \"na\", \"_index\": \"b\", \"_notes\": \"n\", \"Commune\": \"Parakou\", \"Kalalé\": \"na\", \"Numéro\": 51080983, \"PHOTO 1\": \"lien\", \"PHOTO 2\": \"lien\", \"PHOTO 3\": \"lien\", \"PHOTO 4\": \"lien\", \"Parakou\": \"oui\", \"_status\": \"s\", \"Bailleur\": \"Le bailleur\", \"Sinendé\": \"na\", \"Préciser\": \"rien à préciser\", \"Pèrèrè\": \"na\", \"Tchaourou\": \"na\", \"__version__\": \"bb\", \"Bembèrèké\": \"na\", \"Localisation\": 456285, \"_submitted_by\": \"bb\", \"Mode de gestion\": \"gestion\", \"Réhabilitation\": \"non\", \"Secteur/Domaine\": \"ecole\", \"Village/Quartier\": \"village\", \"_submission_time\": \"su\", \"MESURES PROPOSEES\": \"\", \"Type de matériaux\": \"beton\", \"_validation_status\": \"v\", \"Nom de l\'enquêteur\": \"Rufus\", \"OBSERVATION GENERALE\": \"Aucune observation\", \"Type d\'infrastructure\": \"batiment\", \"Année de réalisation\": 2020, \"DEFECTUOSITES RELEVEES\": \"def\", \"Etat de fonctionnement\": \"bien\", \"Niveau de dégradation\": \"moyen\", \"_Localisation_altitude\": 456848, \"_Localisation_latitude\": 548754, \"Nom de l\'infrastructure\": \"batiment\", \"_Localisation_longitude\": 4854784, \"_Localisation_precision\": 544688}}]', '2025-06-03 17:59:26', '2025-06-03 17:59:26'),
(5, 'DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 9484, 'E:\\Developpement-web\\Site-web\\Projet\\adecob-platform\\backend\\uploads\\DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET___CONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2_1748970563325-141762364.xlsx', 1, 1, 0, 'termine', 2, '2025-06-03 18:09:23', '2025-06-03 18:09:23', '[]', '2025-06-03 18:09:23', '2025-06-03 18:09:23'),
(6, 'DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 9484, 'E:\\Developpement-web\\Site-web\\Projet\\adecob-platform\\backend\\uploads\\DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET___CONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2_1748979692705-771418708.xlsx', 1, 1, 0, 'termine', 2, '2025-06-03 20:41:32', '2025-06-03 20:41:33', '[]', '2025-06-03 20:41:32', '2025-06-03 20:41:32'),
(7, 'DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 9484, 'E:\\Developpement-web\\Site-web\\Projet\\adecob-platform\\backend\\uploads\\DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET___CONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2_1749028903325-952315105.xlsx', 1, 1, 0, 'termine', 2, '2025-06-04 10:21:43', '2025-06-04 10:21:43', '[]', '2025-06-04 10:21:43', '2025-06-04 10:21:43'),
(8, 'DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 9484, 'E:\\Developpement-web\\Site-web\\Projet\\adecob-platform\\backend\\uploads\\DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET___CONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2_1749050227083-623013447.xlsx', 1, 1, 0, 'termine', 2, '2025-06-04 16:17:09', '2025-06-04 16:17:10', '[]', '2025-06-04 16:17:09', '2025-06-04 16:17:09'),
(9, 'DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 9484, 'E:\\Developpement-web\\Site-web\\Projet\\adecob-platform\\backend\\uploads\\DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET___CONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2_1749050422663-696511929.xlsx', 1, 1, 0, 'termine', 2, '2025-06-04 16:20:22', '2025-06-04 16:20:23', '[]', '2025-06-04 16:20:22', '2025-06-04 16:20:22'),
(10, 'DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 9484, 'E:\\Developpement-web\\Site-web\\Projet\\adecob-platform\\backend\\uploads\\DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET___CONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2_1749050746263-774424543.xlsx', 1, 1, 0, 'termine', 2, '2025-06-04 16:25:46', '2025-06-04 16:25:46', '[]', '2025-06-04 16:25:46', '2025-06-04 16:25:46'),
(11, 'DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 9484, 'E:\\Developpement-web\\Site-web\\Projet\\adecob-platform\\backend\\uploads\\DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET___CONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2_1749078170117-699442405.xlsx', 1, 1, 0, 'termine', 4, '2025-06-05 00:02:53', '2025-06-05 00:02:54', '[]', '2025-06-05 00:02:53', '2025-06-05 00:02:53');

-- --------------------------------------------------------

--
-- Table structure for table `informations_complementaires`
--

CREATE TABLE `informations_complementaires` (
  `id` int NOT NULL,
  `infrastructure_id` int NOT NULL,
  `type_information` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valeur` text COLLATE utf8mb4_unicode_ci,
  `date_ajout` datetime DEFAULT CURRENT_TIMESTAMP,
  `ajoute_par_utilisateur_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `infrastructures`
--

CREATE TABLE `infrastructures` (
  `id` int NOT NULL,
  `start` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `end` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_enquete` date DEFAULT NULL,
  `nom_enqueteur` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_enquete` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commune` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parakou` tinyint(1) DEFAULT '0',
  `tchaourou` tinyint(1) DEFAULT '0',
  `ndali` tinyint(1) DEFAULT '0',
  `nikki` tinyint(1) DEFAULT '0',
  `bembereke` tinyint(1) DEFAULT '0',
  `kalale` tinyint(1) DEFAULT '0',
  `sinende` tinyint(1) DEFAULT '0',
  `perere` tinyint(1) DEFAULT '0',
  `village_quartier` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hameau` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secteur_domaine` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_infrastructure` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom_infrastructure` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `annee_realisation` int DEFAULT NULL,
  `bailleur` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_materiaux` text COLLATE utf8mb4_unicode_ci,
  `etat_fonctionnement` enum('Bon','Moyen','Mauvais','Hors service','Non fonctionnel') COLLATE utf8mb4_unicode_ci DEFAULT 'Bon',
  `niveau_degradation` enum('Aucun','Faible','Moyen','Élevé','Très élevé') COLLATE utf8mb4_unicode_ci DEFAULT 'Aucun',
  `mode_gestion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precise` text COLLATE utf8mb4_unicode_ci,
  `defectuosites_relevees` text COLLATE utf8mb4_unicode_ci,
  `mesures_proposees` text COLLATE utf8mb4_unicode_ci,
  `observation_generale` text COLLATE utf8mb4_unicode_ci,
  `photo1_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo2_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo3_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo4_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rehabilitation` tinyint(1) DEFAULT '0',
  `localisation` decimal(10,8) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `altitude` decimal(8,2) DEFAULT NULL,
  `precision_gps` decimal(8,2) DEFAULT NULL,
  `external_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uuid` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submission_time` datetime DEFAULT NULL,
  `validation_status` enum('draft','submitted','validated','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status_collecte` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version_form` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` text COLLATE utf8mb4_unicode_ci,
  `index_ordre` int DEFAULT NULL,
  `statut_traitement` enum('nouveau','en_cours','traite','valide') COLLATE utf8mb4_unicode_ci DEFAULT 'nouveau',
  `source_donnee` enum('import','saisie_manuelle') COLLATE utf8mb4_unicode_ci NOT NULL,
  `utilisateur_id` int NOT NULL,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_traitement` datetime DEFAULT NULL,
  `traite_par_utilisateur_id` int DEFAULT NULL,
  `observations_internes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `infrastructures`
--

INSERT INTO `infrastructures` (`id`, `start`, `end`, `date_enquete`, `nom_enqueteur`, `numero_enquete`, `commune`, `parakou`, `tchaourou`, `ndali`, `nikki`, `bembereke`, `kalale`, `sinende`, `perere`, `village_quartier`, `hameau`, `secteur_domaine`, `type_infrastructure`, `nom_infrastructure`, `annee_realisation`, `bailleur`, `type_materiaux`, `etat_fonctionnement`, `niveau_degradation`, `mode_gestion`, `precise`, `defectuosites_relevees`, `mesures_proposees`, `observation_generale`, `photo1_url`, `photo2_url`, `photo3_url`, `photo4_url`, `rehabilitation`, `localisation`, `latitude`, `longitude`, `altitude`, `precision_gps`, `external_id`, `uuid`, `submission_time`, `validation_status`, `notes`, `status_collecte`, `submitted_by`, `version_form`, `tags`, `index_ordre`, `statut_traitement`, `source_donnee`, `utilisateur_id`, `date_creation`, `date_traitement`, `traite_par_utilisateur_id`, `observations_internes`, `created_at`, `updated_at`) VALUES
(1, '12', '22', NULL, 'Rufus', NULL, 'Parakou', 1, 0, 0, 0, 0, 0, 0, 0, 'village', 'oui', 'ecole', 'batiment', 'batiment', 2020, 'Le bailleur', 'beton', 'Bon', 'Moyen', 'gestion', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '6.36536000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'draft', NULL, NULL, NULL, NULL, NULL, NULL, 'traite', 'import', 2, '2025-06-03 18:09:23', '2025-06-04 15:58:56', 2, 'aucune infos', '2025-06-03 18:09:23', '2025-06-03 18:09:23'),
(2, '12', '22', NULL, 'Rufus', NULL, 'Parakou', 1, 0, 0, 0, 0, 0, 0, 0, 'village', 'oui', 'ecole', 'batiment', 'batiment modifier', 2020, 'Le bailleur', 'beton', 'Bon', 'Moyen', 'gestion', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '6.36536000', '0.00000100', NULL, NULL, NULL, NULL, NULL, NULL, 'draft', NULL, NULL, NULL, NULL, NULL, NULL, 'traite', 'import', 2, '2025-06-03 20:41:33', '2025-06-04 13:17:25', 2, 'aucune observation', '2025-06-03 20:41:33', '2025-06-04 15:56:52'),
(4, '12', '22', NULL, 'Rufus', NULL, 'Parakou', 1, 0, 0, 0, 0, 0, 0, 0, 'village', 'oui', 'ecole', 'batiment', 'batiment modifier ', 2020, 'Le bailleur', 'beton', 'Bon', 'Moyen', 'gestion', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '6.36536000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'draft', NULL, NULL, NULL, NULL, NULL, NULL, 'nouveau', 'import', 2, '2025-06-04 16:17:10', NULL, NULL, NULL, '2025-06-04 16:17:10', '2025-06-04 22:12:09'),
(6, '12', '22', NULL, 'Rufus', NULL, 'Parakou', 1, 0, 0, 0, 0, 0, 0, 0, 'village', 'oui', 'ecole', 'batiment', 'batiment', 2020, 'Le bailleur', 'beton', 'Bon', 'Moyen', 'gestion', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '6.36536000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'draft', NULL, NULL, NULL, NULL, NULL, NULL, 'nouveau', 'import', 2, '2025-06-04 16:25:46', NULL, NULL, NULL, '2025-06-04 16:25:46', '2025-06-04 16:25:46'),
(7, '12', '22', NULL, 'Rufus', NULL, 'Parakou', 1, 0, 0, 0, 0, 0, 0, 0, 'village', 'oui', 'ecole', 'batiment', 'batiment', 2020, 'Le bailleur', 'beton', 'Bon', 'Moyen', 'gestion', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '6.36536000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'draft', NULL, NULL, NULL, NULL, NULL, NULL, 'nouveau', 'import', 4, '2025-06-05 00:02:53', NULL, NULL, NULL, '2025-06-05 00:02:53', '2025-06-05 00:05:01');

-- --------------------------------------------------------

--
-- Table structure for table `logs_activite`
--

CREATE TABLE `logs_activite` (
  `id` int NOT NULL,
  `utilisateur_id` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `table_concernee` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_enregistrement` int DEFAULT NULL,
  `donnees_avant` json DEFAULT NULL,
  `donnees_apres` json DEFAULT NULL,
  `adresse_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `logs_activite`
--

INSERT INTO `logs_activite` (`id`, `utilisateur_id`, `action`, `description`, `table_concernee`, `id_enregistrement`, `donnees_avant`, `donnees_apres`, `adresse_ip`, `user_agent`, `created_at`) VALUES
(1, 2, 'INSCRIPTION', 'Inscription de Rufus Akande', 'utilisateurs', 2, NULL, '\"{\\\"nom\\\":\\\"Akande\\\",\\\"prenom\\\":\\\"Rufus\\\",\\\"email\\\":\\\"akande@gmail.com\\\",\\\"role\\\":\\\"membre\\\"}\"', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-03 10:51:06'),
(2, 2, 'CONNEXION', 'Connexion de Rufus Akande', 'utilisateurs', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-03 10:51:53'),
(3, 2, 'CONNEXION', 'Connexion de Rufus Akande', 'utilisateurs', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-03 11:55:55'),
(4, 2, 'DECONNEXION', 'Déconnexion utilisateur', 'sessions_utilisateur', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-03 12:23:15'),
(5, 2, 'CONNEXION', 'Connexion de Rufus Akande', 'utilisateurs', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-03 12:23:46'),
(6, 2, 'DECONNEXION', 'Déconnexion utilisateur', 'sessions_utilisateur', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-03 13:03:44'),
(7, 2, 'CONNEXION', 'Connexion de Rufus Akande', 'utilisateurs', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-03 13:04:15'),
(8, 2, 'import_excel', 'Import du fichier: DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 'importations', 1, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-03 13:30:16'),
(9, 2, 'import_excel', 'Import du fichier: DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 'importations', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-03 17:29:38'),
(10, 2, 'import_excel', 'Import du fichier: DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 'importations', 3, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-03 17:48:48'),
(11, 2, 'import_excel', 'Import du fichier: DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 'importations', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-03 17:59:26'),
(12, 2, 'import_excel', 'Import du fichier: DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 'importations', 5, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-03 18:09:23'),
(13, 2, 'CONNEXION', 'Connexion de Rufus Akande', 'utilisateurs', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-03 20:41:05'),
(14, 2, 'import_excel', 'Import du fichier: DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 'importations', 6, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-03 20:41:33'),
(15, 2, 'CONNEXION', 'Connexion de Rufus Akande', 'utilisateurs', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 10:15:42'),
(16, 2, 'DECONNEXION', 'Déconnexion utilisateur', 'sessions_utilisateur', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 10:15:50'),
(17, 2, 'CONNEXION', 'Connexion de Rufus Akande', 'utilisateurs', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 10:16:18'),
(18, 2, 'import_excel', 'Import du fichier: DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 'importations', 7, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 10:21:43'),
(19, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 2', 'infrastructures', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 13:16:28'),
(20, 2, 'process_infrastructure', 'Traitement infrastructure ID: 2', 'infrastructures', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 13:17:25'),
(21, 2, 'delete_infrastructure', 'Suppression infrastructure ID: 3', 'infrastructures', 3, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 13:17:50'),
(22, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 2', 'infrastructures', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 15:56:52'),
(23, 2, 'process_infrastructure', 'Traitement infrastructure ID: 1', 'infrastructures', 1, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 15:58:57'),
(24, 2, 'import_excel', 'Import du fichier: DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 'importations', 8, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 16:17:11'),
(25, 2, 'import_excel', 'Import du fichier: DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 'importations', 9, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 16:20:23'),
(26, 2, 'import_excel', 'Import du fichier: DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 'importations', 10, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 16:25:46'),
(27, 2, 'delete_infrastructure', 'Suppression infrastructure ID: 5', 'infrastructures', 5, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 16:31:38'),
(28, 2, 'export_pdf', 'Export PDF de 1 infrastructure(s)', 'exports', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 17:07:32'),
(29, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 21:36:16'),
(30, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 21:36:33'),
(31, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 21:36:40'),
(32, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 21:48:58'),
(33, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 21:52:22'),
(34, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 21:52:29'),
(35, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 22:09:21'),
(36, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 22:10:23'),
(37, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 22:10:42'),
(38, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 22:11:14'),
(39, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 22:11:30'),
(40, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 22:11:46'),
(41, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 22:12:02'),
(42, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 4', 'infrastructures', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-04 22:12:09'),
(43, 2, 'DECONNEXION', 'Déconnexion utilisateur', 'sessions_utilisateur', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 22:37:26'),
(44, 2, 'CONNEXION', 'Connexion de Rufus Akande', 'utilisateurs', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 22:38:10'),
(45, 2, 'DECONNEXION', 'Déconnexion utilisateur', 'sessions_utilisateur', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 22:54:20'),
(46, 2, 'CONNEXION', 'Connexion de Rufus Akande', 'utilisateurs', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 22:55:14'),
(47, 2, 'DECONNEXION', 'Déconnexion utilisateur', 'sessions_utilisateur', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 23:15:18'),
(48, 3, 'INSCRIPTION', 'Inscription de ruf rufus', 'utilisateurs', 3, NULL, '\"{\\\"nom\\\":\\\"rufus\\\",\\\"prenom\\\":\\\"ruf\\\",\\\"email\\\":\\\"akand@gmail.com\\\",\\\"role\\\":\\\"membre\\\"}\"', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 23:29:11'),
(49, 4, 'INSCRIPTION', 'Inscription de Femi Rufus', 'utilisateurs', 4, NULL, '\"{\\\"nom\\\":\\\"Rufus\\\",\\\"prenom\\\":\\\"Femi\\\",\\\"email\\\":\\\"rufus@gmail.com\\\",\\\"role\\\":\\\"membre\\\"}\"', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 23:35:43'),
(50, 4, 'CONNEXION', 'Connexion de Femi Rufus', 'utilisateurs', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 23:36:21'),
(51, 4, 'DECONNEXION', 'Déconnexion utilisateur', 'sessions_utilisateur', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 23:38:08'),
(52, 4, 'CONNEXION', 'Connexion de Femi Rufus', 'utilisateurs', 4, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-04 23:38:31'),
(53, 4, 'import_excel', 'Import du fichier: DONNEES_INFRASTRUCTURES_SOCIOCOMMUNAUTAIRES_ET_ÃCONOMIQUESADECOB_-_latest_version_-_labels_-_2025-05-2.xlsx', 'importations', 11, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-05 00:02:54'),
(54, 4, 'DECONNEXION', 'Déconnexion utilisateur', 'sessions_utilisateur', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-05 00:03:48'),
(55, 2, 'CONNEXION', 'Connexion de Rufus Akande', 'utilisateurs', 2, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-05 00:04:06'),
(56, 2, 'update_infrastructure', 'Mise à jour infrastructure ID: 7', 'infrastructures', 7, NULL, NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-05 00:05:01');

-- --------------------------------------------------------

--
-- Table structure for table `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20241201000001-create-departements.js'),
('202412010000010-create-sessions-utilisateur.js'),
('20241201000002-create-communes.js'),
('20241201000003-create-utilisateurs.js'),
('20241201000004-create-infrastructures.js'),
('20241201000005-create-informations-complementaires.js'),
('20241201000006-create-importations.js'),
('20241201000007-create-logs-activite.js');

-- --------------------------------------------------------

--
-- Table structure for table `sessions_utilisateur`
--

CREATE TABLE `sessions_utilisateur` (
  `id` int NOT NULL,
  `utilisateur_id` int NOT NULL,
  `refresh_token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_le` datetime NOT NULL,
  `adresse_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions_utilisateur`
--

INSERT INTO `sessions_utilisateur` (`id`, `utilisateur_id`, `refresh_token`, `expire_le`, `adresse_ip`, `user_agent`, `created_at`, `updated_at`) VALUES
(3, 2, '3f2f8412e44aae8be5de7d97b97798a0ec54748d7b0e7fce7fd9ca9e57a7326baa01b0edeb1d869d8478ab1f1cc12fb804037e6827b4e1a4e9898f2b8742893e', '2025-06-10 13:04:16', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-03 13:04:15', '2025-06-03 13:04:15'),
(4, 2, '2899ad114c9826bbd594e5f486484f7b5f8938f4b661b8f450e644ad62d661590ecf5adbf9ef201b98a00a3e5cba78fe475d91bd0ef10bbcefea7db96c6d8258', '2025-06-10 20:41:06', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-03 20:41:05', '2025-06-03 20:41:05'),
(11, 2, 'ceea240f7355d6e67df9c2a7915ed20d8ffa0b9a8178854c13b82b3356b04cf1ed4d1f0d5e7c3b485ad9a0b82646c8aafdb9aca1c6fa813c5f0f9cf7e601fd6a', '2025-06-12 00:04:06', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', '2025-06-05 00:04:06', '2025-06-05 00:04:06');

-- --------------------------------------------------------

--
-- Table structure for table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mot_de_passe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('administrateur','membre') COLLATE utf8mb4_unicode_ci DEFAULT 'membre',
  `departement_id` int DEFAULT NULL,
  `commune_id` int DEFAULT NULL,
  `statut` enum('actif','inactif','suspendu') COLLATE utf8mb4_unicode_ci DEFAULT 'actif',
  `date_inscription` datetime DEFAULT CURRENT_TIMESTAMP,
  `derniere_connexion` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `prenom`, `email`, `telephone`, `mot_de_passe`, `role`, `departement_id`, `commune_id`, `statut`, `date_inscription`, `derniere_connexion`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'ADECOB', 'admin@adecob.org', '+229 XX XX XX XX', '$2b$10$4Wnm2ai9p66gsNN7TMhrq.7O3IVhBmyDFhcsy9GMAljTo6b1vL4o6', 'administrateur', 4, 1, 'actif', '2025-06-02 09:53:34', NULL, '2025-06-02 09:53:34', '2025-06-02 09:53:34'),
(2, 'Akande', 'Rufus', 'akande@gmail.com', '0151080983', '$2b$12$9Rp6xOsyPAvk4iUHzzmBOeFORC/pSbYIr72NkwPBauymYmh0/WSPC', 'membre', 4, 1, 'actif', '2025-06-03 10:51:06', '2025-06-05 00:04:06', '2025-06-03 10:51:06', '2025-06-03 10:51:06'),
(3, 'rufus', 'ruf', 'akand@gmail.com', '45213689', '$2b$12$Dwwq3KSl6jvcRncxGaDMdeu9N0bC8EQoSVIXBUzhH5dqci7d/kr2O', 'membre', 2, 22, 'actif', '2025-06-04 23:29:11', NULL, '2025-06-04 23:29:11', '2025-06-04 23:29:11'),
(4, 'Rufus', 'Femi', 'rufus@gmail.com', '51080983', '$2b$12$2lDuotD9kLDr4GKy4DES..91xAsaP/Ikv1MTI/cSm.OKyvDHyLcN2', 'membre', 1, 24, 'actif', '2025-06-04 23:35:43', '2025-06-04 23:38:31', '2025-06-04 23:35:43', '2025-06-04 23:35:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `communes`
--
ALTER TABLE `communes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_departement` (`departement_id`);

--
-- Indexes for table `departements`
--
ALTER TABLE `departements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Indexes for table `importations`
--
ALTER TABLE `importations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `importations_utilisateur_id` (`utilisateur_id`),
  ADD KEY `importations_date_importation` (`date_importation`),
  ADD KEY `importations_statut` (`statut`);

--
-- Indexes for table `informations_complementaires`
--
ALTER TABLE `informations_complementaires`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ajoute_par_utilisateur_id` (`ajoute_par_utilisateur_id`),
  ADD KEY `informations_complementaires_infrastructure_id` (`infrastructure_id`),
  ADD KEY `informations_complementaires_type_information` (`type_information`);

--
-- Indexes for table `infrastructures`
--
ALTER TABLE `infrastructures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `infrastructures_uuid` (`uuid`),
  ADD KEY `traite_par_utilisateur_id` (`traite_par_utilisateur_id`),
  ADD KEY `infrastructures_statut_traitement` (`statut_traitement`),
  ADD KEY `infrastructures_commune` (`commune`),
  ADD KEY `infrastructures_type_infrastructure` (`type_infrastructure`),
  ADD KEY `infrastructures_etat_fonctionnement` (`etat_fonctionnement`),
  ADD KEY `infrastructures_utilisateur_id` (`utilisateur_id`),
  ADD KEY `infrastructures_date_creation` (`date_creation`),
  ADD KEY `infrastructures_latitude_longitude` (`latitude`,`longitude`),
  ADD KEY `infrastructures_validation_status` (`validation_status`);

--
-- Indexes for table `logs_activite`
--
ALTER TABLE `logs_activite`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`);

--
-- Indexes for table `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `sessions_utilisateur`
--
ALTER TABLE `sessions_utilisateur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `refresh_token` (`refresh_token`),
  ADD KEY `idx_sessions_utilisateur_id` (`utilisateur_id`),
  ADD KEY `idx_sessions_refresh_token` (`refresh_token`),
  ADD KEY `idx_sessions_expire_le` (`expire_le`),
  ADD KEY `idx_sessions_expire_user` (`expire_le`,`utilisateur_id`),
  ADD KEY `sessions_utilisateur_utilisateur_id` (`utilisateur_id`),
  ADD KEY `idx_refresh_token` (`refresh_token`),
  ADD KEY `sessions_utilisateur_expire_le` (`expire_le`),
  ADD KEY `idx_utilisateur` (`utilisateur_id`);

--
-- Indexes for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `idx_email` (`email`),
  ADD KEY `commune_id` (`commune_id`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_departement_commune` (`departement_id`,`commune_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `communes`
--
ALTER TABLE `communes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `departements`
--
ALTER TABLE `departements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=341;

--
-- AUTO_INCREMENT for table `importations`
--
ALTER TABLE `importations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `informations_complementaires`
--
ALTER TABLE `informations_complementaires`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `infrastructures`
--
ALTER TABLE `infrastructures`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `logs_activite`
--
ALTER TABLE `logs_activite`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `sessions_utilisateur`
--
ALTER TABLE `sessions_utilisateur`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `communes`
--
ALTER TABLE `communes`
  ADD CONSTRAINT `communes_ibfk_1` FOREIGN KEY (`departement_id`) REFERENCES `departements` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `importations`
--
ALTER TABLE `importations`
  ADD CONSTRAINT `importations_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `informations_complementaires`
--
ALTER TABLE `informations_complementaires`
  ADD CONSTRAINT `informations_complementaires_ibfk_1` FOREIGN KEY (`infrastructure_id`) REFERENCES `infrastructures` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `informations_complementaires_ibfk_2` FOREIGN KEY (`ajoute_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `infrastructures`
--
ALTER TABLE `infrastructures`
  ADD CONSTRAINT `infrastructures_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `infrastructures_ibfk_2` FOREIGN KEY (`traite_par_utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `logs_activite`
--
ALTER TABLE `logs_activite`
  ADD CONSTRAINT `logs_activite_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `sessions_utilisateur`
--
ALTER TABLE `sessions_utilisateur`
  ADD CONSTRAINT `sessions_utilisateur_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_ibfk_1` FOREIGN KEY (`departement_id`) REFERENCES `departements` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `utilisateurs_ibfk_2` FOREIGN KEY (`commune_id`) REFERENCES `communes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
