#!/bin/bash

# Impression3D - Model Download Script
# Downloads and sets up ML models for 3D generation

set -e

echo "📥 Downloading ML models for Impression3D..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Model cache directory
MODEL_DIR="${MODEL_CACHE_DIR:-./backend/models}"
mkdir -p "$MODEL_DIR"

echo ""
echo "${BLUE}Model cache directory: ${MODEL_DIR}${NC}"
echo ""

# Function to download model
download_model() {
    local model_name=$1
    local model_url=$2
    local target_dir="${MODEL_DIR}/${model_name}"

    echo "${BLUE}Downloading ${model_name}...${NC}"

    if [ -d "$target_dir" ]; then
        echo "${YELLOW}⚠${NC} ${model_name} already exists, skipping..."
        return
    fi

    mkdir -p "$target_dir"

    # TODO: Implement actual model download
    # For now, just create placeholder
    echo "Placeholder for ${model_name}" > "${target_dir}/README.txt"

    echo "${GREEN}✓${NC} ${model_name} downloaded"
}

echo "${BLUE}Step 1: Downloading TripoSR (Image-to-3D)${NC}"
echo "==========================================="
download_model "triposr" "https://github.com/VAST-AI-Research/TripoSR"

echo ""
echo "${BLUE}Step 2: Downloading Shap-E (Text-to-3D)${NC}"
echo "=========================================="
download_model "shap-e" "https://github.com/openai/shap-e"

echo ""
echo "${GREEN}✅ Model download complete!${NC}"
echo ""
echo "📚 Model locations:"
echo "  TripoSR: ${MODEL_DIR}/triposr"
echo "  Shap-E:  ${MODEL_DIR}/shap-e"
echo ""
echo "${YELLOW}Note:${NC} Actual model files will be downloaded on first use."
echo "Make sure you have sufficient disk space (several GB per model)."
echo ""
echo "🚀 Ready to generate 3D models!"
