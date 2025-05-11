var api =
  'https://reservationapi-c0b4csane9dab2cu.uaenorth-01.azurewebsites.net/api';

var signal =
  'https://reservationapi-c0b4csane9dab2cu.uaenorth-01.azurewebsites.net/notificationHub';

// signal = 'https://localhost:7217/notificationHub';
// api = 'https://localhost:7217/api';

export const environment = {
  production: false,

  apiUrl: api,
  signalRHubUrl: signal,
};
