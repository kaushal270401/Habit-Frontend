import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://habit-keycloak-1.onrender.com",
  realm: "habit-app",
  clientId: "habit-client"
});

export default keycloak;