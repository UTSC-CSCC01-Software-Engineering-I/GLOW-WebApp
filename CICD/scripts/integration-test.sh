#!/bin/bash

echo "🔁 Running integration tests on deployed containers..."

# Function to test endpoint with retries
test_endpoint() {
    local url=$1
    local name=$2
    local max_attempts=5
    local wait_time=30

    for attempt in $(seq 1 $max_attempts); do
        echo "🔍 Testing $name (attempt $attempt/$max_attempts)..."
        
        if curl --fail --silent --show-error --max-time 30 "$url"; then
            echo "✅ $name is responding"
            return 0
        else
            echo "⚠️ $name failed, waiting ${wait_time}s before retry..."
            sleep $wait_time
        fi
    done
    
    echo "❌ $name failed after $max_attempts attempts"
    return 1
}

# Test backend health
test_endpoint "https://glow-backend-v4-0-0.onrender.com/api/health" "Backend health check" || exit 1

# Test backend functional route
test_endpoint "https://glow-backend-v4-0-0.onrender.com/api/water-data" "Backend water data endpoint" || exit 1

# Test frontend
test_endpoint "https://glow-frontend-v4-0-0.onrender.com" "Frontend application" || exit 1

echo "🎉 All integration tests passed successfully!"
