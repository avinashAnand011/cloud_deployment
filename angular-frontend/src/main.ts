import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { OAuthModule, OAuthStorage, AuthConfig } from 'angular-oauth2-oidc'; // Import necessary OAuth modules

import { AppComponent } from './app/app.component';
import { ItemService } from './app/item.service'; // Ensure ItemService is imported

// Define your AuthConfig here, as it's part of the root providers
const authConfig: AuthConfig = {
  issuer: 'http://192.168.49.2:30090/realms/my-app-realm', // Keycloak Issuer URL
  redirectUri: window.location.origin, // Where Keycloak redirects back to (e.g., http://<minikube-ip>:30080)
  clientId: 'angular-client', // Client ID you configured in Keycloak
  scope: 'openid profile email', // Standard OpenID Connect scopes
  responseType: 'code', // Authorization Code Flow
  disableAtHashCheck: true, // Set to false in production if at_hash is present
  showDebugInformation: true, // For debugging
  strictDiscoveryDocumentValidation: false, // For Minikube/local setup, set to true in production
  oidc: true, // Important for OIDC
  requireHttps: false, // For Minikube/local setup, set to true in production
};

bootstrapApplication(AppComponent, {
  providers: [
    // Import modules as providers
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(FormsModule),
    importProvidersFrom(OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['http://spring-boot-service:8080/api/items'], // Your backend API base URL
        sendAccessToken: true, // Send access token to these URLs
      }
    })),
    // Provide OAuthStorage
    { provide: OAuthStorage, useValue: localStorage },
    // Provide your ItemService
    ItemService,
    // Provide the AuthConfig for the OAuthService.
    // The OAuthService itself is provided by OAuthModule.forRoot()
    // We configure it here.
    { provide: AuthConfig, useValue: authConfig }
  ]
}).catch(err => console.error(err));
