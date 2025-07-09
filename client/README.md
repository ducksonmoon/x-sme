# X-SME Booking Widget

A modern, embeddable booking and payment widget designed specifically for Iranian SMEs (beauty salons, clinics, language institutes). Built with React, TypeScript, and Tailwind CSS.

## Features

- 🌍 **Bilingual Support**: Persian (RTL) and English (LTR)
- 🎨 **Customizable**: Theme, colors, and styling options
- 💳 **Payment Integration**: Ready for Iranian payment gateways (Pasargad, Saman, Zarinpal)
- 📱 **Responsive**: Works on all devices
- 🔒 **Secure**: JWT authentication and secure iframe communication
- ⚡ **Fast**: Optimized for performance with React Query and lazy loading

## Quick Start

### 1. Embed with HTML Attributes

```html
<div id="booking-widget" 
     data-booking-widget 
     data-business-id="your-business-id"
     data-theme="light"
     data-language="fa"
     data-primary-color="#3b82f6">
</div>

<script src="https://your-domain.com/widget.js"></script>
```

### 2. Embed with JavaScript

```html
<div id="booking-widget"></div>

<script src="https://your-domain.com/widget.js"></script>
<script>
  const widget = createBookingWidget({
    businessId: 'your-business-id',
    theme: 'light',
    language: 'fa',
    primaryColor: '#3b82f6',
    borderRadius: 8,
    showLogo: true,
    showBusinessInfo: true,
    allowNotes: true,
    requireEmail: false,
    maxAdvanceBooking: 30,
    minAdvanceBooking: 2
  });
  
  widget.init('#booking-widget');
</script>
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `businessId` | string | ✅ | - | Unique identifier for your business |
| `theme` | 'light' \| 'dark' | ❌ | 'light' | Widget theme |
| `language` | 'fa' \| 'en' | ❌ | 'fa' | Widget language |
| `primaryColor` | string | ❌ | '#3b82f6' | Primary color for the widget |
| `borderRadius` | number | ❌ | 8 | Border radius in pixels |
| `showLogo` | boolean | ❌ | true | Show business logo |
| `showBusinessInfo` | boolean | ❌ | true | Show business information |
| `allowNotes` | boolean | ❌ | true | Allow customers to add notes |
| `requireEmail` | boolean | ❌ | false | Require email field |
| `maxAdvanceBooking` | number | ❌ | 30 | Maximum days in advance for booking |
| `minAdvanceBooking` | number | ❌ | 2 | Minimum hours in advance for booking |

## Event Handling

Listen for widget events to integrate with your website:

```javascript
// Booking created
element.addEventListener('bookingWidget:bookingCreated', (event) => {
  console.log('Booking created:', event.detail);
  // Handle booking creation
});

// Payment completed
element.addEventListener('bookingWidget:paymentCompleted', (event) => {
  console.log('Payment completed:', event.detail);
  // Handle payment completion
});

// Widget error
element.addEventListener('bookingWidget:widgetError', (event) => {
  console.error('Widget error:', event.detail);
  // Handle widget errors
});
```

## API Integration

The widget integrates with the X-SME backend API:

### Endpoints Used

- `GET /api/businesses/{businessId}` - Get business information
- `GET /api/businesses/{businessId}/services` - Get available services
- `GET /api/availability/{businessId}/{serviceId}` - Get available time slots
- `POST /api/bookings` - Create a new booking
- `POST /api/payments/process` - Process payment
- `GET /api/payments/{paymentId}/status` - Get payment status

### Authentication

The widget uses JWT tokens for authentication. Tokens are automatically managed and refreshed as needed.

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd client
npm install
```

### Development Server

```bash
npm run dev
```

The development server will start on `http://localhost:3000`

### Building

```bash
# Build for production
npm run build

# Build widget script only
npm run build:widget
```

The build will create:
- `dist/` - Main application bundle
- `dist/widget.js` - Embeddable widget script

### Widget Demo

Visit `http://localhost:3000/widget-demo` to see the widget in action.

## Project Structure

```
src/
├── components/
│   ├── BookingWidget.tsx      # Main widget component
│   ├── LoadingSpinner.tsx     # Loading indicator
│   ├── ErrorFallback.tsx      # Error boundary
│   └── ui/                    # Reusable UI components
├── hooks/
│   └── useBooking.ts          # Booking logic hook
├── providers/
│   ├── AuthProvider.tsx       # Authentication context
│   ├── ThemeProvider.tsx      # Theme management
│   └── LanguageProvider.tsx   # Localization
├── services/
│   └── api.ts                 # API client
├── store/
│   ├── authStore.ts           # Auth state
│   ├── themeStore.ts          # Theme state
│   └── languageStore.ts       # Language state
├── types/
│   └── index.ts               # TypeScript definitions
├── constants/
│   └── index.ts               # App constants
├── pages/
│   ├── Widget.tsx             # Widget iframe page
│   └── WidgetDemo.tsx         # Demo page
└── widget.ts                  # Embeddable script
```

## Styling

The widget uses Tailwind CSS with custom CSS variables for theming:

```css
:root {
  --primary-color: #3b82f6;
  --border-radius: 8px;
}
```

### Custom CSS Classes

- `.card` - Card container with shadow and border
- `.btn` - Button styles with variants
- `.input` - Form input styles
- `.form-label` - Form label styles
- `.form-error` - Error message styles

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security

- Cross-origin iframe communication with origin validation
- JWT token management with automatic refresh
- Input validation and sanitization
- XSS protection through React's built-in escaping

## Performance

- Lazy loading of components and routes
- React Query for efficient data fetching and caching
- Optimized bundle size with code splitting
- Image optimization and compression

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Email: support@x-sme.com
- Documentation: https://docs.x-sme.com
- Issues: https://github.com/x-sme/widget/issues 