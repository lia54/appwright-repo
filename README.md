# Appwright using a custom CLI 

This is a sample project with a simple custom CLI to demonstrate how to submit and check status of jobs that test the Appwright project. This uses mobile apps from Wikipedia using the same test folder from the Appwright tests project. 

It also uses github workflows to check using the GitHub Actions Integration and runs the qgjob CLI submit tests, polls for completion of the tests and check for fails build if any test fails.
The github actions is trigger in any push command to the repo. 

## Overview

This application environment is defined in the package.json file for a custom CLI application that uses BullMQ for job processing, Commander for command-line interface, Express for web server functionality, and IORedis for Redis interactions.
The CLI application allows users to add jobs to a queue, process them, and manage job states.
The application is structured to handle job processing in a worker script, and it includes a command-line interface for user interaction.

## Dependencies 

The dependencies include:

  - commander: A library for building command-line interfaces.
  - express: A web framework for building web applications in Node.js.
  - ioredis: A Redis client for Node.js that supports promises and is used for interacting with Redis
  - redis: A Redis library to run redis-server
  - uuid: A library to generate unique job IDs
  - body-parser: A library to parse JSON HTTP requests
  - appwright: A library to use the Appwright test framework for e2e testing of mobile apps
  - bullmq: This library is install as dependency but it is not used in the project but can be used if needed.

To install dependencies:

```sh
npm install commander express ioredis redis uuid body-parser appwright bullmq
```

The package.json file defines the application name, version, description, main entry point, binary command, scripts, keywords, author, license, and dependencies.
The application is designed to be run from the command line, and it provides functionality for adding jobs to a queue, processing those jobs, and handling job events such as completion and errors.

The CLI command is defined as "qgjob", which can be used to interact with the application from the command line.

## Usage

### The content of the ci.yml file executed in the Github Action

```sh
name: AppWright Test
on: [push]
jobs:
  run-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: | 
          node --version 
          npm --version 
          sudo npm install -g . --force
          sudo apt install redis-server
          sudo service redis-server start
          sudo npm start & # Start the server in the background
          qgjob submit --org-id=qualgent --app-version-id=xyz123 --test=tests/onboarding.spec.js
          qgjob status --job-id=12345
```
The sudo npm install command with the options will install all the dependencies and devDependencies listed in the package.json file. 

### Run the tests

To run the tests on the repository directory:

```sh
git push origin main
```

That will trigger the system and run the tests in Android and iOS simulators. The example that are consider are the followings:
```sh
npx appwright test --project android
npx appwright test --project ios
npx appwright test --project android-emulator
npx appwright test --project android-emulator-11
npx appwright test --project android-real
npx appwright test --project android-pixel-4
npx appwright test --project ios-iphone-12
npx appwright test --project browserstack
npx appwright test --project web
npx appwright test --project web-headful
npx appwright test --project web-firefox
npx appwright test --project web-safari
npx appwright test --project web-chrome
npx appwright test --project web-edge
```




 

