#!/usr/bin/env bash
set -eo pipefail

# Deployment automation script for AWS ECS TaskSphere Application

# Defaults
BUILD_TAG=${BUILD_NUMBER:-latest}
AWS_REGION=${AWS_REGION:-us-east-1}
ECS_CLUSTER=${ECS_CLUSTER:-tasksphere-cluster}
ECS_SERVICE_BACKEND=${ECS_SERVICE_BACKEND:-tasksphere-backend}
ECS_SERVICE_FRONTEND=${ECS_SERVICE_FRONTEND:-tasksphere-frontend}

echo "=== Starting TaskSphere Deployment ==="
echo "Build Tag: ${BUILD_TAG}"
echo "Region:    ${AWS_REGION}"

# Step 1: Query AWS resources dynamically to prevent hardcoding
echo "Querying RDS database endpoint..."
RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier tasksphere-db \
    --query "DBInstances[0].Endpoint.Address" \
    --output text \
    --region "${AWS_REGION}")

echo "RDS Endpoint: ${RDS_ENDPOINT}"

echo "Querying ECR repository URLs..."
BACKEND_REPO=$(aws ecr describe-repositories \
    --repository-names tasksphere-backend \
    --query "repositories[0].repositoryUri" \
    --output text \
    --region "${AWS_REGION}")

FRONTEND_REPO=$(aws ecr describe-repositories \
    --repository-names tasksphere-frontend \
    --query "repositories[0].repositoryUri" \
    --output text \
    --region "${AWS_REGION}")

echo "Backend ECR Repo:  ${BACKEND_REPO}"
echo "Frontend ECR Repo: ${FRONTEND_REPO}"

# Step 2: Prepare temporary task definition files with dynamic values
echo "Preparing task definition configurations..."

# Create backend task definition active file
sed -e "s|BACKEND_IMAGE_PLACEHOLDER|${BACKEND_REPO}:${BUILD_TAG}|g" \
    -e "s|DB_HOST_PLACEHOLDER|${RDS_ENDPOINT}|g" \
    aws/task-backend.json > aws/task-backend-active.json

# Create frontend task definition active file
sed -e "s|FRONTEND_IMAGE_PLACEHOLDER|${FRONTEND_REPO}:${BUILD_TAG}|g" \
    aws/task-frontend.json > aws/task-frontend-active.json

# Step 3: Register and deploy task definitions

# Register and update backend
echo "Registering Backend Task Definition..."
NEW_BACKEND_DEF=$(aws ecs register-task-definition \
    --cli-input-json file://aws/task-backend-active.json \
    --region "${AWS_REGION}")
REVISION_BACKEND=$(echo "${NEW_BACKEND_DEF}" | grep -o '"revision": [0-9]*' | grep -o '[0-9]*')

echo "Updating Backend Service to revision ${REVISION_BACKEND}..."
aws ecs update-service \
    --cluster "${ECS_CLUSTER}" \
    --service "${ECS_SERVICE_BACKEND}" \
    --task-definition "tasksphere-backend:${REVISION_BACKEND}" \
    --force-new-deployment \
    --region "${AWS_REGION}" > /dev/null

# Register and update frontend
echo "Registering Frontend Task Definition..."
NEW_FRONTEND_DEF=$(aws ecs register-task-definition \
    --cli-input-json file://aws/task-frontend-active.json \
    --region "${AWS_REGION}")
REVISION_FRONTEND=$(echo "${NEW_FRONTEND_DEF}" | grep -o '"revision": [0-9]*' | grep -o '[0-9]*')

echo "Updating Frontend Service to revision ${REVISION_FRONTEND}..."
aws ecs update-service \
    --cluster "${ECS_CLUSTER}" \
    --service "${ECS_SERVICE_FRONTEND}" \
    --task-definition "tasksphere-frontend:${REVISION_FRONTEND}" \
    --force-new-deployment \
    --region "${AWS_REGION}" > /dev/null

echo "=== Deployment Triggered Successfully ==="
echo "ECS Backend is rolling out revision ${REVISION_BACKEND}"
echo "ECS Frontend is rolling out revision ${REVISION_FRONTEND}"

# Cleanup
rm -f aws/task-backend-active.json aws/task-frontend-active.json
