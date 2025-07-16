// server.js
// This file sets up an Express server to handle job submissions and status checks
// It uses IORedis to interact with a Redis instance for job management
// The server listens for incoming requests on a specified port and provides endpoints for adding jobs and checking job status
// The server is designed to work with the job processing logic defined in worker.js
// It allows users to submit jobs via HTTP requests and retrieve job status
// The server can be extended with additional endpoints as needed for more functionality
// It is a simple REST API that can be used to interact with the job processing system
// The server is built using Express, a popular web framework for Node.js
// It provides a clean and easy-to-use interface for managing jobs in the application
// The server can be run independently or as part of a larger application
// It is designed to be lightweight and efficient, handling job submissions and status checks with minimal overhead.
// The server can be easily integrated with other parts of the application, such as a frontend or other services
// The server is a key component of the job processing system, allowing users to interact with the job queue and monitor job progress
// It provides a simple way to submit jobs and check their status
// The server can be extended with additional features, such as authentication, logging, or monitoring
// The server is a crucial part of the application architecture, enabling job management and processing through a RESTful API
// The server can be deployed in various environments, such as local development, staging, or production
// It can be run as a standalone service or as part of a larger application
// The server is designed to be robust and reliable, handling job submissions and status checks efficiently
// The server can be easily tested and debugged, making it a valuable tool for developers working on the application
// The server is a fundamental part of the job processing system, providing a user-friendly interface for managing jobs
// It allows users to submit jobs and check their status through simple HTTP requests
// The server is built with scalability in mind, allowing it to handle a large number of job submissions and status checks
// It can be easily extended with additional features or integrated with other services
// This user strict mode ensures that the code is executed in a strict manner, preventing common mistakes and improving code quality
'use strict';
// Import necessary modules
const express = require('express'); // Web framework for Node.js
const Redis = require('ioredis'); // Redis client for Node.js
const { v4: uuidv4 } = require('uuid'); // To generate unique job IDs   
const path = require('path'); // To handle file paths
const app = express(); // Create an Express application instance
// Create a new Redis client instance
// This connects to the Redis server running on localhost:6379 by default
// The Redis client is used to store and retrieve job data, manage job queues, and handle job statuses
// The Redis client provides a simple and efficient way to interact with the Redis database
// It allows the application to perform operations like adding jobs, checking job statuses, and managing job queues
// The Redis client is essential for the job processing system, enabling it to store job data
// and manage job states effectively.
const redis = new Redis(); // Connects to Redis on localhost:6379 by default
app.use(express.json()); // Enable JSON body parsing for requests
const PORT = process.env.PORT || 3000; // Set the port for the server to listen on, defaulting to 3000 if not specified
// This endpoint is used to add jobs to the queue
// It accepts job data in the request body and stores it in Redis
// The job data includes org_id, app_version_id, test_path, priority and target
// The job is stored in a Redis Hash and added to a prioritized queue
// The job ID is generated using uuidv4 to ensure uniqueness
// The job is then queued for processing by workers
// The endpoint responds with a success message and the job ID
// Job queuing endpoint
app.post('/jobs', async (req, res) => {
    // Extract job data from the request body
    const { org_id, app_version_id, test_path, priority, target } = req.body;

    if (!org_id || !app_version_id || !test_path) {
        return res.status(400).send('Missing required fields: org_id, app_version_id, test_path');
    }

    // 1. Create a Map object
    const priorityMap = new Map();

    // 2. Populate the Map with string keys and number values
    priorityMap.set('high', 0);
    priorityMap.set('medium', 1);
    priorityMap.set('normal', 2);
    priorityMap.set('low', 3);

    // 3. Get the priority value from the Map, defaulting to 'normal' if not found
    const priorityValue = priorityMap.get(priority) !== undefined ? priorityMap.get(priority) : priorityMap.get('normal');
    // 4. Validate the target
    const validTargets = ['emulator', 'device', 'web', 'browserstack'];
    if (!validTargets.includes(target)) {
        return res.status(400).send(`Invalid target. Valid targets are: ${validTargets.join(', ')}`);
    }
    // 5. Generate a unique job ID
    const jobId = uuidv4();
    // 6. Create the job object with the provided data
    // The job object includes the organization ID, application version ID, test path, priority,
    // target, status, and creation timestamp
    // The job object is stored in Redis as a Hash, allowing for easy retrieval and management
    // The job ID is used as the key for the Redis Hash, ensuring uniqueness and easy access
    // The job is stored in a prioritized queue and grouped by application version ID for efficient
    // processing by workers.
    const job = {
        id: jobId,
        org_id,
        app_version_id,
        test_path: path.resolve(test_path), // Resolve the test path to an absolute path
        priority: priorityValue, // Default priority to 0
        target: target,
        status: 'queued',
        createdAt: new Date().toISOString()
    };

    // Store job details in Redis Hash
    // The job details are stored in a Redis Hash with the key 'job:<jobId>'    
    await redis.hmset(`job:${jobId}`, job);

    // Group jobs by app_version_id (using a Redis List)
    // The job ID is added to a Redis List for the specific application version ID
    await redis.rpush(`jobs:queue:${app_version_id}`, jobId); 

    // Add job to a prioritized queue (using a Redis Sorted Set)
    // The job is added to a Redis Sorted Set with the key 'jobs:priority'
    // The priority value is used as the score, allowing jobs to be processed in order of priority
    // Jobs with lower priority values are processed first, ensuring that high-priority jobs are handled before lower-priority ones
    // This allows for efficient job management and processing based on priority
    // The job ID is added to the sorted set with the priority value as the score.
    await redis.zadd('jobs:priority', job.priority, jobId); 

    // Respond with success message and job ID
    // The response includes a message indicating that the job has been queued successfully
    // The job ID is included in the response for reference, allowing the client to track the job status
    // The response is sent with a 202 Accepted status code, indicating that the request has been accepted for processing
    // This allows the client to know that the job has been successfully queued
    // The response is sent in JSON format, making it easy to parse and handle.
    console.log(`Job ${jobId} queued for app_version_id ${app_version_id}`);
    res.status(202).send({ message: 'Job queued successfully', jobId });
});


// This endpoint is used to check the status of a job by its ID
// It retrieves the job details from Redis and returns the status and other information
// The job ID is provided as a URL parameter
// If the job exists, it returns the job details; otherwise, it returns a 404 error
// The job status can be 'queued', 'processing', or 'completed'
// This allows users to monitor the progress of their jobs and check if they have been completed
// The endpoint responds with the job details in JSON format
// This endpoint is useful for clients to track the status of their submitted jobs
// It provides a simple way to check if a job is still in the queue, currently being processed, or has been completed.
app.get('/jobs/:jobId/status', async (req, res) => {
    // Extract job ID from the request parameters
    const { jobId } = req.params;
    // Retrieve job details from Redis
    const job = await redis.hgetall(`job:${jobId}`);
    // Check if the job exists
    // If the job does not exist, return a 404 error.
    if (Object.keys(job).length === 0) { // Check if job exists
        return res.status(404).send('Job not found');
    }
    // Respond with job details
    // The response includes the job ID, organization ID, application version ID, test path,
    // priority, target, status, and creation timestamp.
    res.status(200).send(job);
});


// Start the Express server
// The server listens on the specified port and logs a message when it is ready.
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

