# Dockerfile
FROM eclipse-temurin:17-jdk-alpine

# Vendos direktorinë e punës
WORKDIR /app

# Kopjo jar-in e ndërtuar (sigurohu që versioni i jar-it është i saktë)
COPY target/termini-0.0.1-SNAPSHOT.jar app.jar

# Ekspozon portin default të Spring Boot
EXPOSE 8080

# Komanda e startimit
ENTRYPOINT ["java", "-jar", "app.jar"]
