# Use a lightweight OpenJDK 17 image as the base
FROM openjdk:21-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the built JAR file from your host machine into the container
# The JAR file is typically found in the 'target' directory after 'mvn clean package'
# Make sure the JAR name matches your actual built JAR (e.g., demo-0.0.1-SNAPSHOT.jar)
ARG JAR_FILE=target/demo-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar

# Expose the port that your Spring Boot application listens on
EXPOSE 8080

# Define the command to run your application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]

# Optional: Add metadata for the image
LABEL maintainer="anandavinash456@gmail.com"
LABEL version="1.0"
LABEL description="Spring Boot Backend Service for CRUD operations"

