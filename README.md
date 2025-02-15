# Lanter Video Middleware Service

## Overview
This is a **Node.js/Express middleware service** that aggregates movie data from multiple third-party APIs (**VHS, DVD, Projector**) to provide a **single search endpoint** for a frontend client.

**Built with:**  
- TypeScript  
- Node.js / Express  
- Docker / Docker Compose  
- Jest for testing  
- Axios for API calls  

---

## **Running Locally with Docker**
### **Build & Start the Container**
```sh
docker-compose up --build
```
- Automatically installs dependencies inside the container.
- Builds Docker image.
- Runs service inside a container.
- Maps port 3000 from the container to your local machine.

### **Stop the Docker Container**
```sh
docker-compose down
```
---

## **Testing The API**
### **Run Unit Tests**
```sh
npm run test
```
