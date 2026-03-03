# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| latest  | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

Do not open a public GitHub Issue for security vulnerabilities.

### How to Report

1. Use GitHub's private vulnerability reporting feature
2. 2. Include a clear description of the vulnerability
   3. 3. Provide steps to reproduce the issue
      4. 4. Describe the potential impact
         5. 5. Suggest a fix or mitigation if possible
           
            6. ### Response Timeline
           
            7. - Acknowledgement within 48 hours
               - - Fix or workaround within 7 days for critical issues
                 - - Regular updates on progress
                  
                   - ## Security Best Practices
                  
                   - - Never commit `.env` files or secrets to the repository
                     - - Use environment variables for all sensitive configuration
                       - - Dependencies are monitored automatically via Dependabot
                         - - CodeQL analysis runs on all pull requests
