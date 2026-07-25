pipeline {
    agent any

    environment {
        AWS_CREDENTIALS_ID = 'aws-credentials'
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
                bat '''
                python -m venv venv
                call venv\\Scripts\\activate
                pip install -r backend\\requirements.txt
                cd backend
                python manage.py test
                '''
            }
        }

        stage('Security Check') {
            steps {
                echo 'Running dependency security scans...'
                bat '''
                call venv\\Scripts\\activate
                pip install safety
                safety check
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker Images...'
                bat '''
                docker build -t tasksphere-backend:%BUILD_NUMBER% -t tasksphere-backend:latest backend
                docker build -t tasksphere-frontend:%BUILD_NUMBER% -t tasksphere-frontend:latest frontend
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: "${AWS_CREDENTIALS_ID}"
                ]]) {
                    bat '''
                    aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com

                    docker tag tasksphere-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/tasksphere-backend:latest
                    docker tag tasksphere-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/tasksphere-frontend:latest

                    docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/tasksphere-backend:latest
                    docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/tasksphere-frontend:latest
                    '''
                }
            }
        }

        stage('Deploy to AWS') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: "${AWS_CREDENTIALS_ID}"
                ]]) {
                    bat '''
                    aws ecs update-service --cluster tasksphere-cluster1 --service tasksphere-backend-service --force-new-deployment
                    aws ecs update-service --cluster tasksphere-cluster1 --service tasksphere-frontend-service --force-new-deployment
                    '''
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
            echo 'Deployment Successful!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
