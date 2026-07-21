pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID    = '123456789012' // Replace with your actual AWS Account ID
        AWS_REGION        = 'us-east-1'
        AWS_CREDENTIALS_ID= 'aws-credentials' // Jenkins AWS credentials ID
        
        ECR_BACKEND_REPO  = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/tasksphere-backend"
        ECR_FRONTEND_REPO = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/tasksphere-frontend"
        
        ECS_CLUSTER       = 'tasksphere-cluster'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Tests') {
            steps {
                echo 'Setting up Python environment and running Django tests...'
                sh '''
                    python3 -m venv venv
                    . venv/bin/activate
                    pip install -r backend/requirements.txt
                    cd backend
                    python manage.py test
                '''
            }
        }

        stage('Security Check') {
            steps {
                echo 'Running dependency security scans...'
                sh '''
                    . venv/bin/activate
                    pip install safety
                    safety check || true
                '''
            }
        }

        stage('Terraform Provision') {
            steps {
                echo 'Provisioning AWS infrastructure (VPC, RDS DB, ECS Cluster, Load Balancers)...'
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding', 
                    credentialsId: "${AWS_CREDENTIALS_ID}"
                ]]) {
                    sh '''
                        cd terraform
                        terraform init
                        terraform apply -auto-approve \
                            -var="aws_region=${AWS_REGION}"
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker Images...'
                sh '''
                    docker build -t $ECR_BACKEND_REPO:${BUILD_NUMBER} -t $ECR_BACKEND_REPO:latest ./backend
                    docker build -t $ECR_FRONTEND_REPO:${BUILD_NUMBER} -t $ECR_FRONTEND_REPO:latest ./frontend
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                echo 'Logging into Amazon ECR and pushing images...'
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding', 
                    credentialsId: "${AWS_CREDENTIALS_ID}"
                ]]) {
                    sh '''
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                        
                        docker push $ECR_BACKEND_REPO:${BUILD_NUMBER}
                        docker push $ECR_BACKEND_REPO:latest
                        
                        docker push $ECR_FRONTEND_REPO:${BUILD_NUMBER}
                        docker push $ECR_FRONTEND_REPO:latest
                    '''
                }
            }
        }

        stage('Deploy to AWS') {
            steps {
                echo 'Updating AWS ECS Task Definitions and triggering service redeployment...'
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding', 
                    credentialsId: "${AWS_CREDENTIALS_ID}"
                ]]) {
                    sh 'chmod +x ./aws/deploy.sh && ./aws/deploy.sh'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline has finished.'
            cleanWs()
        }
        success {
            echo 'Infrastructure provisioning and code deployment completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please inspect build output.'
        }
    }
}
