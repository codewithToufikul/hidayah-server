# Hidayah Server

**Hidayah Server** is a RESTful API backend built with **Node.js**, **Express**, **TypeScript**, and **MongoDB** that provides AI-powered Islamic guidance through personalized Quranic verse recommendations based on user emotions.

## 🌟 Features

### 🤖 AI-Powered Quranic Recommendations

- **Emotion-Based Verse Selection**: Uses AI (Meta Llama 3.1) to recommend relevant Quranic verses based on user's emotional state
- **Multi-Language Support**: Provides verses in Arabic, English, and Bengali translations
- **Smart Parsing**: Intelligent JSON parsing with fallback mechanisms for AI responses

### 👤 User Management

- **User Registration**: Secure user account creation
- **Authentication**: JWT-based authentication with 7-day token expiration
- **User Profiles**: Protected profile endpoints with token verification

### 📚 Dua History

- **Personal History Tracking**: Stores user's dua request history for logged-in users
- **Guest Access**: Allows non-authenticated users to get duas without saving history
- **Chronological Sorting**: Returns history sorted by most recent first

### 🔐 Security & Middleware

- **JWT Verification**: Secure token-based authentication
- **Optional Authentication**: Flexible middleware for endpoints that work with or without authentication
- **CORS Configuration**: Configured for specific frontend origin with credentials support

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT)
- **AI Integration**: Hugging Face API (Meta Llama 3.1)
- **External APIs**: Al-Quran Cloud API for verse retrieval
- **Development**: ts-node-dev for hot reloading

## 📁 Project Structure

```
hidayah-server/
├── src/
│   ├── app/
│   │   ├── controllers/
│   │   │   ├── user.controller.ts      # User authentication & profile endpoints
│   │   │   └── dua.controller.ts       # Dua generation & history endpoints
│   │   ├── models/
│   │   │   ├── user.model.ts           # User schema
│   │   │   ├── duaHistory.model.ts     # Dua history schema
│   │   │   └── input.model.ts          # Input schema (legacy)
│   │   └── middleware/
│   │       ├── verifytoken.ts          # Required JWT verification
│   │       └── optionalVerifyToken.ts  # Optional JWT verification
│   ├── app.ts                          # Express app configuration
│   └── server.ts                       # Server initialization & DB connection
├── dist/                               # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── .env                                # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** database (local or cloud instance)
- **Hugging Face API Key** for AI integration

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/codewithToufikul/hidayah-server.git
   cd hidayah-server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   DB_USER=your_mongodb_username
   DB_PASS=your_mongodb_password
   JWT_SECRET=your_jwt_secret_key
   HF_API_KEY=your_huggingface_api_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:10000`

## 📡 API Endpoints

### User Routes (`/users`)

#### Create User

```http
POST /users/create-user
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User Created Successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login

```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Get Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

**Response:**

```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Dua Routes (`/dua`)

#### Get Dua Recommendation

```http
POST /dua/get-dua
Content-Type: application/json
Authorization: Bearer <token> (optional)

{
  "emotion": "anxious"
}
```

**Response:**

```json
{
  "success": true,
  "dua": {
    "surah_name": "Al-Baqarah",
    "ayah_number": "286",
    "arabic": "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا...",
    "translation": "Allah does not burden a soul beyond that it can bear...",
    "bnTranslation": "আল্লাহ কাউকে তার সাধ্যের বাইরে দায়িত্ব দেন না...",
    "short_explanation": "এই আয়াতে আল্লাহ মানুষকে সান্ত্বনা দেন ও সঠিক পথে উৎসাহ দেন।"
  }
}
```

#### Get Dua History

```http
GET /dua/dua-history
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "history": [
    {
      "_id": "...",
      "userId": "...",
      "emotion": "anxious",
      "surah_name": "Al-Baqarah",
      "ayah_number": 286,
      "arabic": "...",
      "translation": "...",
      "createdAt": "2024-01-19T10:30:00.000Z"
    }
  ]
}
```

## 🔧 Configuration

### MongoDB Connection

The server connects to MongoDB using the connection string format:

```
mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.ivo4yuq.mongodb.net/hidayahDB?retryWrites=true&w=majority&appName=Cluster0
```

### CORS Configuration

Currently configured to accept requests from:

- `https://hidayah-client.vercel.app`

To modify allowed origins, update the CORS configuration in `src/app.ts`:

```typescript
app.use(
  cors({
    origin: "your-frontend-url",
    credentials: true,
  }),
);
```

### Port Configuration

Default port: `10000`

To change the port, modify the `PORT` constant in `src/server.ts`.

## 🧪 Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests (not yet configured)

### TypeScript Configuration

The project uses strict TypeScript configuration with:

- Target: ES2016
- Module: CommonJS
- Strict mode enabled
- Output directory: `./dist/`

## 🔒 Security Considerations

> [!WARNING]
> **Important Security Notes**

1. **Password Storage**: Currently passwords are stored in plain text. **This is insecure and should be replaced with bcrypt hashing before production deployment.**

   ```typescript
   // TODO: Implement password hashing
   import bcrypt from "bcrypt";
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Environment Variables**: Never commit `.env` file to version control
3. **JWT Secret**: Use a strong, randomly generated secret key
4. **CORS**: Restrict origins to trusted domains only

## 🌐 Deployment

### Environment Variables Required

Ensure the following environment variables are set in your deployment platform:

- `DB_USER` - MongoDB username
- `DB_PASS` - MongoDB password
- `JWT_SECRET` - Secret key for JWT signing
- `HF_API_KEY` - Hugging Face API key

### Build for Production

```bash
npm install
npm run build  # If build script is configured
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Tofikul Islam**

- GitHub: [@codewithToufikul](https://github.com/codewithToufikul)

## 🙏 Acknowledgments

- **Al-Quran Cloud API** for providing Quranic verse data
- **Hugging Face** for AI model hosting
- **Meta** for the Llama 3.1 model
- All contributors and users of this project

## 📞 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Made with ❤️ for the Muslim community**
