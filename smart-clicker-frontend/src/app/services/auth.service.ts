import { Inject, Injectable } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { InteractionType } from '@azure/msal-browser';
import { env } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class AuthService {

    constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration, private msalService: MsalService) {
    }

    logout() {
        if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
            this.msalService.logoutPopup({
                postLogoutRedirectUri: '/',
                mainWindowRedirectUri: '/'
            });
        } else {
            this.msalService.logoutRedirect({
                postLogoutRedirectUri: '/',
            });
        }
    }

    getAllAccounts() {
        return this.msalService.instance.getAllAccounts();
    }

    async getToken() {
        const response = await this.msalService.instance.acquireTokenSilent({ account: this.getAllAccounts()[0], scopes: [`${env.TOKEN_SCOPE}`] })
        return response.accessToken;
    }

    getUserId() {
        return this.getAllAccounts()[0].localAccountId;
    }
}
