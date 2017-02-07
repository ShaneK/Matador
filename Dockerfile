# Pull base image.
FROM mhart/alpine-node-auto:6.2.0

ADD ./ /app

# Define working directory.
WORKDIR /app

# Installing app
RUN npm install --production

# Define default command.
CMD ["/bin/sh", "endpoint.sh"]

# Expose ports.
EXPOSE 3000