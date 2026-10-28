# ☁️ ExpenseEase — AWS Deployment Guide

This document outlines the deployment strategy for **ExpenseEase** on **Amazon Web Services (AWS)** using containerized architecture.

---

## Architecture Overview

```
                      +-----------------------------------+
                      |             User Browser          |
                      +-----------------+-----------------+
                                        | (Port 80)
                                        v
                      +-----------------+-----------------+
                      |     Nginx (Frontend Container)     |
                      |   Serves static React Vite bundle |
                      +-----------------+-----------------+
                                        | (Proxy /api/)
                                        v
                      +-----------------+-----------------+
                      |    Flask (Backend Container)      |
                      |     Gunicorn WSGI Server:5000     |
                      +-----------------+-----------------+
                                        |
                                        v
                      +-----------------+-----------------+
                      |       SQLite Database File        |
                      |     (Persisted in Docker Volume)  |
                      +-----------------------------------+
```

---

## Option 1: Fast & Cost-Effective — AWS EC2 (Single VM with Docker)

### 1. Launch EC2 Instance
* **AMI**: Ubuntu Server 22.04 LTS (HVM)
* **Instance Type**: `t2.micro` or `t3.micro` (AWS Free Tier eligible)
* **Security Group Rules**:
  * Inbound: HTTP (Port 80) from `0.0.0.0/0`
  * Inbound: Custom TCP (Port 5000 - optional if using reverse proxy)
  * Inbound: SSH (Port 22) from your IP

### 2. Connect via SSH & Deploy
```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>

# Clone your repository
git clone https://github.com/<your-username>/ExpenseEase.git
cd ExpenseEase

# Run automated deployment script
chmod +x aws/ec2-deploy.sh
./aws/ec2-deploy.sh
```

### 3. Verification
Visit `http://<EC2-PUBLIC-IP>` in your browser.

---

## Option 2: Production Scale — AWS ECS (Elastic Container Service) with Fargate

1. **Push Container Images to Amazon ECR**:
   ```bash
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account_id>.dkr.ecr.<region>.amazonaws.com

   # Build & push backend
   docker build -t expenseease-backend ./backend
   docker tag expenseease-backend:latest <account_id>.dkr.ecr.<region>.amazonaws.com/expenseease-backend:latest
   docker push <account_id>.dkr.ecr.<region>.amazonaws.com/expenseease-backend:latest

   # Build & push frontend
   docker build -t expenseease-frontend ./frontend
   docker tag expenseease-frontend:latest <account_id>.dkr.ecr.<region>.amazonaws.com/expenseease-frontend:latest
   docker push <account_id>.dkr.ecr.<region>.amazonaws.com/expenseease-frontend:latest
   ```

2. **Register Task Definition**:
   Update placeholders in `aws/task-definition.json` with your Account ID, Region, and Amazon EFS ID for persistent SQLite storage.
   ```bash
   aws ecs register-task-definition --cli-input-json file://aws/task-definition.json
   ```

3. **Create ECS Service & Application Load Balancer (ALB)**:
   Point the ALB target group on port 80 to your frontend container.

---

## Option 3: AWS App Runner (Fully Managed Container Platform)

1. Connect your GitHub repository to AWS App Runner.
2. Select **Container Registry** or **Source code repository**.
3. Point to `backend/Dockerfile` for the API service and connect a managed static website (or AWS S3 + CloudFront) for the React frontend.

