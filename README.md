# Faces
Simple REST API service to detect faces and quality of the uploaded images

# To Access The API
```
$ docker run -p 5000:5000 boodskapiot/faces:latest

$ curl -F "file=@/path/to/your/image" http://localhost:5000/detect
```
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

# To Access The UI
```
$ docker run -p 80:80 boodskapiot/faces:latest

Point your browser to http://localhost
```

