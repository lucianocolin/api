# Microservices Architecture with NATS and API Gateway

This repository demonstrates a microservices architecture using a messaging system with [NATS](https://nats.io/). The main component, an API Gateway, handles incoming HTTP requests and routes them to various microservices via a controller.

## Microservices Description

### API Gateway

- The central point for receiving and dispatching HTTP requests.
- Routes requests to the appropriate microservices based on the URL and HTTP methods.

### Auth Microservice

- Manages user authentication processes.
- Features include user registration, authentication, and user listing.
- Communicates with the Business User Microservice to retrieve user details.

### Business User Microservice

- Responsible for managing user data.
- Provides detailed listing and management of business user profiles.
- Interacts with the Auth Microservice to ensure authentication before providing access to user data.
