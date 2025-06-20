import fs from 'fs-extra';
import path from 'path';

export default {
  hooks: {
    afterCreate: async (projectPath, config) => {
      console.log('🤖 Generating AI-powered documentation...');
      
      // Create enhanced README with AI suggestions
      const readmePath = path.join(projectPath, 'README.md');
      const readme = await fs.readFile(readmePath, 'utf-8');
      
      // Add AI-generated sections
      const enhancedReadme = readme + `

## 🚀 Quick Tips (AI Generated)

Based on your project setup, here are some recommendations:

1. **Performance**: Consider implementing caching strategies for frequently accessed data
2. **Security**: Add rate limiting to protect your API endpoints
3. **Monitoring**: Set up logging and error tracking with services like Sentry
4. **Testing**: Aim for >80% code coverage with your test suite

## 📚 Suggested Learning Resources

- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
`;

      await fs.writeFile(readmePath, enhancedReadme);
      
      // Generate API documentation template
      if (config.template === 'express-api') {
        const apiDocPath = path.join(projectPath, 'API.md');
        const apiDoc = `# API Documentation

## Endpoints

### GET /health
Health check endpoint

**Response:**
\`\`\`json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 12345
}
\`\`\`

### GET /api/users
Get all users

**Response:**
\`\`\`json
{
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}
\`\`\`

### POST /api/users
Create a new user

**Request Body:**
\`\`\`json
{
  "name": "string",
  "email": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": 123456789,
  "name": "string",
  "email": "string"
}
\`\`\`
`;

        await fs.writeFile(apiDocPath, apiDoc);
      }
      
      console.log('✅ AI documentation generated successfully!');
    }
  }
};
