import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../core/logger.js';

export const deployCommand = new Command('deploy')
  .description('Generate deployment configurations')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'platform',
          message: 'Select deployment platform:',
          choices: [
            'Docker',
            'Kubernetes',
            'Heroku',
            'Vercel',
            'Netlify',
            'AWS Lambda',
          ],
        },
        {
          type: 'checkbox',
          name: 'features',
          message: 'Select features to include:',
          choices: [
            'Multi-stage build',
            'Health checks',
            'Environment variables',
            'Auto-scaling',
            'CI/CD integration',
          ],
        },
      ]);

      const projectPath = process.cwd();

      switch (answers.platform) {
        case 'Docker':
          await generateDockerConfig(projectPath, answers.features);
          break;
        case 'Kubernetes':
          await generateK8sConfig(projectPath, answers.features);
          break;
        case 'Vercel':
          await generateVercelConfig(projectPath);
          break;
        // Add more platforms...
      }

      console.log(chalk.green(`\n✅ ${answers.platform} configuration generated!`));

    } catch (error) {
      logger.error('Failed to generate deployment config:', error);
      process.exit(1);
    }
  });

async function generateDockerConfig(projectPath: string, features: string[]) {
  const dockerfileContent = `# ${features.includes('Multi-stage build') ? 'Multi-stage build' : 'Single stage'}
${features.includes('Multi-stage build') ? `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules` : 'FROM node:18-alpine\nWORKDIR /app'}

COPY package*.json ./
${!features.includes('Multi-stage build') ? 'RUN npm ci --only=production' : ''}
COPY . .

${features.includes('Health checks') ? `
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node healthcheck.js` : ''}

EXPOSE 3000
${features.includes('Environment variables') ? 'ENV NODE_ENV=production' : ''}

CMD ["node", "dist/index.js"]
`;

  const dockerignoreContent = `node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.eslintrc.json
.prettierrc
coverage
.nyc_output
.vscode
.idea
`;

  await fs.writeFile(path.join(projectPath, 'Dockerfile'), dockerfileContent);
  await fs.writeFile(path.join(projectPath, '.dockerignore'), dockerignoreContent);

  if (features.includes('Health checks')) {
    const healthcheckContent = `const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  timeout: 2000,
};

const req = http.get(options, (res) => {
  console.log(\`STATUS: \${res.statusCode}\`);
  if (res.statusCode == 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error(err);
  process.exit(1);
});

req.end();
`;
    await fs.writeFile(path.join(projectPath, 'healthcheck.js'), healthcheckContent);
  }
}

async function generateK8sConfig(projectPath: string, features: string[]) {
  const deploymentYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{projectName}}-deployment
  labels:
    app: {{projectName}}
spec:
  replicas: ${features.includes('Auto-scaling') ? '2' : '1'}
  selector:
    matchLabels:
      app: {{projectName}}
  template:
    metadata:
      labels:
        app: {{projectName}}
    spec:
      containers:
      - name: {{projectName}}
        image: {{projectName}}:latest
        ports:
        - containerPort: 3000
${features.includes('Health checks') ? `        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5` : ''}
${features.includes('Environment variables') ? `        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: {{projectName}}-secrets
              key: db-host` : ''}
---
apiVersion: v1
kind: Service
metadata:
  name: {{projectName}}-service
spec:
  selector:
    app: {{projectName}}
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
`;

  await fs.ensureDir(path.join(projectPath, 'k8s'));
  await fs.writeFile(path.join(projectPath, 'k8s', 'deployment.yaml'), deploymentYaml);

  if (features.includes('Auto-scaling')) {
    const hpaYaml = `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{projectName}}-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{projectName}}-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
`;
    await fs.writeFile(path.join(projectPath, 'k8s', 'hpa.yaml'), hpaYaml);
  }
}

async function generateVercelConfig(projectPath: string) {
  const vercelConfig = {
    version: 2,
    builds: [
      {
        src: "dist/index.js",
        use: "@vercel/node"
      }
    ],
    routes: [
      {
        src: "/(.*)",
        dest: "dist/index.js"
      }
    ],
    env: {
      NODE_ENV: "production"
    }
  };

  await fs.writeJson(
    path.join(projectPath, 'vercel.json'),
    vercelConfig,
    { spaces: 2 }
  );
}
