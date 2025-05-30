# QuickDine - QR-based Restaurant Ordering System

QuickDine is a modern, QR-based restaurant ordering system that allows customers to view menus, place orders, and make payments directly from their smartphones. The system also provides restaurant owners with a comprehensive admin dashboard to manage their menu and orders.

## Features

### Customer Features
- 📱 QR code-based menu access
- 🍽️ Digital menu browsing by categories
- 🛒 Real-time cart management
- 💳 Secure payment processing with Stripe
- 📊 Live order status updates
- 💰 Split bill functionality
- 🌙 Light/dark mode support

### Restaurant Admin Features
- 📊 Analytics dashboard
- 📝 Menu management (add, edit, delete items)
- 🎨 QR code generation for tables
- 📦 Order management system
- 💳 Transaction history
- ⚙️ Restaurant settings

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Payment Processing**: Stripe
- **Authentication**: AWS Cognito (coming soon)
- **Backend**: AWS Amplify (coming soon)
- **Database**: DynamoDB (coming soon)

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quickdine.git
   cd quickdine
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
quickdine/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── menu/           # Customer menu pages
│   │   └── checkout/       # Checkout flow pages
│   ├── components/         # Reusable components
│   │   ├── admin/         # Admin-specific components
│   │   ├── menu/          # Menu-specific components
│   │   └── ui/            # Shared UI components
│   ├── store/             # Zustand stores
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Stripe](https://stripe.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)
