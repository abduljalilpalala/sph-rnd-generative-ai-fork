#!/bin/bash

IS_SCRIPT=1 ts-node -r tsconfig-paths/register prisma/seed.ts
