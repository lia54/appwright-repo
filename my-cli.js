#!/usr/bin/env node
// my-cli.js
// This file implements a command-line interface (CLI) for managing jobs in an application.
// It allows users to submit jobs with various options and check the status of jobs in the queue.
// The CLI uses the Commander library to define commands and options.
// The program is structured to provide a user-friendly interface for interacting with the job management system.
// It includes commands for submitting jobs and checking job status.
// The CLI is designed to be run from the command line, and it provides functionality for adding jobs to a queue,
// processing those jobs, and handling job events such as completion and errors.
const { Command, Option } = require('commander');
const program = new Command();
const path = require('path');
//const fs = require("fs")

// This function adds a job to the queue with the specified parameters.
// It takes the organization ID, application version ID, test path, priority, and target as arguments.
// The function can be implemented to send a request to a server endpoint that handles job submission.
// The job data is constructed from the provided parameters, and it can be extended to include additional data as needed.
// The function can be used to submit jobs from the command line, allowing users to easily add jobs to the queue for processing.
// The job submission process can be customized based on the application's requirements.
// The function can also handle errors and provide feedback to the user about the job submission status.
// This function can be called from the CLI command to submit jobs with the specified parameters.
const addJob = async (org_id, app_version_id, test_path, priority, target) => {
    // This function can be implemented to add a job to the queue
    // For example, you can use fetch to send a POST request to your server
    // Example:
    // const fetch = require('node-fetch'); // Ensure you have node-fetch installed
    // if (!org_id || !app_version_id || !test_path) {
    //     console.error('Organization ID, Application version ID, and Test path are required to add a job.');
    //     return;
    // }
    // // Construct the job data
    // const test_path_resolved = path.resolve(test_path); // Resolve the test path to an absolute path
    // if (!fs.existsSync(test_path_resolved)) {
    //     console.error(`Test path does not exist: ${test_path_resolved}`);
    //     return;
    // }       
    // const test_path = test_path_resolved; // Use the resolved path  

    // Construct the job data
    // You can modify this object to include any additional data you need for the job
    // For example, you can include the organization ID, application version ID, test path,
    // priority, and target platform
    // Here we assume you have a server endpoint that accepts job data at 'http://localhost:3000/jobs'
    // You can replace this with your actual server endpoint URL
    // const serverUrl = 'http://localhost:3000'; // Replace with your server URL
    // This checks if the required parameters are provided
    // If any of the required parameters are missing, it logs an error message and returns
    // This is a simple check to ensure that the required parameters are provided.
    if (!org_id || !app_version_id || !test_path) {
        console.error('Organization ID, Application version ID, and Test path are required to add a job.');
        return;
    }
    // Construct the job data
    // You can modify this object to include any additional data you need for the job.
    const jobData = {
        org_id: org_id,
        app_version_id: app_version_id,
        test_path: test_path,
        priority: priority || 'normal', // Default to 'normal' if not provided
        target: target || 'emulator' // Default to 'emulator' if not provided 
    };
    // This is a simple example of how to send a POST request to add a job
    // You can use the fetch API or any HTTP client library to send the request
    // Here we use fetch to send a POST request to the server endpoint.
    // A try-catch block is used to handle any errors that may occur during the request.
    // The jobData object is stringified and sent in the request body.
    // The Content-Type header is set to application/json to indicate that the request body contains JSON data.
    // If the request is successful, it logs the job ID and a success message.
    // If the request fails, it logs an error message.
    // Catch block is used to handle any errors that may occur during the request.
    try {
        const response = await fetch('http://localhost:3000/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });
        
        if (!response.ok) {
            // If the response is not OK, throw an error
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Job added successfully:', result);
    } 
    catch (error) {
        console.log('Job data forming the request:', jobData);
        console.error('Error adding job:', error);
    }
    };

// This function checks the status of a job by its ID.
// It sends a GET request to the server endpoint that provides job status information.
// The job ID is passed as a parameter to the function.
// The function can be used to retrieve the status of a job from the command line, allowing users to easily check the status of jobs in the queue.
// The function uses the fetch API to send a request to the server.
// It handles the response and logs the job status to the console.
// If the request fails, it logs an error message.
// The function can be extended to include additional logic for handling job statuses, such as retrying failed jobs or notifying users of job completion.
// This function can be called from the CLI command to check the status of a job by its ID.
// Additionally to the job Data, the function logs the job status to the console.
async function checkJobStatus(jobId) {
    try {
        const response = await fetch(`http://localhost:3000/jobs/${jobId}/status`);

        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jobStatus = await response.json();
        console.log('Job Data:', jobStatus);
        console.log('Job Status:', jobStatus.status);
        return jobStatus;
    } catch (error) {
        console.error('Error checking job status:', error);
        return null;
    }
}

// Define the CLI program with a version and description
// This program is a simple command-line interface (CLI) for managing jobs in an application.
// It allows users to submit jobs with various options and check the status of jobs in the queue
// The CLI uses the Commander library to define commands and options.
// The program is structured to provide a user-friendly interface for interacting with the job management system.
program
    .version('1.0.0')
    .description('A simple custom CLI with three options');
// Define the 'submit' command with required options
// This command allows users to submit jobs with the specified organization ID, application version ID, test path, priority, and target.
// The command uses the Commander library to define the options and their descriptions
// The required options are org-id, app-version-id, and test, which are necessary for submitting a job.
// The priority and target options are optional, with default values set to 'normal'
// The command action is defined to handle the job submission logic
program
    .command('submit')
    .description('Command to demonstrate the submission options')
    .requiredOption('--org-id <value>', 'Set the Organization ID' + ' (e.g., qualgent)')
    .requiredOption('--app-version-id <value>', 'Set the Application version ID' + ' (e.g., xyz123)')
    .requiredOption('--test <value>', 'Input directory for generated jobs and testing AppWright run the tests in Android and iOS simulators') //'default: ./tests/onboarding.spec.js')
    .option('-p, --priority <level>', 'Set test priority (high, medium, normal, low)', 'normal')
    .option('-t, --target <target>', 'Set target platform (emulator, simulator, device, browserstack)', 'emulator')
    .action((options) => {
        console.log(`Submitting job with Organization ID: ${options.orgId}`);
        console.log(`Application version ID: ${options.appVersionId}`);
        console.log(`Input directory for generated files: ${options.test}`);
        const inputPath = options.test;
        if (inputPath) {
            const absoluteInputPath = path.resolve(inputPath);
            console.log(`Resolved input path: ${absoluteInputPath}`);
            // Further operations using absoluteInputPath
            // For example, you can check if the path exists or is a directory
            if (!path.isAbsolute(absoluteInputPath)) {
                console.error('Input path must be an absolute path.');
                return;
            }
            // This is a placeholder for the actual implementation
            // You can replace this with your actual file processing logic
            // Simulate processing files
            // console.log(`Files processed successfully in directory: ${absoluteInputPath}`);
            // console.log(`All files in the Input directory were processed for generated tests: ${absoluteInputPath}`)

            // Example usage:   
            // addJob("qualgent", "xyz123", "tests/onboarding.spec.js", "high", "emulator");
            // addJob("process image", "image.jpg");
            addJob(options.orgId, options.appVersionId, options.test, options.priority, options.target);
            
            console.log(`Job submitted with Organization ID: ${options.orgId} and Application version ID: ${options.appVersionId}`);

        } else {
            console.log('No input path specified.');
        }
    });
// Define the 'status' command to check the status of a job by its ID
// This command allows users to check the status of a job by providing the job ID.
// The command uses the Commander library to define the required option for job ID.
// The job ID is required to check the status of a job in the queue.
// The command action is defined to handle the job status checking logic.
program
    .command('status')
    .description('Check the status of a test or job ID in the queue')
    .requiredOption('--job-id <value>', 'Set the Job ID to know status' + ' (e.g. abc456)')
    .action((options) => {
        console.log(`Checking status for Job ID: ${options.jobId}`);
        // Here you would implement logic to check the status of the job ID
        // For example, querying a database or an API
        // This is a placeholder for the actual implementation
        if (!options.jobId) {
            console.error('Job ID is required to check status.');
            return;
        }
        checkJobStatus(options.jobId)
        // Simulate checking status
        // console.log(`Status for Job ID ${options.jobId}: In Progress`);
        // Simulate queuing test
        // console.log(`Queuing test with the selected Job ID: ${options.jobId}`);
        // Here you would implement logic to add the test to a queueing system
    });

program.parse(process.argv);
// If no command is provided, display the help information
// This allows users to see the available commands and options when they run the CLI without any arguments
