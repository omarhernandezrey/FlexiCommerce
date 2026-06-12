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
    timeout(time: 45, unit: 'MINUTES')
  }

  triggers {
    // Disparo automático: revisa el repo cada ~5 min y construye si hay commits nuevos en main
    pollSCM('H/5 * * * *')
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Dependencias') {
      steps {
        // Instalación única desde la raíz: el repo usa npm workspaces y los
        // npm ci por workspace en paralelo chocarían sobre el mismo node_modules
        sh 'npm ci'
        dir('backend') {
          sh 'npx prisma generate'
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
      environment {
        // Solo para que compose interpole el modelo; JWT_SECRET no se usa en build
        JWT_SECRET = 'ci-dummy-no-usado-en-build'
      }
      steps {
        sh 'docker compose build backend frontend'
      }
    }

    stage('Desplegar contenedores') {
      steps {
        // .env real del host (montado en /workspace) — los secretos no viven en el repo.
        // Mismo proyecto compose ("flexicommerce"), así que recrea los contenedores
        // del stack con las imágenes recién construidas, conservando datos y red.
        sh 'cp /workspace/.env .env'
        sh 'docker compose up -d backend frontend'
      }
    }

    stage('Pruebas funcionales (smoke tests)') {
      steps {
        sh '''
          echo "Esperando a que el backend recién desplegado esté disponible..."
          ok=0
          for i in $(seq 1 30); do
            if curl -sf http://backend:3001/api/health >/dev/null 2>&1; then ok=1; break; fi
            sleep 5
          done
          [ "$ok" = "1" ] || { echo "El backend no respondió a tiempo"; exit 1; }

          echo "[1/3] Health check del backend"
          curl -sf http://backend:3001/api/health | grep -q '"status":"OK"'

          echo "[2/3] API + base de datos (GET /api/products)"
          curl -sf 'http://backend:3001/api/products?limit=1' | grep -q '"success":true'

          echo "[3/3] Frontend responde 200 (con reintentos mientras arranca)"
          code=000
          for i in $(seq 1 12); do
            code=$(curl -s -o /dev/null -w '%{http_code}' http://frontend:3000/ || true)
            [ "$code" = "200" ] && break
            sleep 5
          done
          [ "$code" = "200" ] || { echo "Frontend respondió $code"; exit 1; }

          echo "✅ Aplicación desplegada, operativa y verificada"
        '''
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
