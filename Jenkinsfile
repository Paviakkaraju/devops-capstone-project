pipeline {
    agent any
    environment {
        SONAR_SCANNER = tool 'SonarQube Scanner' 
        DOCKER_IMAGE = "pavi006/capstone-project" 
        DOCKER_TAG = "${BUILD_NUMBER}" 
        CONTAINER_NAME = "nodejs-app" 
        APP_PORT = "3000" 
    }
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                credentialsId: 'GITHUB-TOKEN',
                url: 'https://github.com/Paviakkaraju/devops-capstone-project.git'
            }
        }
        stage('Verify Node Version') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    ${SONAR_SCANNER}/bin/sonar-scanner \
                    -Dsonar.projectKey=node-app \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=$SONAR_HOST_URL \
                    -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }
        stage("Quality Gate") {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
            }
        }
        stage('Login to DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'DOCKERHUB-TOKEN',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                sh '''
                docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                docker push ${DOCKER_IMAGE}:latest
                '''
            }
        }
        stage('Deploy to App Server') {
            steps {
                sshagent(['EC2-SSH-KEY']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@172.31.76.150 "\
                    docker pull ${DOCKER_IMAGE}:${DOCKER_TAG} && \
                    docker stop ${CONTAINER_NAME} || true && \
                    docker rm ${CONTAINER_NAME} || true && \
                    docker run -d \
                        -p ${APP_PORT}:${APP_PORT} \
                        --name ${CONTAINER_NAME} \
                        ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    '''
                }
            }
        }
        stage('Cleanup') {
            steps {
                sh '''
                docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true
                docker rmi ${DOCKER_IMAGE}:latest || true
                '''
            }
        }
    }
    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}