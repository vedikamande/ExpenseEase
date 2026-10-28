#!/bin/bash
# -------------------------------------------------------------
# ExpenseEase — Automated AWS EC2 Deployment Script
# -------------------------------------------------------------
set -e

echo "=== Updating System Packages ==="
sudo apt-get update -y
sudo apt-get upgrade -y

echo "=== Installing Docker & Docker Compose ==="
sudo apt-get install -y docker.io docker-compose git

# Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Add current user to docker group
sudo usermod -aG docker $USER

echo "=== Pulling Latest ExpenseEase Code ==="
# Note: Replace REPO_URL with your actual repository URL
# git clone <REPO_URL> ExpenseEase
# cd ExpenseEase

echo "=== Building & Launching Docker Services ==="
docker-compose down || true
docker-compose up -d --build

echo "=== Deployment Status ==="
docker-compose ps

echo "ExpenseEase is live! Access your app at: http://$(curl -s ifconfig.me)"

