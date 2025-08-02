
# AssetGuardian - Advanced Facilities Maintenance System

A comprehensive facility management system built with modern web technologies, designed to streamline maintenance operations, equipment tracking, project management, and predictive maintenance with AI-powered capabilities. Features secure multi-tenant architecture with role-based access control and robust data protection.

## 🚀 Key Features

### Equipment Management
- **Smart Equipment Tracking**: Manage various types of HVAC equipment with detailed specifications
- **Real-time Status Monitoring**: Track equipment status (Operational, Needs Attention, Under Maintenance, Non-operational)
- **QR Code Integration**: Generate QR codes for equipment identification and quick mobile access
- **Equipment History**: Comprehensive maintenance records and equipment lifecycle tracking
- **Location-based Organization**: Equipment mapping and location tracking
- **Password Protection**: Enhanced security for sensitive equipment management areas
- **Print Capabilities**: Generate equipment lists and documentation for offline reference

### Predictive Maintenance (AI-Powered)
- **AI Equipment Health Monitoring**: Real-time analysis of equipment condition and performance
- **Sensor Data Collection**: Automated collection and analysis of equipment sensor readings
- **Predictive Analytics**: AI-powered failure prediction with confidence scoring
- **Health Matrix Visualization**: Color-coded equipment health overview dashboard
- **Maintenance Windows**: Optimal maintenance timing recommendations
- **Alert System**: Automated alerts for equipment requiring attention
- **Timeline Predictions**: Forecast equipment failure timelines and maintenance needs
- **Performance Trends**: Track equipment efficiency and performance degradation

### AI Image Reading & Analysis
- **Photo-based Readings**: Extract sensor readings directly from equipment photos using AI
- **OpenAI Integration**: ChatGPT-4o powered image analysis for accurate data extraction
- **Confidence Scoring**: AI provides confidence levels for extracted readings
- **Multiple Reading Detection**: Identify and extract multiple readings from single images
- **Manual Override**: Option to manually adjust AI-extracted readings
- **Image Documentation**: Store equipment photos with extracted data for reference

### Offline Support & Sync
- **Complete Offline Functionality**: Work without internet connection using IndexedDB storage
- **Automatic Synchronization**: Seamless data sync when connection is restored
- **Offline Indicator**: Real-time connection status and sync progress display
- **Cached Equipment Data**: Access equipment information while offline
- **Unsynced Data Management**: Track and manage data pending synchronization
- **Conflict Resolution**: Handle data conflicts during sync operations

### Maintenance Management
- **Digital Checklists**: Comprehensive maintenance forms for different equipment types
- **Multi-Mode Data Entry**: Standard forms, manual readings, or AI image extraction
- **Maintenance Scheduling**: Calendar integration and scheduled maintenance tracking
- **Equipment-Specific Workflows**: Tailored maintenance procedures for different equipment types
- **Reading Templates**: Pre-configured reading types and units for different equipment
- **Maintenance History**: Complete maintenance record tracking and analysis
- **Document Repository**: Store maintenance manuals, photos, and reference documents

### Filter Changes Tracking
- **Filter Lifecycle Management**: Track filter installation, condition, and replacement schedules
- **Status Monitoring**: Active, completed, and overdue filter change tracking
- **Equipment Integration**: Link filter changes to specific equipment units
- **Dashboard Overview**: Quick view of all filter change statuses and upcoming changes
- **Automated Notifications**: Alerts for upcoming and overdue filter changes

### Enhanced Settings Management System
- **Tabbed Settings Interface**: Modern, organized settings with mobile-optimized navigation
- **Location Management**: Comprehensive location setup with authentication integration
- **Company Management**: Multi-tenant company setup and user management
- **Features Overview**: Detailed feature documentation with guided setup
- **Access Request Management**: Admin tools for managing user access requests
- **User Metrics & Analytics**: Track user engagement and system performance
- **Audit Trail**: Complete activity logging and system audit capabilities
- **Mobile-Responsive**: Touch-optimized settings interface for all devices

### Company & Multi-Tenant Support
- **Multi-Company Architecture**: Support for multiple companies with data isolation
- **Company Selector**: Easy switching between different company environments
- **Enhanced User Management**: Role-based access with admin/technician hierarchies
- **Data Segregation**: Secure separation of data between different companies
- **Company-Specific Settings**: Customizable configurations per company
- **Access Request Workflow**: Streamlined user onboarding and approval process

### Project Management
- **Comprehensive Project Lifecycle**: Manage projects from inception to completion with detailed tracking
- **Priority-Based Organization**: High, Medium, Low priority classification with visual indicators
- **Real-time Status Management**: Instant status updates with confirmation and error handling
- **Secure Delete Operations**: Database-level delete functions with permission checks and audit logging
- **Timeline Visualization**: Project timelines with start and end dates for better planning
- **Task Assignment**: Assign projects to specific technicians or teams with workload balancing
- **Progress Monitoring**: Track project completion and performance metrics with analytics
- **Audit Trail**: Complete logging of all project operations including creation, updates, and deletions
- **Permission-Based Access**: Role-specific project management with company-level data isolation
- **Loading States**: Real-time feedback during operations to prevent duplicate actions
- **Error Handling**: Comprehensive error messages with specific guidance for different failure scenarios

### Technician Management & Role-Based Access Control
- **Enhanced Role-Based System**: Two-tier system with Admin and Technician roles plus access request workflow
- **Secure Role Assignment**: Database-level functions for safe role management with audit trails
- **Dynamic Role Updates**: Change user roles with comprehensive tracking and approval workflows
- **Permission-Based Access**: Role-specific UI and functionality access with consistent authentication
- **Access Request Management**: Streamlined user registration and admin approval system
- **Availability Tracking**: Real-time technician availability and scheduling
- **Skill Management**: Track technician specializations and certifications
- **Performance Analytics**: Monitor technician performance and productivity
- **Work Order Assignment**: Intelligent task assignment based on skills and availability
- **Contact Management**: Comprehensive technician contact information
- **Workload Balancing**: Distribute work evenly across available technicians
- **Multi-Company Role Isolation**: Roles are scoped to specific companies for security
- **Authentication Consistency**: Unified authentication system across all components

### Advanced Analytics & Reporting
- **Equipment Health Matrix**: Visual representation of equipment condition across facilities
- **Maintenance Trends**: Historical analysis of maintenance activities and patterns
- **Location Breakdown**: Equipment distribution and performance by location
- **Technician Performance**: Individual and team performance metrics
- **Predictive Insights**: AI-driven insights for maintenance optimization
- **Custom Date Ranges**: Flexible reporting periods for detailed analysis
- **Export Capabilities**: Data export for external reporting and analysis

### Dashboard & Real-time Monitoring
- **Real-time Statistics**: Live KPIs showing equipment count, active projects, and pending tasks
- **Activity Feed**: Recent activities across all system components
- **Equipment Overview**: Quick status updates and equipment health summaries
- **Enhanced Mobile Design**: Touch-optimized interface with improved navigation
- **Mobile-Optimized Tab Navigation**: 2-row grid layout for predictive maintenance tabs ensuring all options are visible and accessible
- **Quick Actions**: Fast access to frequently used functions with mobile shortcuts
- **Status Indicators**: Visual indicators for system health and connectivity
- **Settings Integration**: Quick access to comprehensive settings management
- **User Metrics Dashboard**: Real-time user engagement and performance analytics

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive, utility-first styling
- **shadcn/ui** for consistent, accessible UI components
- **React Hook Form** with Zod validation for robust form handling
- **TanStack Query** for efficient data fetching and state management
- **Recharts** for data visualization and analytics

### Backend & Database
- **Supabase** for backend services, authentication, and real-time database
- **PostgreSQL** with Row Level Security (RLS) for secure data access
- **Edge Functions** for serverless API endpoints and AI integration
- **Real-time Subscriptions** for live data updates

### AI & Machine Learning
- **OpenAI API** integration for image analysis and reading extraction
- **ChatGPT-4o** for advanced image processing capabilities
- **Custom AI Models** for predictive maintenance analytics
- **Confidence Scoring** for AI-generated insights

### Mobile & Offline
- **Capacitor** for native mobile app deployment
- **IndexedDB** for offline data storage and synchronization
- **Service Workers** for offline functionality
- **Progressive Web App (PWA)** capabilities

### Additional Integrations
- **QR Code Generation** for equipment identification
- **Camera Integration** for mobile photo capture
- **Email Notifications** via Resend.com
- **Print Optimization** for report generation

## 📱 Mobile & PWA Features

- **Native Mobile Apps**: Deploy as iOS and Android apps using Capacitor
- **Offline-First Architecture**: Full functionality without internet connection
- **Camera Integration**: Take photos directly within the app for AI analysis
- **Touch-Optimized Interface**: Mobile-first design with touch-friendly controls
- **Push Notifications**: Real-time alerts for maintenance and equipment issues
- **Responsive Design**: Seamless experience across all device sizes

## 🔒 Security Features

- **Advanced Row Level Security (RLS)**: Database-level security for multi-tenant data protection with comprehensive policies
- **Secure Database Functions**: All critical operations use `SECURITY DEFINER` functions with proper permission checks
- **Role-Based Access Control**: Admin and Technician roles with granular permission levels and company-scoped access
- **Secure Delete Operations**: Database-level delete functions with permission verification and audit logging
- **Company Data Isolation**: Complete separation of data between companies with role scoping and access validation
- **Real-time Permission Checks**: Dynamic permission validation for all CRUD operations
- **Comprehensive Audit Trails**: Track all user actions, role changes, data modifications, and delete operations
- **Permission-Based UI**: Interface adapts based on user role and permissions with consistent authentication
- **API Key Management**: Secure storage and management of third-party API keys in Edge Function secrets
- **Authentication & Authorization**: Supabase Auth for secure user management with JWT-based authentication
- **Error Handling Security**: Detailed error messages for admins while maintaining security for unauthorized users
- **Database Integrity**: Row count verification and transaction rollback for failed operations
- **User Context Validation**: Continuous validation of user authentication and company membership
- **Secure State Management**: Client-side state updates only after successful database operations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account for backend services
- OpenAI API key for AI features (optional)

### Installation

1. **Clone and Install**
   ```bash
   git clone [repository-url]
   cd macs-facilities-maintenance
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials and API keys
   ```

3. **Database Setup**
   - Create a new Supabase project
   - Run the provided SQL migrations
   - Configure Row Level Security policies

4. **Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Open http://localhost:5173
   - Complete the setup wizard for initial configuration

### Mobile App Deployment

1. **Install Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npx cap add ios # or android
   npx cap sync
   npx cap run ios # or android
   ```

## 📊 Database Schema

### Core Tables
- `equipment` - Equipment inventory and specifications
- `hvac_maintenance_checks` - Maintenance records and checklists
- `projects` - Project management and tracking
- `technicians` - Technician information and availability
- `locations` - Facility locations and organization
- `companies` - Multi-tenant company management

### Predictive Maintenance
- `sensor_readings` - Equipment sensor data collection
- `equipment_thresholds` - Alert thresholds and monitoring rules
- `predictive_alerts` - AI-generated maintenance alerts
- `automated_work_orders` - System-generated work orders

### Role Management & Security
- `company_users` - User-company relationships and role assignments with secure access control
- `technicians` - Enhanced with `user_role` column for role tracking and permission management
- `update_technician_role()` - Secure function for role assignment with audit logging
- `get_technicians_with_roles()` - Function to retrieve users with role information
- `delete_project()` - Secure project deletion with permission checks and audit logging
- `delete_equipment()` - Secure equipment deletion with permission checks and audit logging
- `is_member_of()` - Function to verify user membership in companies
- `can_access_all_data()` - Super admin permission checking function

### Additional Features
- `filter_changes` - Filter maintenance tracking with automated status calculations
- `maintenance_documents` - Document storage and management with company-level access control
- `audit_logs` - Complete audit trail for all system activities including CRUD operations
- `user_activities` - User engagement tracking and performance analytics
- `performance_metrics` - System performance monitoring and optimization data

## 🔧 Configuration

### Required Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Edge Function Secrets
- `OPENAI_API_KEY` - For AI image analysis features
- `RESEND_API_KEY` - For email notifications (optional)

### Feature Flags
- Enable/disable predictive maintenance features
- Configure AI integration settings
- Customize company-specific features

## 📖 Documentation

Comprehensive guides available in the application:

- **Equipment Management Guide** - Complete equipment lifecycle management
- **Predictive Maintenance Guide** - AI-powered maintenance optimization
- **Maintenance Procedures** - Step-by-step maintenance workflows
- **Project Management Best Practices** - Efficient project execution
- **Technician Management** - Team coordination and scheduling
- **Offline Functionality** - Working without internet connection
- **AI Image Reading** - Extracting data from equipment photos
- **Company Setup** - Multi-tenant configuration

## 🚀 Deployment Options

### Lovable Platform (Recommended)
- One-click deployment through Lovable dashboard
- Automatic CI/CD pipeline
- Custom domain support with paid plans
- Integrated monitoring and analytics

### Manual Deployment
- **Netlify**: Connect GitHub repository for automatic deployments
- **Vercel**: Deploy with zero configuration
- **AWS Amplify**: Full-stack deployment with backend integration
- **Traditional Hosting**: Build and deploy static files

### Mobile App Stores
- **iOS App Store**: Deploy using Xcode and Apple Developer Account
- **Google Play Store**: Deploy using Android Studio and Play Console
- **Enterprise Distribution**: Internal app distribution for organizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation for API changes
- Follow semantic versioning

## 📋 API Documentation

### Supabase Integration
- **Real-time subscriptions** for live data updates across all components
- **Row Level Security** for multi-tenant data protection with comprehensive policies
- **Secure Database Functions** for all critical operations with proper permission validation
- **Edge Functions** for custom business logic and AI integration
- **File storage** for documents and images with role-based access control

### Database Functions (RPCs)
- `get_projects_data()` - Retrieve projects with company-level filtering
- `delete_project(project_id)` - Secure project deletion with permission checks
- `delete_equipment(equipment_id)` - Secure equipment deletion with permission checks
- `get_equipment_data()` - Retrieve equipment with filtering and search capabilities
- `get_current_user_company()` - Get user's company information and role
- `is_member_of(company_id)` - Verify user membership in specific company
- `log_audit_event()` - Record audit events for all significant operations

### AI Integration Endpoints
- `/functions/v1/predictive-ai-analysis` - Equipment health analysis with confidence scoring
- `/functions/v1/extract-readings-from-image` - AI image reading extraction using OpenAI

## 🔍 Troubleshooting

### Common Issues
- **Delete Operations Failing**: Verify user has proper permissions and is authenticated
- **Offline Storage Issues**: Clear browser storage and refresh application
- **AI Integration Problems**: Verify OpenAI API key configuration in Edge Function secrets
- **Mobile App Build Errors**: Ensure Capacitor dependencies are properly installed
- **Database Connection**: Check Supabase credentials and network connection
- **Permission Denied Errors**: Verify user role assignments and company membership
- **RLS Policy Issues**: Check Row Level Security policies for proper access configuration

### Performance Optimization
- **Database Queries**: Use proper indexing and company-level filtering for optimal performance
- **Real-time Updates**: Implement efficient state management to minimize unnecessary re-renders
- **Image Handling**: Use image compression for equipment photos and implement lazy loading
- **Audit Logging**: Implement efficient audit log rotation and archival strategies
- **Loading States**: Provide immediate feedback to users during long-running operations
- **Error Boundaries**: Implement React error boundaries for graceful error handling
- **Memory Management**: Optimize state management to prevent memory leaks in long-running sessions

## 📞 Support & Resources

### Documentation Links
- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Community Support
- [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- [GitHub Issues](repository-url/issues)
- Project documentation within the application

### Professional Support
- Enterprise support available through Lovable platform
- Custom development and integration services
- Training and onboarding assistance
- Priority technical support

## 📄 License

This project is proprietary software. All rights reserved.

---

**Project URL**: https://www.assetguardian.ai

**Built with ❤️ using [Lovable](https://lovable.dev) - The AI-powered web development platform**
