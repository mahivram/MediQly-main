Team no. 42 
# Video Link:https://drive.google.com/file/d/15kcPOeDxEzRbGJSjcjr_BJdUvQfv4A8o/view?usp=sharing ||
# 200% volume Video Link : https://drive.google.com/file/d/1ZycIV1H56IWPhptZdB-xuub2HLHiwdow/view?usp=sharing

#members :-
#team leader : ayush chavda,
#yash tiwari ,
#mehiv Ram
## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Health Tracker**: Monitor vital health metrics like blood pressure, heart rate, and more.
- **Doctor Consultations**: Book video consultations with healthcare professionals.
- **Symptom Checker**: Use AI to check symptoms and get health insights.
- **Medicine Tracker**: Manage medications and set reminders.
- **Diet & Nutrition**: Get personalized diet plans and track nutrition.
- **Emergency Services**: Quick access to emergency contacts and services.
- **AI Doctor**: Get instant medical advice from an AI-powered assistant.
- **Insurance Management**: Manage health insurance policies and claims.

## Installation

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/doctoraid-interface.git
   cd doctoraid-interface
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the `server` directory with the following variables:

   ```plaintext
   MONGOOSE_URI=your_mongodb_uri
   SECRET_TOKEN=your_secret_token
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   This will start both the client and server using `concurrently`.

## Usage

- **Access the application**: Open your browser and navigate to `http://localhost:3000`.
- **Explore features**: Use the navigation menu to explore different features like health tracking, consultations, and more.
- **Take a tour**: A guided tour is available for first-time users to familiarize themselves with the platform.

## API Endpoints

### User Routes

- `POST /users/register`: Register a new user.
- `POST /users/login`: User login.
- `GET /users/profile`: Get user profile (requires authentication).

### Doctor Routes

- `POST /doctors/register`: Register a new doctor.
- `POST /doctors/login`: Doctor login.
- `GET /doctors/profile`: Get doctor profile (requires authentication).

### Fitness Routes

- `POST /api/google-fitness`: Proxy to Google Fitness API.
- `GET /api/google-fitness`: Fetch fitness data.

### AI Routes

- `POST /api/ai/process-command`: Process voice commands using AI.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Real-time Communication**: Socket.io
- **AI Integration**: Groq SDK

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
