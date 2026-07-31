pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Deploy to EC2') {
            steps {
                bat '''
                ssh -i "%USERPROFILE%\\.ssh\\id_rsa" -o StrictHostKeyChecking=no ubuntu@54.86.136.60 ^
                "cd ~/TaskManagementSystem && \
                git pull origin master && \
                docker compose down && \
                docker compose up --build -d && \
                docker exec tasksphere_backend python manage.py migrate && \
                docker image prune -f"
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}