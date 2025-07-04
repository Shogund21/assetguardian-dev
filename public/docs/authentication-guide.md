# Authentication & User Management Guide

## Overview
Asset Guardian uses a comprehensive authentication system with role-based access control, multi-company support, and streamlined user onboarding processes.

## Authentication System Features

### Core Authentication
- **Secure Login/Logout**: Email and password-based authentication
- **Session Management**: Persistent sessions with automatic token refresh
- **Multi-Device Support**: Login from multiple devices simultaneously
- **Password Security**: Secure password requirements and storage

### Role-Based Access Control
- **Two-Tier System**: Admin and Technician roles with specific permissions
- **Company-Scoped Roles**: User roles are specific to each company
- **Permission Inheritance**: Hierarchical permission system
- **Dynamic Role Updates**: Ability to change user roles with audit trails

### Access Request System
- **Self-Service Registration**: Users can request access independently
- **Admin Approval Workflow**: Streamlined approval process for administrators
- **Automatic Technician Creation**: Approved users become technicians automatically
- **Request Tracking**: Complete history of all access requests

## User Roles and Permissions

### Admin Role
**Full System Access Including:**
- All equipment and maintenance management
- User and company management
- Settings and configuration access
- Access request approval and management
- Audit log and analytics access
- System administration functions

### Technician Role
**Operational Access Including:**
- Equipment viewing and basic management
- Maintenance check creation and updates
- Project viewing and updates
- Personal data management
- Limited settings access

### Super Admin (System Level)
**Platform-Wide Access Including:**
- All admin capabilities across all companies
- System-wide configuration
- Advanced troubleshooting and support
- Platform maintenance and updates

## Getting Started

### For New Users (Requesting Access)

1. **Visit the Application**
   - Navigate to the Asset Guardian login page
   - Click "Request Access" or similar registration link

2. **Complete Access Request Form**
   - **First Name**: Your given name
   - **Last Name**: Your family name
   - **Email**: Your business email address
   - **Phone**: Your contact number (optional)
   - **Company**: The company you work for
   - **Reason**: Brief explanation of why you need access

3. **Submit Request**
   - Click "Submit Request"
   - You'll receive confirmation that your request was submitted
   - Wait for admin approval (typically 1-2 business days)

4. **Access Approval**
   - Once approved, you'll receive login credentials
   - You'll be automatically created as a technician in the system
   - Log in using your email and the provided password

### For Administrators (Managing Access Requests)

1. **Access Admin Settings**
   - Log in as an administrator
   - Navigate to Settings > Access Requests tab

2. **Review Pending Requests**
   - View all pending access requests
   - Review user information and reason for access
   - Verify user credentials and company affiliation

3. **Process Requests**
   - **Approve**: Creates technician record and grants access
   - **Deny**: Rejects the request with optional feedback
   - All decisions are logged in the audit trail

4. **Manage Approved Users**
   - View and manage technician records
   - Update user roles and permissions as needed
   - Monitor user activity and engagement

## Company Management

### Multi-Company Setup
Asset Guardian supports multiple companies with complete data isolation.

#### Creating Companies
1. **Navigate to Settings > Companies**
2. **Click "Add Company"**
3. **Enter Company Details:**
   - Company name
   - Contact email
   - Phone number
   - Address information
4. **Save Company**

#### Managing Company Users
1. **Company Association**: Users are linked to specific companies
2. **Role Assignment**: Roles are company-specific
3. **Data Access**: Users only see data for their assigned companies
4. **Permission Inheritance**: Company admins can manage company users

### User Assignment Process
1. **Access Request**: User submits request with company information
2. **Admin Review**: Company admin or super admin reviews request
3. **Approval**: User is created and assigned to specified company
4. **Role Assignment**: User receives appropriate role for their company

## Authentication Best Practices

### For Users
- **Strong Passwords**: Use complex passwords with mix of characters
- **Secure Logout**: Always log out when finished, especially on shared devices
- **Regular Access**: Log in regularly to maintain account activity
- **Report Issues**: Immediately report any access issues or suspicious activity

### For Administrators
- **Timely Reviews**: Process access requests promptly (within 24-48 hours)
- **Verification**: Verify user credentials before granting access
- **Role Assignment**: Assign minimum necessary permissions
- **Regular Audits**: Review user access and roles quarterly
- **Activity Monitoring**: Monitor user activity for security purposes

### For Companies
- **Access Policies**: Establish clear access request and approval policies
- **Role Definitions**: Define clear role responsibilities and permissions
- **Regular Reviews**: Conduct regular access reviews and updates
- **Security Training**: Train users on security best practices

## Security Features

### Data Protection
- **Encryption**: All authentication data is encrypted in transit and at rest
- **Session Security**: Secure session management with automatic expiration
- **Password Protection**: Passwords are hashed and salted for security
- **Audit Trails**: All authentication events are logged and traceable

### Access Control
- **Role-Based Permissions**: Fine-grained permission control based on roles
- **Company Isolation**: Complete data separation between companies
- **Multi-Factor Options**: Support for additional security measures
- **Failed Login Protection**: Account lockout after failed login attempts

### Compliance
- **Audit Logging**: Complete audit trail for compliance requirements
- **Data Retention**: Configurable data retention policies
- **Access Reports**: Generate access and usage reports for compliance
- **Security Monitoring**: Continuous monitoring for security events

## Troubleshooting

### Common Authentication Issues

#### "You must be logged in" Messages
- **Cause**: Session expired or authentication inconsistency
- **Solution**: 
  1. Log out completely
  2. Clear browser cache and cookies
  3. Log back in with credentials
- **Prevention**: The system now uses consistent authentication across all components

#### Cannot Access Certain Features
- **Cause**: Insufficient permissions for user role
- **Solution**: Contact administrator to review role permissions
- **Verification**: Check user role in Settings > Technician Management

#### Access Request Not Processed
- **Cause**: Admin approval required or request incomplete
- **Solution**: 
  1. Contact company administrator
  2. Verify all required fields were completed
  3. Check email for approval notifications

#### Forgot Password
- **Cause**: User cannot remember login credentials
- **Solution**: 
  1. Contact system administrator for password reset
  2. Verify identity through alternative means
  3. Use temporary password to regain access

### Getting Help

#### For Users
- **System Administrator**: Contact your company's system administrator
- **Help Documentation**: Access built-in help through the application
- **Support Tickets**: Submit support requests through proper channels

#### For Administrators
- **Technical Support**: Access technical support resources
- **Admin Documentation**: Refer to comprehensive admin guides
- **User Training**: Provide user training and onboarding resources

## Advanced Features

### Integration Options
- **Single Sign-On (SSO)**: Configure SSO with existing systems
- **LDAP Integration**: Connect with directory services
- **API Access**: Programmatic access for integrated systems
- **Webhook Support**: Real-time notifications for authentication events

### Reporting and Analytics
- **User Activity Reports**: Track user login and usage patterns
- **Access Request Analytics**: Monitor request trends and approval rates
- **Security Reports**: Generate security and compliance reports
- **Performance Metrics**: Monitor authentication system performance

### Custom Configurations
- **Company-Specific Settings**: Tailor authentication settings per company
- **Role Customization**: Create custom roles with specific permissions
- **Approval Workflows**: Configure custom approval processes
- **Integration Settings**: Configure external system integrations

## Conclusion

The authentication and user management system in Asset Guardian provides secure, scalable access control with streamlined user onboarding. Regular maintenance of user accounts, roles, and permissions ensures optimal security and user experience. For additional support or advanced configuration, consult with your system administrator or technical support team.