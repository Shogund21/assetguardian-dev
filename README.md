
# ASSETGUARDIAN.AI 

A comprehensive facility management system built with modern web technologies, designed to streamline maintenance operations and equipment tracking.

## Features

### Equipment Management
- Track and manage various types of HVAC equipment with detailed information
- Real-time equipment status monitoring (Operational, Needs Attention, Under Maintenance, Non-operational)
- Detailed equipment history and maintenance records
- Equipment location tracking and mapping
- QR code generation for equipment identification and quick access
- Password-protected equipment management for enhanced security
- Equipment printing capabilities for documentation

### Maintenance Checks
- Scheduled maintenance tracking and calendar integration
- Digital maintenance checklists for different equipment types
- Real-time maintenance reporting and status updates
- AHU-specific maintenance workflows with detailed parameter tracking
- Comprehensive reading and measurement logging
- Document repository for maintenance manuals and reference materials
- Maintenance history visualization and tracking

### Project Management
- Project status tracking with customizable statuses
- Task assignment and monitoring
- Priority-based project organization (High, Medium, Low)
- Project timeline visualization with start and end dates
- Project description editor for detailed documentation
- Project filtering and quick status updates
- Printable project lists for offline reference

### Technician Management
- Technician availability tracking and scheduling
- Skill and certification management
- Work order assignment and performance tracking
- Contact information management
- Specialization tracking for optimal task assignment

## Dashboard
- Real-time statistics showing equipment count, active projects, pending tasks, and available technicians
- Recent activities feed showing latest project and maintenance updates
- Equipment overview with quick status updates
- Responsive design for all device sizes
- Quick access to frequently used actions

## Analytics
- Equipment status distribution charts
- Maintenance completion rate tracking
- Technician performance metrics
- Location-based analytics for equipment distribution
- Maintenance trends visualization
- Data export capabilities for reporting

## Documentation
- Comprehensive in-app documentation
- Equipment management guides
- Maintenance check procedures
- Project management best practices
- Technician management guidelines

## Print Features
- Equipment list printing
- Project summary printing
- Maintenance schedule printing
- QR code printing for equipment identification

## Settings
- User interface customization
- Location management for organizing equipment and projects
- Notification preferences
- System configuration options
- Administrator password protection for sensitive areas

## Project Info

**URL**: https://lovable.dev/projects/504bf57f-2335-4e76-894e-5b151c1fbbad

## Technologies Used

This project leverages modern web technologies:

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Backend & Database**: Supabase
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts
- **QR Code Generation**: qrcode.react

## Documentation

For detailed information about specific features, please refer to our documentation:

- [Equipment Management Guide](./docs/equipment-management.md)
- [Maintenance Checks Guide](./docs/maintenance-checks.md)
- [Project Management Guide](./docs/project-management.md)
- [Technician Management Guide](./docs/technician-management.md)

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your Supabase credentials
4. Start development server:
   ```bash
   npm run dev
   ```
5. Access the application at `http://localhost:5173`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Deployment

The application can be deployed through:
- The Lovable platform (recommended)
- Manual deployment to services like Netlify or Vercel

For more information about deployment options, visit our [documentation](https://docs.lovable.dev/).

## Support

For support and questions:
- Visit our [documentation](https://docs.lovable.dev/)
- Create an issue in the repository
- Contact the maintenance team

## License

This project is proprietary software. All rights reserved.

