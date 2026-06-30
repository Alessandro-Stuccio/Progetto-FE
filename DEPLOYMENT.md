# Deploy di kore online (gratis, sempre acceso) — guida passo-passo

Mettiamo online **frontend + backend + database + file** su **una VM Oracle Cloud
Always Free** (gratuita per sempre, sempre accesa), con HTTPS automatico e un
dominio gratuito DuckDNS.

```
Internet ──HTTPS──> [ VM Oracle, sempre accesa ]
                      └─ Caddy (porta 443)  ──> serve il sito Angular
                          ├─ /api/*  ─┐
                          └─ /ws/*   ─┴─> Spring Boot (8080, interno)
                                              └─> Postgres (interno)
                                              └─> /data/uploads (file persistenti)
```

Un solo dominio, niente CORS, WebSocket sullo stesso indirizzo. Tutto in container
Docker, orchestrati da `docker compose`.

---

## Cosa ti serve prima di iniziare
- Gli URL Git dei due repository: **frontend** (questo) e **backend** (Spring Boot).
- ~1 ora la prima volta. Poi gli aggiornamenti sono un comando solo.
- Una carta (solo per la verifica account Oracle: **non viene addebitata** sui servizi Always Free).

---

## STEP 1 — Prepara il backend (repo Spring Boot)
Segui la checklist in **`deploy/backend-checklist.md`** di questo repo. In sintesi:
1. Aggiungi il driver **PostgreSQL**.
2. In `application.properties` leggi DB, porta, `JWT_SECRET`, `APP_UPLOAD_DIR` da
   variabili d'ambiente; salva i file caricati in `app.upload-dir` (non un percorso fisso).
3. WebSocket: `registry.addEndpoint("/ws").setAllowedOriginPatterns("*")`.
4. Copia `deploy/backend.Dockerfile.example` nella radice del repo backend come **`Dockerfile`**
   (adatta la versione di Java).
Committa e pusha queste modifiche al backend.

---

## STEP 2 — Crea la VM su Oracle Cloud (Always Free)
1. Registrati su **https://www.oracle.com/cloud/free/** → "Start for free". Scegli la
   tua **Home Region** vicina (es. Frankfurt/Milan) — non si cambia dopo.
2. Dalla console: **Menu → Compute → Instances → Create Instance**.
3. **Image and shape**:
   - *Image*: **Canonical Ubuntu 22.04**.
   - *Shape*: clicca "Change shape" → preferisci **Ampere (VM.Standard.A1.Flex)**,
     imposta **1 OCPU / 6 GB** (è gratis fino a 4 OCPU/24 GB). Se dà *"Out of host
     capacity"*, riprova più tardi o scegli **VM.Standard.E2.1.Micro** (AMD, 1 GB,
     sempre disponibile — in tal caso vedi la nota RAM nel Troubleshooting).
4. **SSH keys**: genera una chiave sul tuo PC e incolla la **pubblica**.
   - Sul tuo PC (Git Bash): `ssh-keygen -t ed25519 -f ~/.ssh/kore` → incolla il
     contenuto di `~/.ssh/kore.pub`.
5. **Networking**: lascia "Create new VCN" (subnet pubblica). Crea l'istanza.
6. Quando è "Running", copia l'**IP pubblico** (es. `123.45.67.89`).

> 💡 **Fissa l'IP** (così non cambia): Networking → della VNIC → IP pubblico →
> "Reserved". Altrimenti, se fermi la VM, l'IP potrebbe cambiare e dovrai aggiornarlo su DuckDNS.

---

## STEP 3 — Apri le porte 80 e 443
Vanno aperte in **due** posti (è la dimenticanza più comune su Oracle).

**A) Security List (firewall di rete Oracle)**
Networking → Virtual Cloud Networks → la tua VCN → Security Lists → Default →
**Add Ingress Rules**, due regole:
- Source `0.0.0.0/0`, IP Protocol `TCP`, Destination Port `80`
- Source `0.0.0.0/0`, IP Protocol `TCP`, Destination Port `443`

**B) Firewall del sistema operativo** (collegati prima in SSH, vedi sotto), poi:
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

Collegati alla VM (dal tuo PC):
```bash
ssh -i ~/.ssh/kore ubuntu@IL_TUO_IP
```

---

## STEP 4 — Dominio gratuito (DuckDNS)
1. Vai su **https://www.duckdns.org**, accedi (GitHub/Google).
2. Crea un sottodominio, es. **`kore-tesi`** → diventerà `kore-tesi.duckdns.org`.
3. Nel campo **current ip** metti l'**IP pubblico** della VM e premi "update ip".
4. Verifica: `ping kore-tesi.duckdns.org` deve rispondere con il tuo IP.

> Questo sarà il tuo indirizzo pubblico. Caddy ci otterrà il certificato HTTPS da solo.

---

## STEP 5 — Installa Docker sulla VM
Nella sessione SSH:
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
exit
```
Ricollegati (`ssh -i ~/.ssh/kore ubuntu@IL_TUO_IP`) per applicare il gruppo, poi
verifica: `docker run --rm hello-world`.

---

## STEP 6 — Porta il progetto sulla VM
```bash
mkdir -p ~/kore && cd ~/kore
git clone URL_DEL_REPO_FRONTEND frontend
git clone URL_DEL_REPO_BACKEND  backend

# orchestrazione
cp frontend/deploy/docker-compose.yml .
cp frontend/deploy/.env.example .env

# se il backend non ha ancora un Dockerfile, usa l'esempio:
# (salta se l'hai già aggiunto allo STEP 1)
[ -f backend/Dockerfile ] || cp frontend/deploy/backend.Dockerfile.example backend/Dockerfile
```

---

## STEP 7 — Configura i segreti (.env)
```bash
nano ~/kore/.env
```
Compila:
- `DB_PASSWORD` → una password robusta.
- `JWT_SECRET` → generane uno: in un altro terminale `openssl rand -base64 48`.
- `SITE_ADDRESS` → il tuo dominio, es. `kore-tesi.duckdns.org` (senza `http://`).

Salva (Ctrl+O, Invio, Ctrl+X).

---

## STEP 8 — Avvia tutto
```bash
cd ~/kore
docker compose up -d --build
```
La prima build dura qualche minuto (compila Angular e il backend). Segui i log:
```bash
docker compose logs -f
```
Quando vedi Caddy che ottiene il certificato e il backend "Started", è pronto.
Stato dei container: `docker compose ps`.

---

## STEP 9 — Verifica
Apri nel browser: **`https://IL_TUO_DOMINIO`** (es. `https://kore-tesi.duckdns.org`).
- 🔒 Il lucchetto HTTPS è presente.
- Registra un utente e fai **login**.
- Apri la **chat** e manda un messaggio → verifica la WebSocket (niente errori in
  Console del browser; deve usare `wss://`).
- Carica un **PDF** in un documento, poi:
  ```bash
  docker compose restart backend
  ```
  ricarica la pagina → il PDF **c'è ancora** (storage persistente ✅).
- Provalo da **telefono** e da un secondo dispositivo/persona.

---

## STEP 10 — Aggiornare il sito in futuro
Ogni volta che cambi codice e fai push:
```bash
cd ~/kore
git -C frontend pull
git -C backend pull
docker compose up -d --build
```
I dati (database e file) restano: sono su volumi Docker persistenti.

Backup veloce del database:
```bash
docker compose exec db pg_dump -U kore kore > ~/backup_$(date +%F).sql
```

---

## Troubleshooting
- **HTTPS non parte / "certificato non valido"**: il DNS DuckDNS deve puntare
  all'IP della VM e le porte **80 e 443** devono essere aperte in *entrambi* i posti
  (Security List **e** iptables, STEP 3). Guarda `docker compose logs web`.
- **Il backend non parte**: `docker compose logs backend`. Cause comuni: manca il
  driver Postgres, oppure `application.properties` non legge le variabili d'ambiente
  (STEP 1).
- **La chat non si connette**: dev'essere su `wss://` (cioè HTTPS attivo) e il backend
  deve avere `setAllowedOriginPatterns("*")` sull'endpoint `/ws`.
- **Foto profilo o documenti non si caricano**: se il backend li serve da un percorso
  diverso da `/api`, aggiungilo al matcher nel `Caddyfile` (es. `/uploads/*`) e
  `docker compose up -d --build web`.
- **Poca RAM (hai dovuto usare la micro AMD da 1 GB)**: sposta il database su **Neon**
  (Postgres gratis): rimuovi il servizio `db` dal compose e imposta
  `SPRING_DATASOURCE_URL=jdbc:postgresql://HOST_NEON/DB?sslmode=require` con utente/password
  di Neon. Così la VM esegue solo backend + Caddy.
- **Oracle "Out of host capacity" sulla shape ARM**: riprova più tardi o crea la VM
  con **VM.Standard.E2.1.Micro** (sempre disponibile).

---

## File di deploy in questo repo
- `Dockerfile` + `Caddyfile` → immagine del frontend (build Angular + Caddy proxy/HTTPS).
- `deploy/docker-compose.yml` → orchestrazione web + backend + db.
- `deploy/.env.example` → segreti da compilare.
- `deploy/backend.Dockerfile.example` → Dockerfile da mettere nel repo backend.
- `deploy/backend-checklist.md` → modifiche necessarie al backend.
