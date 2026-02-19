# Prompt Architect

![Build](https://github.com/canstralian/prompt-architect/actions/workflows/ci.yml/badge.svg) [![Code Coverage](https://codecov.io/gh/canstralian/prompt-architect/branch/main/graph/badge.svg)](https://codecov.io/gh/canstralian/prompt-architect) ![License](https://img.shields.io/github/license/canstralian/prompt-architect) [![Version](https://img.shields.io/github/v/release/canstralian/prompt-architect)](https://github.com/canstralian/prompt-architect/releases) [![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/canstralian/prompt-architect)](https://snyk.io) [![Dependencies](https://img.shields.io/librariesio/release/npm/prompt-architect)](https://libraries.io/npm/prompt-architect) [![TypeScript](https://img.shields.io/badge/language-TypeScript-blue)](https://www.typescriptlang.org/)

---

Prompt Architect is a tool designed to streamline prompt engineering workflows by providing a robust framework for designing, testing, and validating AI prompts across various systems. This tool leverages modern web technologies to deliver an intuitive interface and scalable architecture.

## Table of Contents

- [Features](#features)
- [System Overview](#system-overview)
- [Installation](#installation)
- [Usage](#usage)
- [Getting Started](#getting-started)
- [Contribution Guidelines](#contribution-guidelines)
- [Roadmap](#roadmap)
- [Acknowledgments](#acknowledgments)

---

## Features

- **Prompt Specification & Validation**: Define and validate prompts using structured schemas.
- **Registry for Prompt Management**: Organize prompts in a logical and reusable directory structure.
- **Golden Test Harness**: Maintain reliable performance through prompt regression tests.
- **Evaluation with Scorers**: Integrate scoring mechanisms to measure prompt effectiveness.
- **Built-in Security Features**: Safeguard against prompt injection and validate outputs.

---

## System Overview

This repository is built with the following technologies:

- **Frontend**: React with Vite, Shadcn-UI, and Tailwind CSS for a fast and modern user interface.
- **TypeScript**: Ensures a strongly typed, maintainable codebase.
- **Tooling**: Includes both CLI-level utilities and CI/CD integrations.

---

## Installation

To get started, clone the repository and install dependencies:

```bash
# Clone the repository
git clone <REPO_URL>
cd prompt-architect

# Install dependencies
npm install

# Start the development server
npm run dev
```

Ensure you have [Node.js](https://nodejs.org/) installed (preferred installation method: [nvm](https://github.com/nvm-sh/nvm)).

---

## Usage

### Local Development

- Run the app: `npm run dev`
- Build for production: `npm run build`

### Editing Prompts

Prompts are stored in the `/prompts` directory, organized by domain and name. Use the `prompt-edit` CLI tool for consistent formatting and validation.

---

## Getting Started

1. Clone this repository.
2. Follow the Installation steps.
3. Test the example prompts included in `/examples` to familiarize yourself with the tool.

### Example Prompt File

An example prompt configuration might look like this:

```json
{
  "name": "example-prompt",
  "schema": {
    "input": "text",
    "output": "text"
  }
}
```

Use `prompt-edit` to validate.

---

## Contribution Guidelines

### Pull Requests

- Feature branches should be named using the format: `feature/<ticket_number>-description`
- Ensure proper testing coverage before submitting.
- Follow best practices for code consistency.

### Reporting Issues

- Use the GitHub issue tracker.
- Provide as much detail as possible, including steps to reproduce the issue.

---

## Roadmap

- **Version 1.1: Dynamic schema support**.
- **Future features:** Role-specific prompt encryption, team collaboration features.

---

## Acknowledgments

Special thanks to contributors and open-source maintainers.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.