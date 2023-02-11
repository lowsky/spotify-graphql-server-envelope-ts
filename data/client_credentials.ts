/**
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 *
 * #authenticate() creates Promise for fetching a new authentication token with a `expire in ... ` information
 * which will be stored and used in the `isExpired()` check.
 *
 * Note: if `authenticate()` was not resolved yet, so there was no expire-information yet, the isExpired() will always
 * return `false`
 */

import {fetch} from "@whatwg-node/fetch";

const {
    CLIENT_ID = 'invalid',
    CLIENT_SECRET = 'invalid'
} = process.env;

const authorizationHeader = () => 'Basic ' + (Buffer.alloc(CLIENT_ID.length + CLIENT_SECRET.length +1, CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'));

const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
};

//
let expireTime = 0;

type TOKEN = {
    access_token: string
    expires_in: string
};

export default {
    isExpired: () => {
        if(expireTime) {
            return Date.now() > expireTime;
        }
        return false;
    },
    authenticate: async (): Promise<TOKEN> => {
        const options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization': authorizationHeader()
            },
            method: 'POST',
            body: 'grant_type=client_credentials'
        };

        return fetch(authOptions.url, options)
            .then((response) => {
                return response.json() as Promise<TOKEN>;
            })
            .then((token) => {
                const time = Date.now();
                const expires_in = Number.parseInt(token.expires_in, 10);

                expireTime = time + expires_in * 1000; //

                return token;
            });
    }
};
