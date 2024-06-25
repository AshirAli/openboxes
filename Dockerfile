FROM node:14 as builder

ENV APP_HOME=/app

WORKDIR $APP_HOME

COPY package.json /tmp/package.json
COPY package-lock.json  /tmp/package-lock.json
RUN cd /tmp \
    && npm install -g npm@6 \
    && npm config set engine-strict true \
    && npm install 
RUN cp -a /tmp/node_modules $APP_HOME

COPY . $APP_HOME

RUN npm run bundle

FROM openjdk:8-jdk

ENV APP_HOME=/app
# ARG NODE_VERSION=14.17.3
# ENV NVM_DIR=$APP_HOMEe/.nvm


# RUN mkdir $APP_HOME/static/
# RUN mkdir $APP_HOME/media/

# ENV PYTHONDONTWRITEBYTECODE 1
# ENV PYTHONUNBUFFERED 1

# COPY . $APP_HOME

RUN apt-get update \
    && apt-get install -y \
    curl \
    # openjdk-8-jdk \
    # software-properties-common \
    unzip \
    zip 
#     && rm -rf /var/lib/apt/lists/*
    # NodeJS
    # && mkdir -p ${NVM_DIR} \
    # && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash \
    # && . ${NVM_DIR}/nvm.sh \
    # && nvm install ${NODE_VERSION} \
    # && nvm use v${NODE_VERSION} \
    # && npm install -g yarn \
    # && nvm alias default v${NODE_VERSION} \
    # && rm -rf ${NVM_DIR}/.cache \
    # && echo 'export NVM_DIR="/app/.nvm"' >>/app/.bashrc \
    # && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm' >>/app/.bashrc \
    # && echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion' >>/app/.bashrc \
    # && npm config set engine-strict true \
    # && npm install

# RUN apt-get -y install 
# RUN \
#   echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
#   add-apt-repository -y ppa:webupd8team/java && \
#   apt-get update && \
#   apt-get install -y oracle-java8-installer && \
#   rm -rf /var/lib/apt/lists/* && \
#   rm -rf /var/cache/oracle-jdk8-installer
# RUN add-apt-repository ppa:ts.sch.gr/ppa \
# # accept oracle license
#   && echo debconf shared/accepted-oracle-license-v1-1 select true | debconf-set-selections \
#   && echo debconf shared/accepted-oracle-license-v1-1 seen true | debconf-set-selections \
#   && apt-get update \
# # install oracle jdk 8 and make it default
#   && apt-get -y install oracle-java8-installer \
#   && apt-get -y install oracle-java8-set-default \
# # clean up
#   && apt-get clean all \
#   && rm -rf /var/lib/apt/lists/*

# RUN curl -s "https://get.sdkman.io" | bash
# RUN sdk install grails 3.3.10
# Initialize SDKMan! environment
# RUN /bin/bash -c "source /root/.sdkman/bin/sdkman-init.sh && sdk version"

# Install Grails using SDKMan!
# Set the Grails version and install it
ENV GRAILS_VERSION=3.3.10
RUN curl -s "https://get.sdkman.io" | bash && \
    bash -c "source $HOME/.sdkman/bin/sdkman-init.sh && sdk install grails $GRAILS_VERSION"

RUN /bin/bash -c "source /root/.sdkman/bin/sdkman-init.sh && sdk install grails 3.3.10"

# SDKMan! and Grails available in PATH
ENV SDKMAN_DIR="/root/.sdkman"
ENV PATH=${SDKMAN_DIR}/candidates/grails/current/bin:${PATH}
ENV LD_BIND_NOW=1
# Set JAVA_HOME environment variable
# ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
RUN whereis java
# RUN ls /usr/lib/jvm
# ENV JAVA_HOME="/usr/bin/java"
# ENV JAVA_HOME="/usr/lib/jvm/java-8-openjdk-arm64"
# ENV PATH=$JAVA_HOME/bin:$PATH

# RUN echo "Java version:" && \
#     $JAVA_HOME/bin/java -version


# RUN npm config set engine-strict true \
#     && npm install

# RUN npm run bundle

# Create Openboxes configuration directory
# TODO: Convert config to file
RUN mkdir -p $HOME/.grails && \
    echo "# Database connection settings\n\
    dataSource.url=jdbc:mysql://localhost:3306/openboxes\n\
    dataSource.username=openboxes\n\
    dataSource.password=openboxes\n\
    # OpenBoxes mail settings (disabled by default)\n\
    grails.mail.enabled=false\n" > $HOME/.grails/openboxes-config.properties

# Verify the configuration file creation
# RUN cat $HOME/.grails/openboxes-config.properties

WORKDIR $APP_HOME

COPY --from=builder $APP_HOME $APP_HOME

# RUN /bin/bash -c "source /root/.sdkman/bin/sdkman-init.sh && grails install-profile react-webpack || true"
# Ensure that the profile is included in the project's dependencies or install it explicitly
# RUN /bin/bash -c "source /root/.sdkman/bin/sdkman-init.sh && grails list-profiles"
RUN grails --version
RUN chmod +x gradlew    
# RUN ulimit -c unlimited
# Set executable permissions for the Gradle wrapper script if it exists
# RUN find /root/.sdkman/candidates/gradle/4.10.3/bin -name "gradle" -exec chmod +x {} \;

# RUN grails upgrade
RUN grails compile
# RUN bash -c "ulimit -c unlimited && source $SDKMAN_DIR/bin/sdkman-init.sh && grails compile"
# RUN /bin/bash -c "source /root/.sdkman/bin/sdkman-init.sh && grails compile"
# RUN /bin/bash -c "source /root/.sdkman/bin/sdkman-init.sh && grails run-app"

# RUN grails compile

# RUN grails run-app


# COPY pyproject.toml /app/

# RUN pip3 install poetry
#RUN poetry config virtualenvs.create false
# RUN poetry install

# COPY ./docker/dev/entrypoint.sh /entrypoint.sh

# RUN chmod +x /entrypoint.sh

# COPY . /app/

# ENTRYPOINT [ "/entrypoint.sh" ]

EXPOSE 8080

CMD ["grails", "run-app"]
# CMD ["tail", "-f", "/dev/null"]
# CMD ["/bin/bash", "-c", "source $SDKMAN_DIR/bin/sdkman-init.sh && grails run-app --stacktrace"]
