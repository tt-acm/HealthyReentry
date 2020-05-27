# Healthy Reentry

This guide assumes you are familiar with the basic setup as described in the [README](../README.md).  

## Backend Setup

## Front End Setup

## Populate the .env file
### Update the port
On the dev setup the port value from the env file runs the backend api service, with port+1 running the server for front-end client and the backend calls are proxied over to the backend service.  
In production the front end and backend is run from the same port as specified in the env file.  

### Setup Auth0
- Sign up with [Auth0](https://auth0.com/signup).  
- Click on 'CREATE APPLICATION'.  
![Create a new auth0 app](./imgs/auth0_01.png)
- Give the app a name of your choosing. Remember this, we will need it soon. Select 'Single Page Web Application' for application type.  
![Name your auth0 app](./imgs/auth0_02.png)
- Go to the 'App Settings' tab and copy the 'Domain' and 'Client ID'. These will be the `AUTH0_DOMAIN` and `AUTH0_CLIENT_ID` in the env file.  
![Copy app domain and client id](./imgs/auth0_03.png)
- Add all URLs your app would be running on (including development ones) to these 3 text boxes (comma seperated, no slashes at the end).  
![Add URLs](./imgs/auth0_04.png)
- Use the following format to update `AUTH0_JWKS_URI` and `AUTH0_TOKEN_ISSUER` in the env.
```
AUTH0_JWKS_URI: https://<YOUR-APP-NAME>.auth0.com/.well-known/jwks.json
AUTH0_TOKEN_ISSUER: https://<YOUR-APP-NAME>.auth0.com/
```
- The complete setup for auth0 is now complete and should look something like this. If you have trouble please reach out to the dev team.  
```
AUTH0_DOMAIN=<YOUR-APP-NAME>.auth0.com
AUTH0_CLIENT_ID=<RANDOM-STRING-OF-32-CHARACTERS>
AUTH0_JWKS_URI=https://<YOUR-APP-NAME>.auth0.com/.well-known/jwks.json
AUTH0_TOKEN_ISSUER=https://<YOUR-APP-NAME>.auth0.com/
```


### Setup MongoDB Atlas
- Sign up with [MongoDB Atlas](https://account.mongodb.com/account/register).  
- Click on 'New Project'.
![Create a new Atlas project](./imgs/Atlas_CreateNewProject.png)
- Create a new project with a name you desire
- Once the project is created, create a new cluster  
![Create a new project cluster](./imgs/Atlas_BuildACluster.png)
- Create a new cluster that will host your data.
- Click on "Connect"
![Connect to cluster](./imgs/Atlas_ConnectToCluster.png)
- Go to "Setup connection security" tab
![Connect to cluster](./imgs/Atlas_SetupConnectionSecurity.png)
  1. Whitelist a connection IP address
    - Select "ADD CURRENT IP ADDRESS" for local testing, or use "0.0.0.0/0" for production deployment
  ![Add to whitelist 1](./imgs/Atlas_AddWhiteList.png)
  ![Add to whitelist 2](./imgs/Atlas_AddToWhiteList.png)

  2. Create a MongoDB User
    - Create a new database user with specific access
  ![Create new DB user 1](./imgs/Atlas_CreateNewDBUser.png)
  ![Create new DB user 2](./imgs/Atlas_DBUserCredential.png)


- Navigate back to cluster connection modal, go to "Choose a connection method" tab, then click on "Connection your application"
![Choose connection method](./imgs/Atlas_ChooseConnectionMethod.png)
- Choose Node.js as your driver, and use the driver code example below in your .env file as the "MONGO_URL". Replace the keywords in the example with your DB username and password. 
![Create connection string](./imgs/Atlas_GenerateConnectionString.png)


### Get SendGrid credentials

### Get MongoDB credentials
