#!/usr/bin/env node

const { Command, Option } = require('commander');
const program = new Command();
const path = require('path');

program
  .name('Appwright-cli')
  .version('1.0.0', '-v, --vers', 'output the current version')
  .description('CLI for managing test processes');

const parentCommand = program.command('qgjob')
  .description('A parent command');

  // Command for submitting tests
  //qgjob submit --org-id=qualgent --app-version-id=xyz123 --test=tests/onboarding.spec.js
parentCommand.command('submit')
  .description('Adds a job to the queue of tests')
  .addOption(new Option('--org-id <organization ID>', 'Organization ID').choices(['qualgent']))
  .addOption(new Option('--app-version-id <Application version ID>', 'Optional Application version ID').choices(['xyz123']))
  .option('--test <dir>', 'Input directory for generated files')
      .action((options) => {
        const inputPath = options.test;
        if (inputPath) {
          const absoluteInputPath = path.resolve(inputPath);
          console.log(`Resolved input path: ${absoluteInputPath}`);
          // Further operations using absoluteInputPath
        } else {
          console.log('No input path specified.');
        }
      });

// Command for queuing tests
// qgjob status --job-id=abc456
parentCommand.command('status')
  .description('Check the status of a test or job ID in the queue')
  .option('--job-id <JobID>', 'Job ID')
  .action((options) => {
    console.log(`Queuing test with the selected Job ID`);
    // Here you would implement logic to add the test to a queueing system
  });

// Command for queuing tests
parentCommand.command('queue <testName>')
  .description('Adds a test to the queue')
  .option('-p, --priority <level>', 'Set test priority (high, medium, low)', 'medium')
  .action((testName, options) => {
    console.log(`Queuing test "${testName}" with priority: ${options.priority}`);
    // Here you would implement logic to add the test to a queueing system
  });

// Command for grouping tests
parentCommand.command('group <groupName>')
  .description('Manages a group of tests')
  .command('add <testName>')
  .description('Adds a test to a group')
  .action((groupName, testName) => {
    console.log(`Adding test to group "${groupName}"`);
    // Logic to add a test to a specific group
  });

// Command for deploying tests
parentCommand.command('deploy <testGroup>')
  .description('Deploys tests from a specified group')
  .option('-e, --environment <env>', 'Specify deployment environment (staging, production)', 'staging')
  .action((testGroup, options) => {
    console.log(`Deploying tests from group "${testGroup}" to environment: ${options.environment}`);
    // Logic to initiate the deployment of tests
  });

program.parse(process.argv);
