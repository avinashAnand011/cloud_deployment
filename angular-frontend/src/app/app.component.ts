import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for *ngIf, *ngFor
import { FormsModule } from '@angular/forms'; // Required for [(ngModel)]
import { OAuthService, AuthConfig, OAuthModule } from 'angular-oauth2-oidc'; // Import OAuthService and OAuthModule

import { Item, ItemService } from './item.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // For Angular directives like *ngIf, *ngFor
    FormsModule,  // For [(ngModel)]
    // OAuthModule is provided at the root level in main.ts,
    // so it doesn't need to be imported here unless you use specific OAuth components directly.
    // However, it's good practice to include it if you use any of its directives/pipes,
    // but for just the service, it's not strictly necessary here.
    // We'll primarily provide it via main.ts.
  ]
})
export class AppComponent implements OnInit {
  title = 'Angular Spring Boot CRUD';
  items: Item[] = [];
  newItem: Item = { name: '', description: '' };
  selectedItem: Item | null = null;
  editMode = false;

  currentName: string = '';
  currentDescription: string = '';

  isAuthenticated: boolean = false;
  userName: string | null = null;
  userRoles: string[] = [];
  isAdmin: boolean = false;

  constructor(private itemService: ItemService, private oauthService: OAuthService) {
    // Configuration moved to main.ts for root-level provisioning
    // this.configureOAuth(); // This call is no longer needed here
  }

  ngOnInit(): void {
    // The OAuthService will be configured when the application bootstraps in main.ts
    // We just need to load discovery document and try login here.
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      this.updateAuthStatus();
      if (this.isAuthenticated) {
        this.loadItems();
      }
    });

    // Listen for token events to update UI
    this.oauthService.events.subscribe(event => {
      if (event.type === 'token_received' || event.type === 'logout') {
        this.updateAuthStatus();
        if (!this.isAuthenticated) {
          this.items = []; // Clear items on logout/token invalidation
        } else {
          this.loadItems(); // Reload items if authenticated
        }
      }
    });

    this.resetForm();
  }

  // OAuth configuration is now handled in main.ts
  // private configureOAuth() { ... }

  login() {
    this.oauthService.initCodeFlow(); // Initiates the login redirect to Keycloak
  }

  logout() {
    this.oauthService.logOut(); // Clears tokens and redirects to Keycloak logout
    // updateAuthStatus will be called by the event subscription
  }

  private updateAuthStatus() {
    this.isAuthenticated = this.oauthService.hasValidAccessToken();
    if (this.isAuthenticated) {
      const claims = this.oauthService.getIdentityClaims();
      this.userName = claims ? claims['preferred_username'] : null;

      const accessTokenParsed = this.oauthService.getAccessToken();
      if (accessTokenParsed) {
        const decodedToken = this.decodeJwt(accessTokenParsed);
        // Keycloak roles are often in realm_access.roles or resource_access.<client-id>.roles
        this.userRoles = decodedToken?.realm_access?.roles || decodedToken?.resource_access?.['angular-client']?.roles || [];
        this.isAdmin = this.userRoles.includes('admin');
      } else {
        this.userRoles = [];
        this.isAdmin = false;
      }
    } else {
      this.userName = null;
      this.userRoles = [];
      this.isAdmin = false;
    }
  }

  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return null;
    }
  }

  // --- Existing CRUD methods (no changes needed here, as Interceptor handles token) ---
  loadItems(): void {
    this.itemService.getItems().subscribe(
      (data) => {
        this.items = data;
      },
      (error) => {
        console.error('Error loading items:', error);
        if (error.status === 401 || error.status === 403) {
          console.log('Authentication required or unauthorized to load items.');
          // Optionally, redirect to login or show a message
          // this.login();
        }
      }
    );
  }

  private resetForm(): void {
    this.newItem = { name: '', description: '' };
    this.selectedItem = null;
    this.editMode = false;
    this.currentName = '';
    this.currentDescription = '';
  }

  createItem(): void {
    if (!this.isAdmin) {
      console.warn('Unauthorized: Only admins can create items.');
      return;
    }
    const itemToCreate: Item = {
      name: this.currentName,
      description: this.currentDescription
    };
    this.itemService.createItem(itemToCreate).subscribe(
      (data) => {
        console.log('Item created:', data);
        this.resetForm();
        this.loadItems();
      },
      (error) => {
        console.error('Error creating item:', error);
      }
    );
  }

  editItem(item: Item): void {
    if (!this.isAdmin) {
      console.warn('Unauthorized: Only admins can edit items.');
      return;
    }
    this.selectedItem = { ...item };
    this.editMode = true;
    this.currentName = this.selectedItem.name;
    this.currentDescription = this.selectedItem.description;
  }

  updateItem(): void {
    if (!this.isAdmin) {
      console.warn('Unauthorized: Only admins can update items.');
      return;
    }
    if (this.selectedItem && this.selectedItem.id) {
      const itemToUpdate: Item = {
        id: this.selectedItem.id,
        name: this.currentName,
        description: this.currentDescription
      };
      this.itemService.updateItem(itemToUpdate.id!, itemToUpdate).subscribe(
        (data) => {
          console.log('Item updated:', data);
          this.resetForm();
          this.loadItems();
        },
        (error) => {
          console.error('Error updating item:', error);
        }
      );
    }
  }

  deleteItem(id: number | undefined): void {
    if (!this.isAdmin) {
      console.warn('Unauthorized: Only admins can delete items.');
      return;
    }
    if (id) {
      this.itemService.deleteItem(id).subscribe(
        () => {
          console.log('Item deleted:', id);
          this.loadItems();
        },
        (error) => {
          console.error('Error deleting item:', error);
        }
      );
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }
}
