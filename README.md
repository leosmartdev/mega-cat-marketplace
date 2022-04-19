# Mega Cat Labs Marketplace

This project is an admin template and starter project for the [Mega Cat Labs](https://labs.megacatstudios.com/) Marketplace. 
It will serve as the foundation upon which the rest of the NFT marketplace application is built out.

This project utilizes [Fuse](http://angular-material.fusetheme.com/dashboards/project). For a sample of the page templates that are available you can look at the Fuse Demo project.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli)

## Getting Started

1. Start backend server (in separate terminal)
```javascript
cd /server

// Setup Mongo
mkdir db && mkdir logs
mongod --fork --logpath ./logs/log --dbpath ./db

// Run Backend REST API
npm run start
```

2. Start Angular app
```javascript

ng serve // == ng serve --configuration development
// Staging
ng serve -c staging

// Production
ng serve -c production
```

## CI/CD
Amplify deployments are configured using `amplify.yml`. This file expects the following environment variables to be set via your Amplify configuration.
* BUILD_TARGET    // eg: mcl-staging
* BUILD_SCRIPT    // eg: build-mcl-staging

In our `amplify.yml` script we can pull in these variables using `$BUILD_TARGET`.

We need this configuration because we have multiple templates (skins) in a single branch. This choice was made to reduce churn and conflicts during development.



## Code Quality
Be sure to run npm i to get latest dev tools.  Run the following two commands before submitting merge requests.
```
ng test --no-watch
npm run lint:fix
```


## Client-side Angular Debugging with VS Code
Instructions for setting up VS Code for debugging can be found [here](https://github.com/microsoft/vscode-js-debug).
We've already included the correct files for VS Code in source control. (`launch.json` and `tasks.json`).

To start debugging simply:
1. set breakpoint(s)
2. open the `Run and Debug` window (shift+cmd+D on OSX) 
2. select the `ng serve` configuration from the drop-down
3. click the 'Play' button (green arrow) or hit F5.

## Troubleshooting

Find & kill local mongo instance
```
kill -2 `pgrep mongo`
```

Start fresh mongodb instance
```
mongod --fork --logpath ./logs/log --dbpath ./db
```

Verify it works
```
mongosh // equivalent to mongosh "mongodb://localhost:27017"
> db.getMongo()
```

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Configuration of Fuse
The configurations for changing layout, scheme and theme is in app/core/config/app.config.ts.

To access, update and reset the config, use
* FuseConfigService and its methods.

**NOTE:**
Up to now all work has been done only on classy layout (located in layout/layouts/vertical/classy)

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
