#!/usr/bin/env bash
set -eo pipefail

# Deployment automation script for AWS ECS TaskSphere Application
# Reads credentials and settings from central .env file

echo "=== Loading Configuration File ==="
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "Loaded configuration from .env in current directory."
elif [ -f ../.env ]; then
    export $(grep -v '^#' ../.env | xargs)
    echo "Loaded configuration from ../.env."
else
    echo "ERROR: Central .env configuration file not found!"
    exit 1
fi

# Defaults
BUILD_TAG=${BUILD_NUMBER:-latest}
AWS_REGION=${AWS_REGION:-us-east-1}
ECS_CLUSTER=${ECS_CLUSTER:-tasksphere-cluster}
ECS_SERVICE_BACKEND=${ECS_SERVICE_BACKEND:-tasksphere-backend}
ECS_SERVICE_FRONTEND=${ECS_SERVICE_FRONTEND:-tasksphere-frontend}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-123456789012}

echo "=== Starting TaskSphere Deployment ==="
echo "Build Tag:       ${BUILD_TAG}"
echo "Region:          ${AWS_REGION}"
echo "Account ID:      ${AWS_ACCOUNT_ID}"
echo "ECS Cluster:     ${ECS_CLUSTER}"
echo "RDS Endpoint:    ${AWS_RDS_ENDPOINT}"

# Formulate repository URLs
BACKEND_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/tasksphere-backend"
FRONTEND_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/tasksphere-frontend"

# Step 1: Prepare temporary task definition files with dynamic values from .env
echo "Preparing task definition configurations..."

# Create backend task definition active file
sed -e "s|BACKEND_IMAGE_PLACEHOLDER|${BACKEND_REPO}:${BUILD_TAG}|g" \
    -e "s|DB_HOST_PLACEHOLDER|${AWS_RDS_ENDPOINT}|g" \
    -e "s|DB_PORT_PLACEHOLDER|${AWS_RDS_PORT}|g" \
    -e "s|DB_NAME_PLACEHOLDER|${AWS_RDS_DB_NAME}|g" \
    -e "s|DB_USER_PLACEHOLDER|${AWS_RDS_USER}|g" \
    -e "s|DB_PASSWORD_PLACEHOLDER|${AWS_RDS_PASSWORD}|g" \
    -e "s|SECRET_KEY_PLACEHOLDER|${SECRET_KEY}|g" \
    -e "s|AWS_REGION_PLACEHOLDER|${AWS_REGION}|g" \
    aws/task-backend.json > aws/task-backend-active.json

# Create frontend task definition active file
sed -e "s|FRONTEND_IMAGE_PLACEHOLDER|${FRONTEND_REPO}:${BUILD_TAG}|g" \
    -e "s|AWS_REGION_PLACEHOLDER|${AWS_REGION}|g" \
    aws/task-frontend.json > aws/task-frontend-active.json

# Step 2: Register and deploy task definitions

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
