FROM maven:3.9.11-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY user_back/demo/pom.xml ./pom.xml
RUN mvn -B -q dependency:go-offline
COPY user_back/demo/src ./src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /workspace/target/*.war app.war
RUN mkdir -p /data/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.war"]

