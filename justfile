set shell := ["zsh", "-cu"]

default:
    just --list

build:
    bun run build

check:
    bun run check

fix:
    bun run fix

test:
    bun run test
