# 🚀 TaskSphere

## Enterprise Deployment & CI/CD Documentation

```{=html}
<p align="center">
```
![Status](https://img.shields.io/badge/Deployment-Success-brightgreen)
![AWS](https://img.shields.io/badge/AWS-EC2-orange)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![Jenkins](https://img.shields.io/badge/CI/CD-Jenkins-red)
![Django](https://img.shields.io/badge/Backend-Django-success)
![Nginx](https://img.shields.io/badge/WebServer-Nginx-green)

```{=html}
</p>
```

------------------------------------------------------------------------

# Executive Summary

TaskSphere is a containerized full-stack Task Management System deployed
on **AWS EC2** using **Docker**, **Docker Compose**, and an automated
**Jenkins CI/CD pipeline**.

The project demonstrates a production-style deployment workflow where
Jenkins retrieves the latest source code from GitHub, securely connects
to an EC2 instance using SSH, rebuilds Docker containers, executes
Django database migrations, and deploys the latest application version.

------------------------------------------------------------------------

# Overall System Architecture

```{=html}
<p align="center">
```
`<img src="docs/images/architecture-overview.png" width="900">`{=html}
`<br>`{=html} `<b>`{=html}Figure 1. Overall System
Architecture`</b>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

# GitHub Repository

```{=html}
<p align="center">
```
`<img src="docs/images/01-github-repository.png" width="900">`{=html}
`<br>`{=html} `<b>`{=html}Figure 2. GitHub Repository`</b>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

# Project Structure

``` text
TaskManagementSystem/
├── backend/
├── frontend/
├── docs/
│   └── images/
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```

```{=html}
<p align="center">
```
`<img src="docs/images/02-project-structure.png" width="850">`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

# Technology Stack

  Layer                Technology
  -------------------- -------------------------
  Frontend             HTML5, CSS3, JavaScript
  Backend              Django
  Application Server   Gunicorn
  Reverse Proxy        Nginx
  Database             SQLite
  Containerization     Docker
  Orchestration        Docker Compose
  CI/CD                Jenkins
  Version Control      GitHub
  Cloud                AWS EC2

------------------------------------------------------------------------

# Infrastructure

## AWS EC2

```{=html}
<p align="center">
```
`<img src="docs/images/04-ec2-instance-details.png" width="900">`{=html}
```{=html}
</p>
```
### Security Group

```{=html}
<p align="center">
```
`<img src="docs/images/05-security-group.png" width="900">`{=html}
```{=html}
</p>
```
### EC2 Environment

```{=html}
<p align="center">
```
`<img src="docs/images/06-ec2-terminal-system.png" width="900">`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

# Container Architecture

```{=html}
<p align="center">
```
`<img src="docs/images/container-architecture.png" width="900">`{=html}
```{=html}
</p>
```
## Docker Images

```{=html}
<p align="center">
```
`<img src="docs/images/07-docker-images.png" width="900">`{=html}`<br>`{=html}`<br>`{=html}
`<img src="docs/images/07-docker-image-backend.png" width="900">`{=html}`<br>`{=html}`<br>`{=html}
`<img src="docs/images/07-docker-image-frontend.png" width="900">`{=html}
```{=html}
</p>
```
## Docker Compose

```{=html}
<p align="center">
```
`<img src="docs/images/09-docker-compose-up.png" width="900">`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

# CI/CD Pipeline

```{=html}
<p align="center">
```
`<img src="docs/images/cicd-pipeline.png" width="900">`{=html}
```{=html}
</p>
```
## Deployment Flow

```{=html}
<p align="center">
```
`<img src="docs/images/deployment-flow.png" width="900">`{=html}
```{=html}
</p>
```
### Pipeline Stages

1.  Developer pushes code to GitHub.
2.  Jenkins checks out the latest source code.
3.  Jenkins connects to AWS EC2 using SSH.
4.  EC2 performs `git pull`.
5.  Docker Compose rebuilds containers.
6.  Django migrations are executed.
7.  Updated application becomes available.

------------------------------------------------------------------------

# Jenkins

## Dashboard

```{=html}
<p align="center">
```
`<img src="docs/images/13-jenkins-dashboard.png" width="900">`{=html}
```{=html}
</p>
```
## Job Configuration

```{=html}
<p align="center">
```
`<img src="docs/images/14-jenkins-job-config.png" width="900">`{=html}
```{=html}
</p>
```
## Stage View

```{=html}
<p align="center">
```
`<img src="docs/images/15-jenkins-stage-view.png" width="900">`{=html}
```{=html}
</p>
```
## Build History

```{=html}
<p align="center">
```
`<img src="docs/images/17-jenkins-build-history.png" width="900">`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

# Deployment Verification

## Latest Commit

```{=html}
<p align="center">
```
`<img src="docs/images/18-github-commit.png" width="900">`{=html}
```{=html}
</p>
```
## SSH Connection

```{=html}
<p align="center">
```
`<img src="docs/images/20-ssh-login.png" width="900">`{=html}
```{=html}
</p>
```
## Running Containers

```{=html}
<p align="center">
```
`<img src="docs/images/21-deployment-verification.png" width="900">`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

# Application

## Frontend

```{=html}
<p align="center">
```
`<img src="docs/images/10-frontend-homepage.png" width="900">`{=html}
```{=html}
</p>
```
## Backend API

```{=html}
<p align="center">
```
`<img src="docs/images/11-backend-api.png" width="900">`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

# Deployment Procedure

``` bash
git clone https://github.com/MaheshKumar1533/TaskManagementSystem.git
cd TaskManagementSystem

docker compose up --build -d

docker exec tasksphere_backend python manage.py migrate

docker ps
```

------------------------------------------------------------------------

# Testing Checklist

-   ✅ Frontend deployment verified
-   ✅ Backend deployment verified
-   ✅ Docker containers running
-   ✅ Docker networking validated
-   ✅ Django migrations executed
-   ✅ Jenkins deployment successful
-   ✅ SSH authentication configured
-   ✅ AWS EC2 deployment verified

------------------------------------------------------------------------

# Troubleshooting

  ---------------------------------------------------------------------------------------------
  Issue                             Resolution
  --------------------------------- -----------------------------------------------------------
  `no such table: tasks_task`       `docker exec tasksphere_backend python manage.py migrate`

  `Permission denied (publickey)`   Verify SSH keys and `authorized_keys`

  `SSH_AUTH_SOCK` error             Run Jenkins service under Windows user account instead of
                                    Local System
  ---------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# Future Enhancements

-   GitHub Webhooks
-   Amazon ECR
-   Amazon ECS
-   PostgreSQL / Amazon RDS
-   HTTPS with Nginx and SSL
-   Custom Domain
-   Prometheus & Grafana Monitoring
-   AWS CloudWatch Integration
-   Blue-Green Deployment
-   Automatic Rollback Strategy

------------------------------------------------------------------------

# Conclusion

TaskSphere demonstrates an end-to-end DevOps workflow integrating
GitHub, Jenkins, Docker, and AWS EC2. The deployment process is fully
containerized and repeatable, providing a strong foundation for modern
CI/CD practices and future production enhancements.

------------------------------------------------------------------------

# Author

**Harsha Vardhan**

B.Tech -- Computer Science & Engineering

DevOps • Cloud Computing • Full Stack Development
