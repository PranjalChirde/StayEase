# Wanderlust 

A full-stack web application that allows users to create, view, edit, and delete travel listings, inspired by Airbnb. 

## Features
- **CRUD Functionality**: Full Create, Read, Update, and Delete capabilities for travel listings.
- **Responsive Design**: Built with Bootstrap to ensure the interface looks great on mobile, tablet, and desktop devices.
- **RESTful Routing**: Follows REST architectural conventions for scalable and maintainable routing.
- **Data Modeling**: Utilizes MongoDB and Mongoose for structured data storage and validation.

## Tech Stack
- **Frontend**: HTML5, CSS3, EJS (Embedded JavaScript templating), Bootstrap 5
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-link>
   cd airbnb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the local database**
   Ensure MongoDB is running locally on your machine (`mongodb://127.0.0.1:27017`).

4. **Initialize sample data (optional)**
   If you want to populate the database with sample listings:
   ```bash
   node init/index.js
   ```

5. **Start the application**
   ```bash
   node app.js
   ```
   The application will be running on `http://localhost:8080/`.

## Screenshots
*(Add screenshots of your application here once you upload it to GitHub!)*

---
*Created as part of a Full Stack Web Development project.*
