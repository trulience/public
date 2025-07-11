#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

TARGET=${1:-staging}                # First argument: deployment target (default 'staging')
BUILD_ROOT=${2:-$(pwd)/build}       # Second argument: build path (Default to $(pwd)/build)
ROOT=$(pwd)

# Function to build React projects
build_react_project() {
  cd "$ROOT"
  local project_dir=$1
  echo "============== BUILDING $project_dir ====================="
  cd "reactjs/$project_dir" || exit
  npm install
  SKIP_PREFLIGHT_CHECK=true npm run build
  echo "============== COPYING $project_dir BUILDS TO $BUILD_ROOT/$project_dir ====================="
  mkdir -p "$BUILD_ROOT/$project_dir"
  cp -r "build/"* "$BUILD_ROOT/$project_dir/" || true
  cd "$ROOT"
}

build_html_file() {
  cd "$ROOT"
  local project_dir=$1
 
  # Copy all HTML files from the root html directory
  echo "============== COPYING ALL HTML FILES FROM html/ TO $BUILD_ROOT/$project_dir ====================="
  mkdir -p "$BUILD_ROOT/$project_dir"
  find "$ROOT/$project_dir" -maxdepth 1 -name '*.html' -exec cp {} "$BUILD_ROOT/$project_dir/" \;

  cd "$ROOT"
}

# Function to copy builds to the public folder
echo "TARGET ===> $TARGET"
echo "BUILD PATH ===> $BUILD_ROOT"

# Main execution
build_react_project "trulience-ai"
build_react_project "audio-driven"
build_html_file "html"

echo "============== BUILD SUCCESS ====================="