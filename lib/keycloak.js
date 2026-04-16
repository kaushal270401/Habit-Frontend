import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "habit-app",
  clientId: "habit-client"
});

export default keycloak;