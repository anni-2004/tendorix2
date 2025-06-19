#!/bin/bash

# Tendorix Deployment Script
set -e

echo "🚀 Starting Tendorix Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        echo "⚠️  .env file not found. Creating from .env.example..."
        cp .env.example .env
        echo "📝 Please edit .env file with your configuration before running again."
        exit 1
    fi
}

# Function to deploy development environment
deploy_dev() {
    echo "🔧 Deploying development environment..."
    check_env_file
    
    # Build and start services
    docker-compose down
    docker-compose build
    docker-compose up -d
    
    echo "✅ Development environment deployed successfully!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔗 Backend API: http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
}

# Function to deploy production environment
deploy_prod() {
    echo "🏭 Deploying production environment..."
    check_env_file
    
    # Build and start production services
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml build
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "✅ Production environment deployed successfully!"
    echo "🌐 Application: https://your-domain.com"
}

# Function to deploy to Kubernetes
deploy_k8s() {
    echo "☸️  Deploying to Kubernetes..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        echo "❌ kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Apply Kubernetes manifests
    kubectl apply -f kubernetes/namespace.yaml
    kubectl apply -f kubernetes/secrets.yaml
    kubectl apply -f kubernetes/mongodb-deployment.yaml
    kubectl apply -f kubernetes/backend-deployment.yaml
    kubectl apply -f kubernetes/frontend-deployment.yaml
    kubectl apply -f kubernetes/ingress.yaml
    
    echo "✅ Kubernetes deployment completed!"
    echo "📊 Check status: kubectl get pods -n tendorix"
}

# Function to show logs
show_logs() {
    echo "📋 Showing application logs..."
    docker-compose logs -f
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping services..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down
    echo "✅ Services stopped successfully!"
}

# Function to clean up
cleanup() {
    echo "🧹 Cleaning up..."
    docker-compose down -v
    docker system prune -f
    echo "✅ Cleanup completed!"
}

# Function to show help
show_help() {
    echo "Tendorix Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev       Deploy development environment"
    echo "  prod      Deploy production environment"
    echo "  k8s       Deploy to Kubernetes"
    echo "  logs      Show application logs"
    echo "  stop      Stop all services"
    echo "  clean     Clean up containers and volumes"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh dev     # Start development environment"
    echo "  ./deploy.sh prod    # Start production environment"
    echo "  ./deploy.sh logs    # View logs"
    echo "  ./deploy.sh stop    # Stop services"
}

# Main script logic
case "${1:-help}" in
    dev)
        deploy_dev
        ;;
    prod)
        deploy_prod
        ;;
    k8s)
        deploy_k8s
        ;;
    logs)
        show_logs
        ;;
    stop)
        stop_services
        ;;
    clean)
        cleanup
        ;;
    help|*)
        show_help
        ;;
esac