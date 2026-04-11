# DevOps Capstone Project
## End-to-End DevOps Pipeline for a Node.js Web Application

## Project Description
This project implements a complete DevOps pipeline that automates building, testing, code quality analysis, containerization, deployment, and monitoring of a Node.js Express web application. The pipeline leverages industry-standard tools including Jenkins, Docker, SonarQube, AWS EC2, Prometheus, and Grafana.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Source Control** | Git + GitHub |
| **CI/CD** | Jenkins |
| **Application** | Node.js + Express |
| **Containerization** | Docker + Docker Hub |
| **Code Quality** | SonarQube |
| **Cloud** | AWS EC2 (3 instances) + S3 |
| **Monitoring** | Prometheus + Grafana + Node Exporter |
| **Automation** | Bash + Cron |

---

## Repository Structure

```text
devops-capstone-project/
├── app.js                   # Main Node.js Express application
├── test.js                  # Test file
├── package.json             # Node.js dependencies and scripts
├── Dockerfile               # Docker image definition
├── Jenkinsfile              # CI/CD pipeline definition
├── sonar-project.properties # SonarQube configuration
└── README.md                # Project documentation

---

## Setup Instructions — Run Locally

### Prerequisites
- Node.js v20.x
- Docker
- Git

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Paviakkaraju/devops-capstone-project.git
cd devops-capstone-project

# 2. Install dependencies
npm install

# 3. Run tests
npm test

# 4. Run locally
node app.js
# App available at http://localhost:3000

# 5. Build and run with Docker
docker build -t capstone-project .
docker run -d -p 3000:3000 --name nodejs-app capstone-project
# App available at http://localhost:3000
```

---

## CI/CD Flow
GitHub Push
↓
Jenkins Triggered (Webhook)
↓
Checkout Code → Install Dependencies → Run Tests
↓
SonarQube Analysis → Quality Gate Check
↓
Docker Build → Push to Docker Hub
↓
SSH Deploy to EC2 App Server
↓
Container Running on Port 3000

### Pipeline Stages

| Stage | Action |
|---|---|
| Checkout | Clones repo using GitHub token |
| Verify Node | Confirms Node.js v20.x and npm are available |
| Install | Runs npm install |
| Test | Runs npm test — aborts if tests fail |
| SonarQube | Static code analysis — Quality Gate must pass |
| Docker Build | Builds image tagged with build number + latest |
| Docker Push | Pushes to pavi006/capstone-project on Docker Hub |
| Deploy | SSHs into EC2 3 and runs new container |
| Cleanup | Removes old images from Jenkins server |

---

## Infrastructure

| EC2 | Instance Type | Services |
|---|---|---|
| EC2 1 | m7i-flex.large | Jenkins + Prometheus + Grafana |
| EC2 2 | m7i-flex.large | SonarQube |
| EC2 3 | t3.small | Node.js App + Node Exporter |

---

## Monitoring

- Prometheus scrapes EC2 3 metrics via Node Exporter every 15 seconds
- Grafana dashboard (ID: 1860) shows CPU, Memory, Disk, Network metrics
- Grafana: `http://<EC2-1-PUBLIC-IP>:3000`
- Prometheus: `http://<EC2-1-PUBLIC-IP>:9090`

---

## Backup & Log Cleanup

- Daily cron job at 2:00 AM runs `backup.sh` on EC2 3
- Collects Docker container logs, compresses and uploads to AWS S3
- Local logs older than 7 days are auto-deleted
- S3 bucket: `capstone-app-logs-backup` (ap-south-1)

---

## Links
- **Docker Hub:** https://hub.docker.com/r/pavi006/capstone-project
