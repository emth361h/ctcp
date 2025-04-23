#!/bin/bash

# Set default refresh interval (in seconds)
REFRESH_INTERVAL=5

# Check if a custom refresh interval is provided
if [ $# -eq 1 ]; then
    if [[ $1 =~ ^[0-9]+$ ]]; then
        REFRESH_INTERVAL=$1
    else
        echo "Error: Refresh interval must be a positive integer."
        echo "Usage: $0 [refresh_interval_in_seconds]"
        exit 1
    fi
fi

# Function to display container stats
display_stats() {
    clear
    echo "========================================================"
    echo "  Docker VPS Manager - Container Resource Monitor"
    echo "========================================================"
    echo "  Refresh interval: ${REFRESH_INTERVAL}s (Ctrl+C to exit)"
    echo "========================================================"
    echo ""
    
    # Get container stats
    docker stats --no-stream
    
    # Display system info
    echo ""
    echo "========================================================"
    echo "  System Information"
    echo "========================================================"
    echo ""
    
    # CPU info
    echo "CPU:"
    lscpu | grep "CPU(s):" | head -1
    echo ""
    
    # Memory info
    echo "Memory:"
    free -h
    echo ""
    
    # Disk info
    echo "Disk Usage:"
    df -h | grep -v "tmpfs" | grep -v "udev"
    echo ""
    
    # Docker info
    echo "Docker Images:"
    docker image ls | head -11
    echo ""
    
    echo "Docker Networks:"
    docker network ls | head -11
    echo ""
    
    echo "Docker Volumes:"
    docker volume ls | head -11
    echo ""
    
    echo "========================================================"
    date
    echo "========================================================"
}

# Main loop
while true; do
    display_stats
    sleep $REFRESH_INTERVAL
done
