# Healthy Reentry

Healthy Reentry is a web app to track in-person encounters within an organization. Members of the organization can use their mobile devices or computers to securely track interpersonal encounters, and share their current [COVID-19] status with designated members of the Talent Team. The app keeps track of the contacts and alerts members if they may have been exposed to risk.  

## Heroku Demo Site
https://healthyreentry-dev.herokuapp.com/

## Screenshots
**Home Page**  
![Healthy Reentry Home Page](./docs/imgs/screenshots_homepage.png)

**Status Screen**  
![Healthy Reentry Status Screen](./docs/imgs/screenshots_status.png)

**Encounter Screen**  
![Healthy Reentry Encounter Screen](./docs/imgs/screenshots_encounter.png)

**QR Code Screen**  
![Healthy Reentry QR Code Screen](./docs/imgs/screenshots_qrCode.png)

**Admin Screen**  
![Healthy Reentry Admin Screen](./docs/imgs/screenshots_admin.png)

## Quickstart
The project is based on a few external services (Auth0, SendGrid, MongoDB). If you need help setting up that check the [detailed development guide](./docs/dev-details.md) and come back to this. The quickstart assumed you have all values for `.env` file configuration ([Setup .env file](https://github.com/ThorntonTomasetti/HealthyReentry/blob/dev-OpenSourceDocumentation/docs/dev-details.md#populate-the-env-file)).  
- Clone the project: `git clone https://github.com/ThorntonTomasetti/HealthyReentry.git`
- Navigate into the project: `cd HealthyReentry`
- Install modules for the project: `npm install`
- Update the env file with secrets and save it as `.env` ([Setup .env file](https://github.com/ThorntonTomasetti/HealthyReentry/blob/dev-OpenSourceDocumentation/docs/dev-details.md#populate-the-env-file))
- Start the local server by running `npm run dev`
- Go to your browser at `https://localhost:8081`

## Development
The app is built as a web app running an [Express](https://expressjs.com/) server with a [Vue](https://vuejs.org/) front end and has been designed for use on desktop and mobile devices. It can be deployed on any server running [NodeJS]() and has been tested for deployment on [Heroku](https://heroku.com/).  
Check out the [detailed development guide](./docs/dev-details.md) to learn more.  

## Test  
???

## Contributions
Are you interested in enhance this product? We're really glad and thanks a lot!  
Open up an issue to discuss.  

## External Services

### Auth0
User authentication is not a part of the application. It uses Auth0 to handle that. [Auth0](https://auth0.com/docs/getting-started/overview) is a drop-in solution to add authentication and authorization services to your applications.  

### SendGrid
The app does not directly send emails. It can integrate with your choice of email service to send out emails for notifications and this version is configured for SendGrid. [SendGrid](https://sendgrid.com/) provides customer communication platform for transactional and marketing emails.  

### MongoDB
The app needs to be connected to a database service to store your records. This version integrates with [MongoDB](https://www.mongodb.com/) and has been tested against [Atlas](https://www.mongodb.com/cloud/atlas).  

Feel free to fork the project and build out your own choice of alternatives for these services.  

## Useful commands
- Setup project and install dependencies: `npm install`
- Start development mode with hot-reloads: `npm run dev`
- Build files for production: `npm run build`
- Start production server: `npm start`
- Lint and fix files: `npm run lint`

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Authors
???

## Acknowledgements
???
