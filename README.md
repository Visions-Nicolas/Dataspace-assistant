# Dataspace Assistant

## 📋 Prerequisites

* [x] pnpm
* [x] [Node LTS](https://nodejs.org/fr)
* [x] Mongodb
* [x] [Mongodb atlas](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/#atlas-vector-search-indexes) or [Qdrant](https://qdrant.tech/documentation/)
* [x] Local [Ollama](https://ollama.com/) or [OpenAI](https://platform.openai.com/api-keys)

## ⚙️ Configuration

```dotenv
PORT=3501 #PORT

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

## 🛠️ Setup

```shell
git clone
```

```shell
pnpm i
```

```shell
pnpm build
```

```shell
pnpm start
```

```shell
pnpm dev
```

## 🔢 Embedding

Before running any chat request, the data need to be embedded and some prerequisites are needed:
* a **Mongodb** database with offers from the `Synthesis`
* a **Mongodb atlas database** with a vector index of a **Qdrant** database
* `.env` file

Once the prerequisites are validated, the routes `/embedding` can be used to prepare the data for the use of the vector and LLMs.

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
> ```shell
> docker compose up -d --build
> ```
> 

## 💬 Chat

Once the embedding has been run the `/chat` routes can be used. Currently only one model can be used.

The routes can be used this way: 

```http request
POST /v1/mongoatlas/chat?result=true b
```
```jsonc
#Body
{
  message: "Wich offers can be used for education purpose ?"
}
```

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

```json
{
  "response": "Based on the context, the following offers can be used for education purposes:\n\n1. Match learner skills\n2. Free educational services integration\n3. Teacher Avatar \n4. Karriereassist Service"
}
```

## 📑 Documentations

The **Swagger** documentation is available on the `/docs` endpoint for the running apps, or can be found in the `/docs` directory.

to regenerate a new `swagger.json` use 
```shell
pnpm generate-swagger
```

## 🧪 Tests

🚧**WIP**🛠️

## To Do

[] docker
[] update docs
[] merge routes
[] add offers model
[] Split embedding Logic
[] add models support
[] add embedding support
[] update .env
[] test
[] prompt selector 
[] admin protected routes
[] add archi and flow diagrams
[] load balancing tests
