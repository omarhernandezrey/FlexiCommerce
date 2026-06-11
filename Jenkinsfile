// =============================================================================
// FlexiCommerce — Pipeline de CI
// Job: flexicommerce-ci (definido en ci/jenkins/casc.yaml)
// Corre sobre el último commit de main del repo montado en /workspace.
// =============================================================================
pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '15'))
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Dependencias') {
      parallel {
        stage('Backend') {
          steps {
            dir('backend') {
              sh 'npm ci'
              sh 'npx prisma generate'
            }
          }
        }
        stage('Frontend') {
          steps {
            dir('frontend') {
              sh 'npm ci'
            }
          }
        }
      }
    }

    stage('Calidad') {
      parallel {
        stage('Type-check backend') {
          steps {
            dir('backend') {
              sh 'npm run type-check'
            }
          }
        }
        stage('Tests backend') {
          steps {
            dir('backend') {
              sh 'npm test'
            }
          }
        }
        stage('Tests frontend') {
          steps {
            dir('frontend') {
              sh 'npm test -- --ci'
            }
          }
        }
      }
    }

    stage('Imágenes Docker') {
      steps {
        sh 'docker compose build backend frontend'
      }
    }
  }

  post {
    success {
      echo '✅ Pipeline OK — tests verdes e imágenes construidas'
    }
    failure {
      echo '❌ Pipeline falló — revisar el stage en rojo'
    }
    cleanup {
      cleanWs(deleteDirs: true, notFailBuild: true)
    }
  }
}
