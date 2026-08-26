docker stop xproxy
docker rm xproxy
docker build -t xproxy .
docker run -d --name xproxy -p 20128:20128 --env-file .env -v xproxy-data:/app/data xproxy
