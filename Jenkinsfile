pipeline {
    agent any

    environment {
        AWS_CREDENTIALS_ID = 'aws-credentials' // Jenkins AWS credentials ID
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

        stage('Docker Build') {
            steps {
                echo 'Building Docker Images...'
                sh '''
                    # Load AWS details from central .env file
                    if [ -f .env ]; then
                        export $(grep -v '^#' .env | xargs)
                    fi
                    
                    BACKEND_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/tasksphere-backend"
                    FRONTEND_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/tasksphere-frontend"
                    
                    echo "Building Backend image for $BACKEND_REPO..."
                    docker build -t $BACKEND_REPO:${BUILD_NUMBER} -t $BACKEND_REPO:latest ./backend
                    
                    echo "Building Frontend image for $FRONTEND_REPO..."
                    docker build -t $FRONTEND_REPO:${BUILD_NUMBER} -t $FRONTEND_REPO:latest ./frontend
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
                        # Load AWS details from central .env file
                        if [ -f .env ]; then
                            export $(grep -v '^#' .env | xargs)
                        fi
                        
                        BACKEND_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/tasksphere-backend"
                        FRONTEND_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/tasksphere-frontend"
                        
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                        
                        docker push $BACKEND_REPO:${BUILD_NUMBER}
                        docker push $BACKEND_REPO:latest
                        
                        docker push $FRONTEND_REPO:${BUILD_NUMBER}
                        docker push $FRONTEND_REPO:latest
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
            echo 'TaskSphere image compilation and AWS deploy triggered successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check build logs.'
        }
    }
}
