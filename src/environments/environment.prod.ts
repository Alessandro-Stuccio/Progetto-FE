export const environment = {
  production: true,
  // Vuoto = stesso dominio del backend (servito tramite Caddy).
  // Le chiamate REST diventano relative ("/api/...") e la WebSocket usa
  // automaticamente l'origine corrente ("wss://<dominio>/ws/websocket").
  // Se un giorno frontend e backend fossero su domini diversi, metti qui
  // l'URL assoluto del backend, es: 'https://api.miosito.it'
  apiUrl: ''
};
