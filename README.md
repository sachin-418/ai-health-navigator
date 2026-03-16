# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

<<<<<<< HEAD
=======
## MongoDB setup

The auth flow now uses a local Express API with MongoDB.

1. Ensure MongoDB is running locally or update `MONGODB_URI` in `.env`.
2. Copy [.env.example](.env.example) to `.env` and set `MONGODB_URI`, `JWT_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.
3. Install dependencies with `npm i`.
4. Run both frontend and backend together with `npm run dev:full`.

Implementation notes:

- Patient signup stores `name`, `phone`, `age`, `occupation`, and `location` in MongoDB.
- Patient signup sends a 6-digit OTP with Twilio, stores the OTP in MongoDB for 5 minutes, verifies the OTP, and then creates the account.
- Doctor signup also sends and verifies a 6-digit OTP before account creation.
- Patient and doctor phone inputs use a fixed `+91` prefix in the UI and accept a 10-digit Indian mobile number.
- Patient login uses the same `name` and verified `phone` combination used at signup.
- Doctor signup and login use `phone` and `password` (hashed with bcrypt).
- Doctor replies are rendered in a patient-friendly card with clear line breaks and follow-up appointment details.
- Frontend auth session uses a JWT token stored in browser local storage.

>>>>>>> a0dc8d9 (initial)
## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
