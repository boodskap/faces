#!/bin/bash

cd /faces/ui
npm install
pm2 start ml-node.js

cd /faces
python3 ./service.py
