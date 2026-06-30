# Checklist modifiche al BACKEND (Spring Boot)

Il backend deve essere "pronto per il cloud": niente valori cablati, Postgres,
upload su cartella configurabile, WebSocket che accetta l'origine del sito.

## 1. Dipendenza Postgres
Aggiungi il driver (Maven `pom.xml`):
```xml
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <scope>runtime</scope>
</dependency>
```
(Gradle: `runtimeOnly 'org.postgresql:postgresql'`)

## 2. application.properties — leggi le variabili d'ambiente
```properties
# Database (le variabili arrivano da docker-compose)
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.jpa.hibernate.ddl-auto=${SPRING_JPA_HIBERNATE_DDL_AUTO:update}
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Porta
server.port=${PORT:8080}

# Cartella dove salvi i file caricati (PDF/foto). DEVE essere configurabile,
# così punta al volume persistente /data/uploads del container.
app.upload-dir=${APP_UPLOAD_DIR:./uploads}
```
> Nel codice che salva i file, usa `app.upload-dir` (es. `@Value("${app.upload-dir}")`)
> invece di un percorso fisso.

## 3. JWT secret da variabile d'ambiente
Dove firmi/verifichi i token, leggi `${JWT_SECRET}` invece di una stringa nel codice.

## 4. WebSocket — consenti l'origine del sito
Nel tuo `WebSocketConfig` (registrazione endpoint STOMP):
```java
registry.addEndpoint("/ws").setAllowedOriginPatterns("*");
// niente withSockJS(): il frontend usa WebSocket nativa su /ws/websocket
```

## 5. CORS
Con questo deploy frontend e backend stanno sullo **stesso dominio** (Caddy fa da
proxy), quindi **CORS non serve**. Se in futuro li separi su domini diversi,
abilita CORS per l'origine del frontend (sia REST che WebSocket).

## 6. Dockerfile
Copia `backend.Dockerfile.example` nella radice del repo backend come `Dockerfile`.
