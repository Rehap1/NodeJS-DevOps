pipeline {
    agent any

    environment {
        AWS_REGION     = 'us-east-1'
        AWS_ACCOUNT_ID = '090413359912'

        ECR_REPOSITORY = 'taskapi-dev'
        ECR_REGISTRY   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_URI      = "${ECR_REGISTRY}/${ECR_REPOSITORY}"

        EKS_CLUSTER    = 'taskapi-dev-eks'
        K8S_NAMESPACE = 'nodejs-app'
        K8S_DEPLOYMENT = 'nodejs-app-deploy'
        K8S_CONTAINER  = 'nodejs-app'

        IMAGE_TAG      = "build-${BUILD_NUMBER}"
        HOME           = '/var/lib/jenkins'
        KUBECONFIG     = '/var/lib/jenkins/.kube/config'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm

                sh '''
                    echo "Branch: $(git branch --show-current)"
                    echo "Commit: $(git rev-parse --short HEAD)"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      --tag ${IMAGE_URI}:${IMAGE_TAG} \
                      .
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    trivy image \
                      --exit-code 1 \
                      --severity HIGH,CRITICAL \
                      --ignore-unfixed \
                      --no-progress \
                      ${IMAGE_URI}:${IMAGE_TAG}
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                    aws ecr get-login-password \
                      --region ${AWS_REGION} |
                    docker login \
                      --username AWS \
                      --password-stdin ${ECR_REGISTRY}
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                sh 'docker push ${IMAGE_URI}:${IMAGE_TAG}'
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                    kubectl set image \
                      deployment/${K8S_DEPLOYMENT} \
                      ${K8S_CONTAINER}=${IMAGE_URI}:${IMAGE_TAG} \
                      --namespace ${K8S_NAMESPACE}
                '''
            }
        }

        stage('Verify Rollout') {
            steps {
                sh '''
                    kubectl rollout status \
                      deployment/${K8S_DEPLOYMENT} \
                      --namespace ${K8S_NAMESPACE} \
                      --timeout=5m

                    kubectl get pods \
                      --namespace ${K8S_NAMESPACE} \
                      --selector app=nodejs-app \
                      -o wide
                '''
            }
        }
    }

    post {
        success {
            echo "Successfully deployed ${IMAGE_URI}:${IMAGE_TAG}"
        }

        failure {
            echo 'Pipeline failed. Review the failed stage in the console output.'
        }

        always {
            sh '''
                docker logout ${ECR_REGISTRY} || true
                docker image rm ${IMAGE_URI}:${IMAGE_TAG} || true
            '''

            deleteDir()
        }
    }
}