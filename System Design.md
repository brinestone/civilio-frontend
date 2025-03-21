### **System Design for CivilIO: JavaFX Application with Hasura, Leaflet, and PostgreSQL**

This document outlines the updated system design for **CivilIO**, a JavaFX application that ports the core features of **Cartoecima 2.0**. The application will use **Hasura** as the backend for GraphQL APIs, **PostgreSQL** for the database, and **Leaflet** for map visualization. The frontend will be built using **JavaFX**. The backend will be deployed **on-premises using Docker**.

---

### **1. High-Level Architecture**
The system will follow a **client-server architecture** with the following layers:
1. **Frontend (Client)**: JavaFX application for the user interface.
2. **Backend (Server)**: Hasura for GraphQL APIs and database interactions.
3. **Database**: PostgreSQL for storing application data.
4. **Map Service**: Leaflet for rendering thematic maps.

---

### **2. Components**

#### **Frontend (JavaFX)**
- **Login Screen**: Handles user authentication.
- **Dashboard**: Provides navigation to different modules (data management, maps, statistics).
- **Data Management Module**:
  - View, add, edit, and delete civil status centers (CECs).
  - Manage administrative units (regions, departments, communes).
  - Manage equipment and infrastructure data.
- **Thematic Maps Module**:
  - Display maps using Leaflet.
  - Allow users to filter and customize map data.
  - Export maps as images.
- **Statistics Module**:
  - Generate dynamic tables and graphs.
  - Export data as CSV, Excel, or PDF.
- **Reporting Module**:
  - Generate and export reports.

#### **Backend (Hasura)**
- **GraphQL APIs**:
  - Hasura automatically generates GraphQL APIs for CRUD operations on PostgreSQL tables.
  - Custom business logic can be added using Hasura Actions or remote schemas.
- **Authentication**:
  - Integrate with an authentication service (e.g., Auth0, Firebase) for user authentication.
  - Use JWT tokens for secure API access.
- **Event Triggers**:
  - Set up event triggers in Hasura for real-time updates (e.g., notify users when new data is added).

#### **Database (PostgreSQL)**
- **Tables**:
  - `users`: Stores user credentials and roles.
  - `cecs`: Stores civil status center data (e.g., name, location, equipment).
  - `administrative_units`: Stores regions, departments, and communes.
  - `equipment`: Stores equipment and infrastructure data.
  - `variables`: Stores the dictionary of variables (e.g., types of equipment, sources of water).
- **Indexes**:
  - Create indexes on frequently queried fields (e.g., region, department) for faster queries.

#### **Map Service (Leaflet)**
- **Map Rendering**:
  - Use Leaflet to render maps in a JavaFX WebView.
  - Display regions, CEC locations, and thematic data (e.g., number of birth certificates issued).
- **Map Customization**:
  - Allow users to customize map colors and labels.
  - Add annotations (e.g., text, lines, shapes).
- **Data Integration**:
  - Fetch map data from Hasura via GraphQL APIs.

---

### **3. Data Flow**
1. **User Authentication**:
   - The JavaFX client sends login credentials to the authentication service.
   - The authentication service validates the credentials and returns a JWT token.
   - The client includes the JWT token in subsequent API requests.
   - The client stores the JWT token using the underlying system token store.

2. **Data Management**:
   - The JavaFX client sends GraphQL queries/mutations to Hasura for data operations.
   - Hasura processes the requests and interacts with PostgreSQL.

3. **Thematic Maps**:
   - The JavaFX client requests map data (e.g., regions, CEC locations) from Hasura via GraphQL.
   - Hasura fetches the data from PostgreSQL and returns it to the client.
   - The client renders the map using Leaflet in a WebView.

4. **Statistics and Reporting**:
   - The JavaFX client requests statistical data (e.g., number of birth certificates issued) from Hasura via GraphQL.
   - Hasura processes the data and returns it to the client.
   - The client generates tables and graphs using JavaFX components.

---

### **4. Technology Stack**
- **Frontend**:
  - JavaFX (UI framework).
  - WebView (for embedding Leaflet maps).
- **Backend**:
  - Hasura (GraphQL APIs).
  - PostgreSQL (relational database).
  - Auth0 (authentication).
- **Map Service**:
  - Leaflet (JavaScript library for maps).
  - GeoJSON (format for map data).

---

### **5. API Design**
Hasura automatically generates GraphQL APIs for CRUD operations on PostgreSQL tables. Below are the key queries and mutations:

#### **Authentication**
- `mutation login`: Authenticate a user and return a JWT token.
- `mutation logout`: Log out a user.

#### **Data Management**
- `query cecs`: Get a list of civil status centers.
- `mutation insert_cec`: Add a new civil status center.
- `mutation update_cec`: Update a civil status center.
- `mutation delete_cec`: Delete a civil status center.
- `query administrative_units`: Get a list of administrative units.
- `mutation insert_administrative_unit`: Add a new administrative unit.
- `mutation update_administrative_unit`: Update an administrative unit.
- `mutation delete_administrative_unit`: Delete an administrative unit.

#### **Thematic Maps**
- `query map_data`: Get data for rendering maps (e.g., regions, CEC locations).
- `query filtered_map_data`: Filter map data (e.g., by region or year).

#### **Statistics and Reporting**
- `query statistics`: Get statistical data (e.g., number of birth certificates issued).
- `query reports`: Generate and export reports.

---

### **6. Database Schema**
#### **Tables**
1. **users**:
   - `id`: UUID (primary key).
   - `username`: String (unique).
   - `password`: String (hashed).
   - `role`: String (e.g., admin, user).

2. **cecs**:
   - `id`: UUID (primary key).
   - `name`: String.
   - `region`: String.
   - `department`: String.
   - `commune`: String.
   - `location`: Geometry (latitude, longitude).
   - `equipment`: Array of equipment IDs.

3. **administrative_units**:
   - `id`: UUID (primary key).
   - `type`: String (e.g., region, department, commune).
   - `name`: String.
   - `parent_id`: UUID (reference to parent unit).

4. **equipment**:
   - `id`: UUID (primary key).
   - `name`: String.
   - `quantity`: Integer.
   - `functional`: Integer.

5. **variables**:
   - `id`: UUID (primary key).
   - `name`: String.
   - `code`: String.
   - `description`: String.

---

### **7. Deployment**
- **Frontend**: Package the JavaFX application as an executable JAR or native installer.
- **Backend**:
  - Deploy Hasura and PostgreSQL using Docker on-premises.
  - Use Docker Compose to manage the containers.
- **Map Service**: Serve Leaflet maps via the JavaFX WebView.

#### **Docker Compose Configuration**
```yaml
version: '3.6'
services:
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_USER: hasura
      POSTGRES_PASSWORD: hasura
      POSTGRES_DB: civilio
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  hasura:
    image: hasura/graphql-engine:latest
    ports:
      - "8080:8080"
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgres://hasura:hasura@postgres:5432/civilio
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_ADMIN_SECRET: myadminsecret
      HASURA_GRAPHQL_JWT_SECRET: '{"type":"HS256","key":"your_jwt_secret_key"}'
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

### **8. Future Enhancements**
- **Real-Time Updates**: Use Hasura subscriptions for real-time updates to maps and statistics.
- **Mobile Support**: Develop a mobile version of the application using JavaFX on mobile platforms.
- **Advanced Analytics**: Integrate machine learning for predictive analytics (e.g., forecast birth rates).

---

### **9. Benefits of Using Hasura and PostgreSQL**
- **Instant APIs**: Hasura automatically generates GraphQL APIs for PostgreSQL, reducing development time.
- **Real-Time Capabilities**: Hasura subscriptions enable real-time updates to the frontend.
- **Scalability**: PostgreSQL and Hasura are designed to handle high traffic and large datasets.
- **Security**: Hasura integrates with authentication services and supports role-based access control.
- **On-Premises Deployment**: Docker allows for easy deployment and management of the backend on-premises.
