#!/usr/bin/env bash
set -euo pipefail

exec bunx --bun lint-staged --relative
