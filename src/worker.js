// worker.js
// This file defines the worker logic for processing jobs in the job queue
// It connects to a Redis instance to manage job states and queues
// The worker picks up jobs from the queue, processes them based on their target,
// and updates their status in Redis
// The worker is designed to handle different targets like emulator, device, web, and browserstack
// It uses the IORedis library for Redis operations and the child_process module to execute commands
//'use strict';
const Redis = require('ioredis');
const redis = new Redis();
const { exec } = require('child_process');

const WORKER_ID = process.env.WORKER_ID || 'worker-1'; // Unique ID for each worker
let isAvailable = true; // Simulates worker availability
let currentJob = null; 

async function registerWorker() {
    // Register worker and its capabilities (e.g., supported device targets)
    await redis.sadd('availableWorkers', WORKER_ID); // Add to a Set of available workers
    await redis.hmset(`worker:${WORKER_ID}`, 'status', 'idle', 'deviceTargets', 'emulator'); // Example capabilities
    console.log(`Worker ${WORKER_ID} registered and idle`);
}

async function findAndProcessJob() {
    if (!isAvailable || currentJob) {
        return; 
    }

    isAvailable = false; 

    // 1. Get available device targets for this worker
    const workerDetails = await redis.hgetall(`worker:${WORKER_ID}`);
    const supportedTargets = workerDetails.deviceTargets.split(','); 

    // 2. Fetch jobs from priority queue (sorted set)
    const jobIds = await redis.zrange('jobs:priority', 0, -1); // Get all job IDs in order of priority

    for (const jobId of jobIds) {
        const job = await redis.hgetall(`job:${jobId}`);

        // Check if job matches supported device targets
        if (supportedTargets.includes(job.target) && job.status === 'queued') {
            // Atomically acquire job lock and update status
            const result = await redis.multi()
                .hset(`job:${jobId}`, 'status', 'processing', 'assignedTo', WORKER_ID)
                .lrem(`jobs:queue:${job.app_version_id}`, 0, jobId) // Remove from app_version_id specific queue
                .zrem('jobs:priority', jobId) // Remove from priority queue
                .exec();

            if (result[0][1] === 1) { // If job status was successfully updated
                currentJob = job;
                console.log(`Worker ${WORKER_ID} picked up job ${jobId}`);
                console.log(`Worker ${WORKER_ID} is processing job ${jobId} for target ${job.target}`);

                if (job.target === 'emulator')  {
                    console.log(`Worker ${WORKER_ID} found job ${jobId} for target ${job.target}`);
                    //command = `adb -s emulator-5554 shell am start -n com.example.app/.MainActivity`; // Example command for emulator
                    command = 'npx appwright test --project android'
                } else if (job.target === 'device') {
                    console.log(`Worker ${WORKER_ID} found job ${jobId} for target ${job.target}`);
                    command = 'npx appwright test --project android-pixel-4'
                } else if (job.target === 'web') {
                    console.log(`Worker ${WORKER_ID} found job ${jobId} for target ${job.target}`);
                    command = 'npx appwright test --project web'
                } else if (job.target === 'browserstack') {
                    console.log(`Worker ${WORKER_ID} found job ${jobId} for target ${job.target}`);
                    command = 'npx appwright test --project browserstack'
                } 
                else {
                   console.error(`Worker ${WORKER_ID} found job ${jobId} with unsupported target ${job.target}`);
                   continue; // Skip unsupported targets
                }
                // Simulate job processing
                setTimeout(async () => {
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error executing command for job ${jobId}:`, error);
                        } else {
                            console.log(`Command output for job ${jobId}:`, stdout);
                        }
                    });
                    await redis.hset(`job:${jobId}`, 'status', 'completed', 'endTime', new Date().toISOString());
                    console.log(`Job ${jobId} completed by ${WORKER_ID}`);
                    currentJob = null;
                    isAvailable = true;
                }, 50); 
                //
                //return; 
            }
        }
    }

    isAvailable = true;
    console.log(`Worker ${WORKER_ID} could not find a suitable job. Trying again in 5 seconds.`);
    setTimeout(findAndProcessJob, 5000); 
}

registerWorker();
findAndProcessJob();

