# Dataspace Assistant

## 📋 Prerequisites

* [x] pnpm
* [x] [Node LTS](https://nodejs.org/fr)
* [x] Mongodb
* [x] [Mongodb atlas](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/#atlas-vector-search-indexes) or [Qdrant](https://qdrant.tech/documentation/)
* [x] Local [Ollama](https://ollama.com/) or [OpenAI](https://platform.openai.com/api-keys)
* [ ] (optional) Docker
* [ ] (optional) Docker compose

## ⚙️ Configuration

```dotenv
PORT=3000 #PORT

ASSISTANT_IDENTIFIER=assistant1 #Allow to identify the assistant who respond in headers

#LLM MODEL
MODEL_URL=http://localhost:11434 #MODEL URL FOR LOCAL USE WITH OLLAMA
MODEL=llama3.1 #MODEL USED llama3.1 | llama3.2 | gpt-4o-mini | gpt-4o | gpt-4-turbo | gpt-3.5-turbo

#STORE
STORE=mongoatlas #STORE USED mongoatlas | qdrant

#QDRANT
QDRANT_URI=http://localhost:6333 #QDRANT URL
QDRANT_COLLECTION=offers_vectors #QDRANT COLLECTION NAME

#DB
MONGODB_URI=mongodb+srv://user:paswword@cluster.address.mongodb.net?retryWrites=true&w=majority #LOCALIZATION OF THE OFFERS
DB=synthesis #DATABASE USED
COLLECTION=offers #SPECIFIC COLLECTION

#EMBEDDING
EMBEDDING_MODEL=mxbai-embed-large #MODEL USE FOR EMBEDDING mxbai-embed-large (need local Ollama)
EMBEDDING_URL=http://localhost:11434 #PORT OF THE MODELS
EMBEDDING_BATCH_SIZE=100 #BATCH SIZE WHEN EMBEDDING

#OPEN_API
OPENAI_API_KEY=sk.... #OPENAI KEY IF OPENAI MODEL OR EMBEDDING IS USED
```

```dotenv
cp .env.sample .env
```

## 🐳 Docker

From root directory
```bash
docker build --no-cache -t dataspace-assistant .
```

```bash
docker run --env-file ./.env --name assistant -p 3001:3000 dataspace-assistant
```

## 🐙 Docker Compose

The docker compose file provide an example of a load balancing between two dataspace assistant and nginx. An Ollama container with llama3.2, llama3.1 and mxbai-embed-large is configured and Qdrant too.

From root directory
```bash
docker compose up -d --build
```

Example of two assistant with different configuration using docker compose

```dotenv
PORT=3000

ASSISTANT_IDENTIFIER=assistant-llama3.1-mongoatlas

#LLM MODEL
MODEL_URL=http://ollama:11434
MODEL=llama3.1

#STORE
STORE=mongoatlas

#QDRANT
QDRANT_URI=http://ollama:6333
QDRANT_COLLECTION=offers_vectors

#DB
MONGODB_URI=mongodb+srv://<user>:<password>@<url>?retryWrites=true&w=majority&appName=Cluster0
DB=synthesis
COLLECTION=offers

#EMBEDDING
EMBEDDING_MODEL=mxbai-embed-large
EMBEDDING_URL=http://ollama:11434
EMBEDDING_BATCH_SIZE=100

#ADMIN
ADMIN_KEY=admin_key
```

```dotenv
PORT=3000

ASSISTANT_IDENTIFIER=assistant-llama3.2-qdrant

#LLM MODEL
MODEL_URL=http://ollama:11434
MODEL=llama3.2

#STORE
STORE=qdrant

#QDRANT
QDRANT_URI=http://qdrant:6333
QDRANT_COLLECTION=offers_vectors

#DB
MONGODB_URI=mongodb+srv://<user>:<password>@<url>?retryWrites=true&w=majority&appName=Cluster0
DB=synthesis
COLLECTION=offers

#EMBEDDING
EMBEDDING_MODEL=mxbai-embed-large
EMBEDDING_URL=http://ollama:11434
EMBEDDING_BATCH_SIZE=100

#ADMIN
ADMIN_KEY=admin_key
```

## 🛠️ Setup

```bash
git clone
```

```bash
pnpm i
```

```bash
pnpm build
```

```bash
pnpm start
```

```bash
pnpm dev
```

## 🔢 Embedding

Before running any chat request, the data need to be embedded and some prerequisites are needed:
* a **Mongodb** database with offers from the `Synthesis`
* a **Mongodb atlas database** with a vector index or a **Qdrant** database
* `.env` file

Once the prerequisites are validated, the routes `/embedding` can be used to prepare the data. The header `x-assistant-admin-key` is required and is value is defined in the `.env` file with the variable `ADMIN_KEY`.

> ```yaml
> docker-compose.yaml
> version: '3.9'
> services:
> qdrant:
> image: qdrant/qdrant
> container_name: qdrant
> restart: always
> ports:
> - "6333:6333"
> volumes:
> - ./qdrant_data:/qdrant/storage
> 
> ```
> 
> ```bash
> docker compose up -d --build
> ```
> 

## 💬 Chat

Once the embedding has been run the `/chat` routes can be used.

The routes can be used this way: 

* Request
```http request
POST /v1/mongoatlas/chat?result=true
```
* Body

```json
{
  message: "Wich offers can be used for education purpose ?"
}
```

* Response with `?result=true`

```json
{
    "response": "Based on the context, the following offers can be used for education purposes:\n\n1. Match learner skills\n2. Free educational services integration\n3. Teacher Avatar \n4. Karriereassist Service",
    "retrieved_count": 4,
    "retrieved_docs": [
        {
            "pageContent": "name: Match learner skills - description: Curriculum Vitae from Edunao customers on Moodle LMS - category: professional experience - domain: Education - pricing: 0 - provider: EDUNAO - type: Service",
            "metadata": {
                "_id": "683d6123280d50d6c86e013a",
                "marketplace": "VisionsTrust",
                "marketplaceUrl": "https://visionstrust.com",
                "category": "professional experience",
                "domain": "Education",
                "name": "Match learner skills",
                "description": "Curriculum Vitae from Edunao customers on Moodle LMS",
                "type": "Service",
                "provider": "EDUNAO",
                "url": "https://visionstrust.com/catalog/offers/67c067d9c92ccf4328ebf30a",
                "pricing": "0",
                "termsOfUse": "",
                "createdAt": "2025-06-02T08:30:27.080Z",
                "updatedAt": "2025-06-02T08:30:27.080Z"
            }
        },
        {
            "pageContent": "name: Free educational services integration - description: Integration of free services on the Ikigai platform - category: learning analytics - domain: Education - pricing: 0 - provider: Games for Citizens - type: Service",
            "metadata": {
                "_id": "683d6122280d50d6c86e00ea",
                "marketplace": "VisionsTrust",
                "marketplaceUrl": "https://visionstrust.com",
                "category": "learning analytics",
                "domain": "Education",
                "name": "Free educational services integration",
                "description": "Integration of free services on the Ikigai platform",
                "type": "Service",
                "provider": "Games for Citizens",
                "url": "https://visionstrust.com/catalog/offers/65aa65934dbbec41d021b35d",
                "pricing": "0",
                "termsOfUse": "",
                "createdAt": "2025-06-02T08:30:27.077Z",
                "updatedAt": "2025-06-02T08:30:27.077Z"
            }
        },
        {
            "pageContent": "name: Teacher Avatar - description: Learning content explained in an understandable way - category: develop potential - domain: Education - pricing: 1000 - provider: Ventr - type: Service",
            "metadata": {
                "_id": "683d6122280d50d6c86e00a7",
                "marketplace": "VisionsTrust",
                "marketplaceUrl": "https://visionstrust.com",
                "category": "develop potential",
                "domain": "Education",
                "name": "Teacher Avatar",
                "description": "Learning content explained in an understandable way",
                "type": "Service",
                "provider": "Ventr",
                "url": "https://visionstrust.com/catalog/offers/656dfb40282d47cfa6b66fd5",
                "pricing": "1000",
                "termsOfUse": "",
                "createdAt": "2025-06-02T08:30:27.075Z",
                "updatedAt": "2025-06-02T08:30:27.075Z"
            }
        },
        {
            "pageContent": "name: Karriereassist Service - description: Our service, aims to help you find your dream job. - category: skills matching - domain: Education - pricing: 1000 - provider: Schülerkarriere GmbH - type: Service",
            "metadata": {
                "_id": "683d6122280d50d6c86e00a9",
                "marketplace": "VisionsTrust",
                "marketplaceUrl": "https://visionstrust.com",
                "category": "skills matching",
                "domain": "Education",
                "name": "Karriereassist Service",
                "description": "Our service, aims to help you find your dream job.",
                "type": "Service",
                "provider": "Schülerkarriere GmbH",
                "url": "https://visionstrust.com/catalog/offers/656dfb40282d47cfa6b66fe6",
                "pricing": "1000",
                "termsOfUse": "",
                "createdAt": "2025-06-02T08:30:27.075Z",
                "updatedAt": "2025-06-02T08:30:27.075Z"
            }
        }
    ]
}
```
* Response without query params
```json
{
  "response": "Based on the context, the following offers can be used for education purposes:\n\n1. Match learner skills\n2. Free educational services integration\n3. Teacher Avatar \n4. Karriereassist Service"
}
```

* Headers Response
```json
{
  "x-assistant-identifier": "assistant-llama3.2-qdrant"
}
```

## 📑 Documentations

The **Swagger** documentation is available on the `/docs` endpoint for the running apps, or can be found in the `/docs` directory.

to regenerate a new `swagger.json` use 
```bash
pnpm generate-swagger
```

## 🧪 Tests

🚧**WIP**🛠️

## 📐 Architecture

🚧**WIP**🛠️

## 📌 To Do

* [x] Simple Docker
* [X] Update error in README.md
* [x] Merge routes
* [ ] Add offers model
* [ ] Split embedding Logic
* [ ] Add models support
* [ ] Add embedding support
* [ ] Update .env
* [ ] Tests
* [ ] Prompt selector 
* [x] Admin protected routes first version
* [ ] Add archi and flow diagrams
