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

        stage('Check Python') {
            steps {
                bat '''
                "C:\\Users\\HVIJA\\AppData\\Local\\Python\\pythoncore-3.14-64\\python.exe" --version
                '''
            }
        }
           stage('Backend Tests') {
            steps {
             echo 'Setting up Python environment and running Django tests...'

              bat '''
              "C:\\Users\\HVIJA\\AppData\\Local\\Python\\pythoncore-3.14-64\\python.exe" -m venv venv

               call venv\\Scripts\\activate

                python -m pip install --upgrade pip
                python -m pip install -r backend\\requirements.txt

          cd backend

        python manage.py test
        '''
    }
}
        
        stage('Build') {
   m    steps {
        echo 'Building application...'
    }
}

stage('Security Check') {
    steps {
        echo 'Running security checks...'
    }
}

stage('Docker Build') {
    steps {
        bat 'docker --version'
        echo 'Docker build completed.'
    }
}

stage('Push to ECR') {
    steps {
        echo 'Pushing image to AWS ECR...'
    }
}

stage('Deploy to AWS') {
    steps {
        echo 'Deploying application to AWS...'
    }
}
        
    }
}

       
