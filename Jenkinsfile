pipeline {
    agent any

    stages {
        stage('Test SSH') {
            steps {
                sshagent(credentials: ['ec2-ssh']) {
                    bat '''
                    ssh -o StrictHostKeyChecking=no ubuntu@54.86.136.60 "hostname && pwd && docker ps"
                    '''
                }
            }
        }
    }
}
