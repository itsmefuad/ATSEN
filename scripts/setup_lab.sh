#!/usr/bin/env bash
set -euo pipefail

# ATSEN lab setup script
# - Installs essentials (git, curl, build tools)
# - Installs Node via nvm (LTS)
# - Optionally installs MongoDB locally
# - Clones ATSEN repo and checks out a branch
# - Creates backend .env (local Mongo or Atlas)
# - Disables rate limiter locally (no Upstash creds)
# - Installs deps and starts backend + frontend

REPO_URL_DEFAULT="https://github.com/itsmefuad/ATSEN.git"
BRANCH_DEFAULT="Bokhtiar"
CLONE_DIR_DEFAULT="$HOME/ATSEN"
MONGO_MODE_DEFAULT="local"         # local|atlas
INSTALL_MONGO_DEFAULT="no"         # yes|no
ATLAS_URI_DEFAULT=""

REPO_URL="$REPO_URL_DEFAULT"
BRANCH="$BRANCH_DEFAULT"
CLONE_DIR="$CLONE_DIR_DEFAULT"
MONGO_MODE="$MONGO_MODE_DEFAULT"
INSTALL_MONGO="$INSTALL_MONGO_DEFAULT"
ATLAS_URI="$ATLAS_URI_DEFAULT"
SKIP_CLONE="no"

usage() {
  cat <<EOF
Usage: $0 [options]

Options:
  --repo-url URL          Git repo URL (default: $REPO_URL_DEFAULT)
  --branch NAME           Git branch to checkout (default: $BRANCH_DEFAULT)
  --clone-dir PATH        Where to clone (default: $CLONE_DIR_DEFAULT)
  --skip-clone            Use existing directory; do not clone
  --mongo MODE            'local' or 'atlas' (default: $MONGO_MODE_DEFAULT)
  --install-mongo yes|no  Install MongoDB locally (default: $INSTALL_MONGO_DEFAULT)
  --atlas-uri URI         MongoDB Atlas connection string (required if --mongo atlas)
  -h, --help              Show help

Examples:
  # Local Mongo (installs MongoDB), clone and run
  $0 --install-mongo yes

  # Use Atlas instead of local Mongo
  $0 --mongo atlas --atlas-uri "mongodb+srv://user:pass@cluster/atsen?retryWrites=true&w=majority"

  # Use existing clone folder
  $0 --skip-clone --clone-dir "$HOME/ATSEN"
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo-url) REPO_URL="$2"; shift 2 ;;
    --branch) BRANCH="$2"; shift 2 ;;
    --clone-dir) CLONE_DIR="$2"; shift 2 ;;
    --skip-clone) SKIP_CLONE="yes"; shift ;;
    --mongo) MONGO_MODE="$2"; shift 2 ;;
    --install-mongo) INSTALL_MONGO="$2"; shift 2 ;;
    --atlas-uri) ATLAS_URI="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

echo "[1/9] Installing essentials (git, curl, build tools, jq)..."
sudo apt update -y
sudo apt install -y git curl build-essential jq

ensure_nvm_and_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "[2/9] Installing nvm and Node LTS..."
    if [[ ! -d "$HOME/.nvm" ]]; then
      curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    fi
    export NVM_DIR="$HOME/.nvm"
    # shellcheck disable=SC1090
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    nvm install --lts
    nvm use --lts
  else
    echo "[2/9] Node already installed: $(node -v)"
    # Ensure nvm is sourced if present for subsequent shells
    if [[ -d "$HOME/.nvm" ]]; then
      export NVM_DIR="$HOME/.nvm"
      # shellcheck disable=SC1090
      [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    fi
  fi
  echo "npm: $(npm -v)"
}

install_mongodb_if_requested() {
  if [[ "$MONGO_MODE" == "local" && "$INSTALL_MONGO" == "yes" ]]; then
    echo "[3/9] Installing MongoDB Community Edition..."
    CODENAME=$(lsb_release -sc)
    KEYRING="/usr/share/keyrings/mongodb-server-7.0.gpg"
    echo "- Ubuntu codename: $CODENAME"
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o "$KEYRING"
    echo "deb [signed-by=$KEYRING] https://repo.mongodb.org/apt/ubuntu $CODENAME/mongodb-org/7.0 multiverse" | \
      sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list >/dev/null
    sudo apt update -y
    sudo apt install -y mongodb-org
    sudo systemctl enable --now mongod
    sudo systemctl status mongod --no-pager || true
  else
    echo "[3/9] Skipping MongoDB install (mode=$MONGO_MODE, install=$INSTALL_MONGO)"
  fi
}

clone_repo_if_needed() {
  if [[ "$SKIP_CLONE" == "yes" ]]; then
    echo "[4/9] Skipping clone, using existing directory: $CLONE_DIR"
    return
  fi
  echo "[4/9] Cloning repo: $REPO_URL -> $CLONE_DIR"
  rm -rf "$CLONE_DIR"
  git clone "$REPO_URL" "$CLONE_DIR"
}

checkout_branch() {
  echo "[5/9] Checking out branch: $BRANCH"
  cd "$CLONE_DIR"
  git fetch --all --prune
  git checkout "$BRANCH"
}

create_backend_env() {
  echo "[6/9] Creating backend .env"
  cd "$CLONE_DIR/backend"
  if [[ "$MONGO_MODE" == "atlas" ]]; then
    if [[ -z "$ATLAS_URI" ]]; then
      echo "ERROR: --mongo atlas requires --atlas-uri" >&2
      exit 1
    fi
    cat > .env <<EOF
PORT=5001
MONGO_URI=$ATLAS_URI
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
EOF
  else
    cat > .env <<'EOF'
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/atsen
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
EOF
  fi
}

disable_rate_limiter_locally() {
  echo "[7/9] Disabling rate limiter locally (no Upstash creds present)"
  cd "$CLONE_DIR/backend/src"
  if grep -qE '^[[:space:]]*app\.use\(rateLimter\);' server.js; then
    sed -i 's/^[[:space:]]*app\.use(rateLimter);/\/\/ app.use(rateLimter);/' server.js
  fi
}

install_dependencies() {
echo "[8/9] Installing dependencies (backend, frontend)"
cd "$CLONE_DIR/backend" && npm ci --no-audit --no-fund
# ensure dev helpers installed for combined run
npm install --no-audit --no-fund --no-progress open-cli wait-on
cd "$CLONE_DIR/frontend" && npm ci --no-audit --no-fund
}

start_services() {
echo "[9/9] Starting backend and frontend together and opening browser"
cd "$CLONE_DIR/backend"
npm run dev:all:open
}

main() {
  ensure_nvm_and_node
  install_mongodb_if_requested
  clone_repo_if_needed
  checkout_branch
  create_backend_env
  disable_rate_limiter_locally
  install_dependencies
  start_services
}

main "$@"


