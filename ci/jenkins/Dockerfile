# =============================================================================
# Jenkins para FlexiCommerce CI
# - Docker CLI + compose plugin (usa el daemon del host vía socket)
# - Node.js 20 (npm ci / tests del pipeline)
# - Plugins y configuración como código (sin asistente de instalación)
# =============================================================================
FROM jenkins/jenkins:lts-jdk17

USER root

# Docker CLI + compose plugin desde el repo oficial de Docker
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
    && install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
       > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends docker-ce-cli docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Permitir al usuario jenkins usar el socket de Docker del host.
# DOCKER_GID debe coincidir con el GID de /var/run/docker.sock en el host.
ARG DOCKER_GID=1001
RUN (getent group ${DOCKER_GID} >/dev/null || groupadd -g ${DOCKER_GID} docker-host) \
    && usermod -aG $(getent group ${DOCKER_GID} | cut -d: -f1) jenkins

# El repo se monta en /workspace (solo lectura); evitar "dubious ownership" de git
RUN git config --system --add safe.directory '*'

USER jenkins

# Plugins pre-instalados
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli -f /usr/share/jenkins/ref/plugins.txt

# Configuración como código (admin, seguridad y job de CI)
COPY casc.yaml /usr/share/jenkins/casc.yaml
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/casc.yaml
