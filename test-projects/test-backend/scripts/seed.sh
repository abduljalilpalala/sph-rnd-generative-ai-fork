#!/bin/bash

# Ensure fresh build before seeding
yarn build:swc

IS_SCRIPT=1 ts-node-transpile-only -r tsconfig-paths/register prisma/seed.ts
