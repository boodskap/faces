#!/bin/bash

cd /faces/ui
npm install
pm2 start ml-node.js

service nginx start

cd /faces
python3 ./service.py
