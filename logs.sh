#!/bin/bash

# Default service to show logs for
SERVICE="all"

# Default number of lines to show
LINES="100"

# Default follow mode
FOLLOW=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -l|--lines)
            LINES="$2"
            shift 2
            ;;
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -s, --service SERVICE  Service to show logs for (backend, frontend, nginx, mongo, all)"
            echo "  -l, --lines LINES      Number of lines to show (default: 100)"
            echo "  -f, --follow           Follow log output"
            echo "  -h, --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                     Show last 100 lines of logs for all services"
            echo "  $0 -s backend          Show last 100 lines of logs for backend service"
            echo "  $0 -s backend -l 50    Show last 50 lines of logs for backend service"
            echo "  $0 -s backend -f       Follow logs for backend service"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help to see available options"
            exit 1
            ;;
    esac
done

# Validate service
if [[ "$SERVICE" != "backend" && "$SERVICE" != "frontend" && "$SERVICE" != "nginx" && "$SERVICE" != "mongo" && "$SERVICE" != "all" ]]; then
    echo "Invalid service: $SERVICE"
    echo "Valid services are: backend, frontend, nginx, mongo, all"
    exit 1
fi

# Validate lines
if ! [[ "$LINES" =~ ^[0-9]+$ ]]; then
    echo "Invalid number of lines: $LINES"
    echo "Lines must be a positive integer"
    exit 1
fi

# Build docker-compose command
CMD="docker-compose logs"

# Add service if not "all"
if [[ "$SERVICE" != "all" ]]; then
    CMD="$CMD $SERVICE"
fi

# Add follow flag if requested
if [[ "$FOLLOW" == true ]]; then
    CMD="$CMD --follow"
else
    CMD="$CMD --tail=$LINES"
fi

# Display command being executed
echo "Executing: $CMD"
echo "Press Ctrl+C to exit"
echo ""

# Execute command
eval $CMD
