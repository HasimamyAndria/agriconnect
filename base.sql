-- Table Utilisateur
CREATE TABLE Utilisateur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Producteur', 'Acheteur')),
    contact VARCHAR(20),
    adresse TEXT
);

-- Table Producteur
CREATE TABLE Producteur (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    statut_validation VARCHAR(20) DEFAULT 'En attente',
    FOREIGN KEY (user_id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

-- Table Produit
CREATE TABLE Produit (
    id SERIAL PRIMARY KEY,
    producteur_id INT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prix_unitaire NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url TEXT,
    FOREIGN KEY (producteur_id) REFERENCES Producteur(id) ON DELETE CASCADE
);

-- Table Commande
CREATE TABLE Commande (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) DEFAULT 'En cours' CHECK (statut IN ('En cours', 'Livrée', 'Annulée')),
    montant_total NUMERIC(10,2) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

-- Table Commande_Produit
CREATE TABLE Commande_Produit (
    id SERIAL PRIMARY KEY,
    commande_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    prix_unitaire NUMERIC(10,2) NOT NULL,
    montant NUMERIC(10,2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
    FOREIGN KEY (commande_id) REFERENCES Commande(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES Produit(id) ON DELETE CASCADE
);
