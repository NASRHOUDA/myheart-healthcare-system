FROM eclipse-temurin:25-jdk-alpine

WORKDIR /app

COPY build/libs/app.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
