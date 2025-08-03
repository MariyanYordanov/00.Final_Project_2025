# Use the official .NET 8.0 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copy csproj files and restore dependencies
COPY WorldFamily.Api/*.csproj ./WorldFamily.Api/
COPY WorldFamily.Data/*.csproj ./WorldFamily.Data/
RUN dotnet restore WorldFamily.Api/WorldFamily.Api.csproj

# Copy everything else and build
COPY . .
WORKDIR /app/WorldFamily.Api
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/WorldFamily.Api/out .

# Create directory for SQLite database (for development)
RUN mkdir -p /app/Data

# Expose port
EXPOSE 5000

# Set environment variables
ENV ASPNETCORE_URLS=http://*:5000
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "WorldFamily.Api.dll"]