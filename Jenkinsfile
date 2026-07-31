pipeline {
    agent any

    stages {
        stage('Test SSH') {
            steps {
                bat '''
                ssh -i "%USERPROFILE%\\.ssh\\id_rsa" ^
                -o StrictHostKeyChecking=no ^
                ubuntu@54.86.136.60 ^
                "hostname && pwd && docker ps"
                '''
            }
        }
    }
}