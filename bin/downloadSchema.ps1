#!/bin/env pwsh

Invoke-WebRequest -Uri https://localhost:5001/graphql?sdl -OutFile src/generated/schema.graphql
