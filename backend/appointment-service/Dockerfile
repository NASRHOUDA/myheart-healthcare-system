FROM eclipse-temurin:25-jdk-alpine

WORKDIR /app

COPY build/libs/appointment-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
