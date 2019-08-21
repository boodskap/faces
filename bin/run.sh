#!/bin/bash

cd /faces/ui
pm2 start ml-node.js

cd /faces
python3 ./service.py
