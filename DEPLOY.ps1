# ═══════════════════════════════════════════════════════════
#  SCRIPT DE DEPLOIEMENT — L'Épicerie Moderne
#  Double-cliquez sur ce fichier OU lancez-le dans PowerShell
# ═══════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
$ProjectDir = "c:\Users\fayca\Desktop\Java Madani\supermarche-jee"
$MySQL      = "C:\xampp\mysql\bin\mysql.exe"
$TomcatBin  = "C:\xampp\tomcat\bin"
$WebApps    = "C:\xampp\tomcat\webapps"
$WarSource  = "$ProjectDir\target\supermarche-jee.war"
$WarDest    = "$WebApps\supermarche-jee.war"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  L Epicerie Moderne — Script de deploiement" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ── ÉTAPE 1 : Vérifications ──────────────────────────────────
Write-Host "[1/4] Verification de l'environnement..." -ForegroundColor Yellow

if (-not (Test-Path $MySQL)) {
    Write-Host "  ✗ MySQL XAMPP introuvable : $MySQL" -ForegroundColor Red
    Write-Host "  → Assurez-vous que XAMPP est installe dans C:\xampp" -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

if (-not (Test-Path $WebApps)) {
    Write-Host "  ✗ Tomcat XAMPP introuvable : $WebApps" -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

Write-Host "  ✓ MySQL   : $MySQL" -ForegroundColor Green
Write-Host "  ✓ Tomcat  : $WebApps" -ForegroundColor Green
Write-Host "  ✓ WAR     : $WarSource" -ForegroundColor Green

# ── ÉTAPE 2 : Base de données ────────────────────────────────
Write-Host ""
Write-Host "[2/4] Configuration de la base de donnees..." -ForegroundColor Yellow
Write-Host "  XAMPP doit etre DEMARRÉ (MySQL actif dans le Control Panel)" -ForegroundColor Magenta
Write-Host ""

$mysqlUser = Read-Host "  Utilisateur MySQL [appuyez Entree pour 'root']"
if ([string]::IsNullOrWhiteSpace($mysqlUser)) { $mysqlUser = "root" }

$mysqlPass = Read-Host "  Mot de passe MySQL [appuyez Entree si vide]"

$sqlArgs = @("-u", $mysqlUser)
if (-not [string]::IsNullOrWhiteSpace($mysqlPass)) {
    $sqlArgs += "-p$mysqlPass"
}

Write-Host ""
Write-Host "  --> Creation des tables SQL (schema_complet.sql)..." -ForegroundColor Cyan
$schemaResult = & $MySQL @sqlArgs "-e" "source $ProjectDir\schema_complet.sql" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Erreur schema: $schemaResult" -ForegroundColor Red
} else {
    Write-Host "  ✓ Tables creees avec succes" -ForegroundColor Green
}

Write-Host "  --> Insertion des donnees (seed_final.sql)..." -ForegroundColor Cyan
$seedResult = & $MySQL @sqlArgs "supermarche_jee" "-e" "source $ProjectDir\seed_final.sql" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Erreur seed: $seedResult" -ForegroundColor Red
    Write-Host "  → Tentative avec SETUP_COMPLET.sql..." -ForegroundColor Yellow
    $setupResult = & $MySQL @sqlArgs "-e" "source $ProjectDir\SETUP_COMPLET.sql" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ SETUP_COMPLET.sql execute avec succes" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Erreur SETUP: $setupResult" -ForegroundColor Red
    }
} else {
    Write-Host "  ✓ Donnees inserees avec succes" -ForegroundColor Green

    # Ajouter les tables promotions si manquantes
    Write-Host "  --> Ajout tables promotions (seed_promotions.sql)..." -ForegroundColor Cyan
    $promoResult = & $MySQL @sqlArgs "supermarche_jee" "-e" "source $ProjectDir\sql\promotions_setup.sql" 2>&1
    if ($LASTEXITCODE -ne 0) {
        # Essai sans sous-dossier
        $promoResult2 = & $MySQL @sqlArgs "supermarche_jee" "-e" "source $ProjectDir\seed_promotions.sql" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Tables promotions creees" -ForegroundColor Green
        } else {
            Write-Host "  ℹ Tables promotions dans SETUP_COMPLET.sql - deja executees" -ForegroundColor DarkYellow
        }
    } else {
        Write-Host "  ✓ Tables promotions creees" -ForegroundColor Green
    }
}

# ── ÉTAPE 3 : Déploiement WAR ────────────────────────────────
Write-Host ""
Write-Host "[3/4] Deploiement du WAR vers Tomcat..." -ForegroundColor Yellow

# Arrêter Tomcat si en cours
Write-Host "  --> Arret de Tomcat (si actif)..." -ForegroundColor Cyan
$tomcatProcess = Get-Process -Name "tomcat*" -ErrorAction SilentlyContinue
if ($tomcatProcess) {
    Stop-Process -Name "tomcat*" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  ✓ Tomcat arrete" -ForegroundColor Green
} else {
    Write-Host "  ℹ Tomcat n'etait pas en cours" -ForegroundColor DarkYellow
}

# Supprimer l'ancien déploiement
$OldDeployDir = "$WebApps\supermarche-jee"
if (Test-Path $OldDeployDir) {
    Write-Host "  --> Suppression de l'ancien deploiement..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force $OldDeployDir -ErrorAction SilentlyContinue
    Write-Host "  ✓ Ancien deploiement supprime" -ForegroundColor Green
}
if (Test-Path $WarDest) {
    Remove-Item -Force $WarDest -ErrorAction SilentlyContinue
}

# Copier le nouveau WAR
if (Test-Path $WarSource) {
    Copy-Item $WarSource $WarDest
    Write-Host "  ✓ WAR copie : $WarDest" -ForegroundColor Green
} else {
    Write-Host "  ✗ WAR introuvable : $WarSource" -ForegroundColor Red
    Write-Host "    → Compilez d'abord avec Eclipse (Export > WAR)" -ForegroundColor Red
}

# ── ÉTAPE 4 : Démarrer Tomcat ────────────────────────────────
Write-Host ""
Write-Host "[4/4] Demarrage de Tomcat..." -ForegroundColor Yellow
Start-Process "$TomcatBin\catalina.bat" -ArgumentList "start" -NoNewWindow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  DEPLOIEMENT TERMINE !" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend  : http://localhost:8080/supermarche-jee/api/auth/me" -ForegroundColor Cyan
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "  COMPTES ADMIN :" -ForegroundColor Yellow
Write-Host "  [Super Admin]       admin@supermarche.com      / admin123" -ForegroundColor White
Write-Host "  [Admin Produits]    sophie.martin@email.fr     / mdp123456" -ForegroundColor White
Write-Host "  [Admin Stock]       marc.dupuis@supermarche.com / stock2026" -ForegroundColor White
Write-Host ""
Write-Host "  COMPTES CLIENT :" -ForegroundColor Yellow
Write-Host "  claire.dupont@email.fr  / claire2026" -ForegroundColor White
Write-Host "  lucas.rousseau@email.fr / lucas2026" -ForegroundColor White
Write-Host ""

Read-Host "Appuyez sur Entree pour fermer"
