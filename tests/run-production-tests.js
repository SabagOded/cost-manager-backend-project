const { spawnSync } = require('node:child_process');

const productionEnv = {
    ...process.env,
    USERS_SERVICE_URL: 'https://cost-manager-users-service-o9k4.onrender.com',
    COSTS_SERVICE_URL: 'https://cost-manager-costs-service-8lts.onrender.com',
    LOGS_SERVICE_URL: 'https://cost-manager-logs-service-f65i.onrender.com',
    TEAM_SERVICE_URL: 'https://server-side-final-project-nwq0.onrender.com'
};

const result = spawnSync(process.execPath, ['--test'], {
    stdio: 'inherit',
    env: productionEnv,
});

process.exit(result.status ?? 1);