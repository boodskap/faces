# Faces
Simple REST API service to detect faces and quality of the uploaded images

# Run as Docker container
docker run -p 5000:5000 boodskapiot/faces:latest

# Usage

curl -F "file=@/path/to/your/image" http://localhost:5000/predict

# Example Result

```json
{
  "quality": 88.11931760645587,
  "faces": 2,
  "boxes": [
    {
      "x": 1077,
      "y": 101,
      "ex": 1138,
      "ey": 162
    },
    {
      "x": 1397,
      "y": 112,
      "ex": 1475,
      "ey": 190
    }
  ]
}
```
