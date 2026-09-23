import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Award,
    BookOpen,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock,
    Cloud,
    Globe,
    GraduationCap,
    KeyRound,
    Laptop,
    Layers,
    ListChecks,
    MessageCircle,
    Search,
    Server,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Wrench,
} from "lucide-react";
import { UserContext } from "../../../ContextAPI/UserContext";

/* ========================================================================== */
/*  Courses.jsx — ONE file for the whole course experience                    */
/*                                                                            */
/*  Routes (both point to this same component):                               */
/*    <Route path="/courses" element={<Courses />} />                         */
/*    <Route path="/courses/:slug" element={<Courses />} />                   */
/*                                                                            */
/*  • /courses                  → course list with search + category filters  */
/*  • /courses/:slug            → full course page (structure, modules, labs) */
/*  • /courses?search=<name>    → if <name> is an exact course name, jumps    */
/*                                straight to that course's page (this is    */
/*                                what the Pricing cards and navbar send)     */
/* ========================================================================== */

/* ============================ COURSE DATA ============================ */

/* -------------------------------------------------------------------------- */
/*  AVP Tech Group — course catalogue                                          */
/*                                                                             */
/*  CONTENT STATUS                                                             */
/*  • Microsoft Entra ID (Azure AD): curriculum taken from the document you    */
/*    supplied (module numbering made sequential: your document jumps from     */
/*    Module 17 to Module 19).                                                 */
/*  • Microsoft Intune and Microsoft SCCM (MECM): DRAFT curricula written in   */
/*    the same format and depth. Replace with your trainers' syllabi.          */
/*  • All other courses: description + 5-module outline written as drafts.     */
/*  • Durations and prerequisites for every course except Entra ID are         */
/*    estimates: please confirm them.                                          */
/* -------------------------------------------------------------------------- */


/* ----------------------------- helpers ------------------------------------ */

const slugify = (s) =>
    s
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

const norm = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '')

// Module shorthand: topics and hands-on labs are written as "a | b | c"
const M = (title, topics, handsOn) => ({
    title,
    topics: topics.split(' | '),
    handsOn: handsOn ? handsOn.split(' | ') : [],
})

/* ---------------------------- categories ---------------------------------- */
// Names and colours match the Pricing section and the navbar menu.

const COURSE_CATEGORIES = [
    { name: 'Endpoint & Device Management', icon: 'Laptop', color: '#3AA6E8' },
    { name: 'Security & Defender', icon: 'ShieldCheck', color: '#14B8A6' },
    { name: 'Azure & Cloud', icon: 'Cloud', color: '#2380CC' },
    { name: 'Microsoft 365', icon: 'Layers', color: '#5CD6F5' },
    { name: 'Identity & Access', icon: 'KeyRound', color: '#6C8CFF' },
    { name: 'Google Workspace', icon: 'Globe', color: '#2DD4BF' },
]

const INCLUDED_WITH_EVERY_COURSE = [
    'Live, instructor-led sessions',
    'Small batches, 8 learners max',
    'Hands-on labs',
    'Course material included',
    'Mock & test questions',
    'Certificate of attendance',
]

const category = (name) => COURSE_CATEGORIES.find((c) => c.name === name)

const C = (categoryName, name, o) => {
    const cat = category(categoryName)
    return {
        slug: slugify(name),
        name,
        category: categoryName,
        icon: o.icon || cat.icon,
        color: cat.color,
        level: 'L1 to L3',
        format: 'Theory + Hands-on Labs',
        ...o,
    }
}

/* ------------------------------ courses ----------------------------------- */

const courses = [
    /* ===================== ENDPOINT & DEVICE MANAGEMENT ===================== */

    C('Endpoint & Device Management', 'Microsoft Intune', {
        icon: 'Smartphone',
        heading: 'Manage and secure every device from the cloud',
        description:
            'A complete, hands-on programme covering Microsoft Intune from tenant setup and enrolment through apps, compliance, endpoint security, updates and troubleshooting, taking you from L1 fundamentals to L3 operations.',
        // !! PLACEHOLDER PRICES (INR): keep in sync with the Pricing section and replace with your real ones
        originalPrice: 24999, // crossed-out price
        price: 16999, // discounted price
        duration: '40–45 Hours',
        prerequisites: [
            'Basic Windows client administration',
            'Microsoft 365 and Microsoft Entra ID fundamentals',
            'Basic networking (DNS, DHCP, TCP/IP)',
        ],
        highlights: [
            'Enrol and manage Windows, iOS, Android and macOS devices',
            'Zero-touch deployment with Windows Autopilot',
            'Compliance, Conditional Access and endpoint security',
            'Apps, updates, remediations and real-world troubleshooting',
        ],
        modules: [
            M('Intune & Modern Device Management Fundamentals',
                'Traditional vs modern management | Microsoft Intune overview and architecture | MDM vs MAM | Intune licensing (Plan 1, Plan 2 and add-ons) | Zero Trust and device management | Microsoft Intune admin center overview',
                'Create a Microsoft 365 trial tenant | Explore the Intune admin center | Assign Intune licenses'),
            M('Tenant Setup & Administration',
                'Roles and RBAC | Scope tags | Groups and dynamic groups | Assignment filters | Company branding and Company Portal | Terms and conditions | Notifications',
                'Create groups and filters | Configure RBAC and scope tags | Customise the Company Portal'),
            M('Windows Enrollment',
                'Automatic MDM enrollment | Microsoft Entra join | Entra registered devices | Hybrid Entra join | Enrollment restrictions | Device categories | Bulk enrollment with provisioning packages',
                'Enrol a Windows device | Configure enrollment restrictions | Verify device in the admin center'),
            M('Windows Autopilot',
                'Autopilot overview | Hardware hash registration | Deployment profiles (user-driven, self-deploying, pre-provisioning) | Enrollment Status Page | Dynamic groups for Autopilot | Autopilot Reset',
                'Register a device | Create a deployment profile | Run a user-driven deployment'),
            M('Apple & Android Enrollment',
                'Apple MDM push certificate | Apple Business Manager and Automated Device Enrollment | iOS/iPadOS BYOD and corporate enrollment | macOS enrollment | Android Enterprise (work profile, fully managed, dedicated) | Managed Google Play',
                'Configure Apple MDM push certificate | Bind Android Enterprise | Enrol a mobile device'),
            M('Device Configuration Profiles',
                'Settings catalog | Templates | Administrative templates | Custom OMA-URI | Device restrictions | Wi-Fi, VPN and email profiles | Certificates (SCEP and PKCS) | Assignment and conflict handling',
                'Create a settings catalog profile | Deploy Wi-Fi and VPN profiles | Resolve a profile conflict'),
            M('Compliance Policies',
                'Compliance for Windows, iOS, Android and macOS | Actions for noncompliance | Notifications | Compliance status and reporting | Defender for Endpoint risk signals',
                'Create compliance policies | Configure noncompliance actions | Review compliance reports'),
            M('Conditional Access with Intune',
                'Device-compliance grant control | Approved apps and app protection grant | Report-only mode | Blocking unmanaged devices | Zero Trust access model',
                'Create a compliance-based policy | Test access from a noncompliant device'),
            M('Application Management',
                'Win32 app packaging (IntuneWinAppUtil) | Microsoft Store apps | Microsoft 365 Apps deployment | Line-of-business apps | Web links | Required, available and uninstall intent | Detection and requirement rules | Dependencies and supersedence',
                'Package and deploy a Win32 app | Deploy Microsoft 365 Apps | Configure supersedence'),
            M('App Protection Policies (MAM)',
                'MAM without enrollment | Data protection settings | Access requirements | Conditional launch | App configuration policies | Selective wipe',
                'Create an app protection policy | Test data-transfer restrictions | Perform selective wipe'),
            M('Windows Update Management',
                'Update rings | Feature update policies | Quality updates and expedite | Driver updates | Windows Autopatch overview | Update reporting',
                'Create update rings | Deploy a feature update policy | Review update reports'),
            M('Endpoint Security',
                'Antivirus policies | Firewall | Disk encryption (BitLocker and FileVault) | Attack surface reduction | Endpoint detection and response | Account protection and Windows LAPS | Security baselines',
                'Deploy antivirus and firewall policies | Enable BitLocker | Apply a security baseline'),
            M('Scripts & Remediations',
                'PowerShell scripts | Shell scripts for macOS | Remediations (detection and remediation scripts) | Script deployment and monitoring | Custom compliance settings',
                'Deploy a PowerShell script | Create a remediation package'),
            M('Device Actions & Remote Management',
                'Sync, restart and remote lock | Wipe, retire and Fresh Start | Autopilot Reset | Lost mode | Remote Help | Bulk device actions',
                'Perform device actions | Use Remote Help | Retire a device'),
            M('Co-management & Migration from SCCM',
                'Co-management architecture | Workload sliders | Cloud attach and tenant attach | Migration planning | Retiring on-premises management',
                'Review co-management settings | Plan a workload migration'),
            M('Monitoring, Reporting & Endpoint Analytics',
                'Endpoint analytics | Startup performance | Audit logs | Device diagnostics and log collection | Reports and alerts',
                'Review endpoint analytics scores | Collect diagnostics from a device'),
            M('Integrations',
                'Microsoft Defender for Endpoint integration | Microsoft Entra ID integration | Mobile threat defense connectors | Microsoft Tunnel overview',
                'Connect Intune to Defender for Endpoint | Review risk-based compliance'),
            M('Security Best Practices & Governance',
                'Zero Trust for devices | Least privilege and scope tags | Break-glass and emergency access | Baseline strategy | Backup and documentation of configuration',
                'Design a role and scope model | Export configuration for backup'),
            M('Troubleshooting',
                'Enrollment failures | Policy conflicts | App deployment failures | Compliance issues | Log analysis (Intune Management Extension logs, Event Viewer) | Common error codes',
                'Troubleshoot a failed enrollment | Analyse app deployment logs | Resolve a policy conflict'),
        ],
    }),

    C('Endpoint & Device Management', 'Microsoft SCCM (MECM)', {
        icon: 'Server',
        heading: 'Deploy, patch and manage devices at enterprise scale',
        description:
            'A complete, hands-on programme covering Microsoft Configuration Manager (SCCM / MECM) from site design and installation to applications, software updates, operating system deployment, compliance, co-management and troubleshooting.',
        // !! PLACEHOLDER PRICES (INR): keep in sync with the Pricing section and replace with your real ones
        originalPrice: 24999, // crossed-out price
        price: 16999, // discounted price
        duration: '45–50 Hours',
        prerequisites: [
            'Windows Server administration',
            'Active Directory Domain Services (AD DS)',
            'SQL Server basics',
            'Basic networking (DNS, DHCP, TCP/IP)',
        ],
        highlights: [
            'Site design, installation and client management',
            'Applications, software updates and content distribution',
            'Operating system deployment with task sequences',
            'Compliance, reporting, co-management and troubleshooting',
        ],
        modules: [
            M('Configuration Manager Fundamentals',
                'What SCCM / MECM is | Current Branch versions and servicing | Site hierarchy and site system roles | Console overview | Co-management with Intune | Lab design',
                'Build the lab (domain controller, SQL, site server) | Explore the console'),
            M('Planning & Prerequisites',
                'Hardware and software requirements | SQL Server configuration | Active Directory schema and System Management container | Windows ADK and WinPE | Network ports and service accounts | Site naming and design',
                'Prepare the server | Install prerequisites | Extend the schema in the lab'),
            M('Installation & Site Configuration',
                'Primary site installation | Site system roles (management point, distribution point, software update point, reporting services point) | Boundaries and boundary groups | Discovery methods | Site settings',
                'Install a primary site | Configure boundaries and boundary groups | Enable discovery methods'),
            M('Client Management',
                'Client installation methods (push, Group Policy, manual, software update-based) | Client settings | Client health and remediation | Client actions | Client troubleshooting',
                'Deploy the client | Create custom client settings | Check client health'),
            M('Collections & Queries',
                'Device and user collections | Direct and query membership rules | Incremental updates | Limiting collections | Maintenance windows | WQL queries',
                'Create collections | Write query rules | Configure maintenance windows'),
            M('Inventory & Asset Management',
                'Hardware inventory and MOF edits | Software inventory | Asset Intelligence | Software metering | Resource Explorer',
                'Extend hardware inventory | Review software inventory reports'),
            M('Content Distribution',
                'Distribution points and groups | Pull distribution points | BranchCache | Content prestaging | Content validation | Boundary group fallback',
                'Add a distribution point | Distribute and validate content'),
            M('Application Management',
                'Applications vs packages | Deployment types | Detection methods and requirements | Dependencies and supersedence | User device affinity | Software Center',
                'Create and deploy an MSI application | Configure detection rules | Test in Software Center'),
            M('Packages, Scripts & Automation',
                'Legacy packages and programs | Run Scripts | PowerShell in Configuration Manager | Application deployment troubleshooting',
                'Run a script on a collection | Deploy a package'),
            M('Software Updates',
                'Software update point and WSUS | Catalog synchronisation | Software update groups | Automatic Deployment Rules | Maintenance windows | Windows servicing and Microsoft 365 Apps updates | Third-party updates',
                'Configure the software update point | Create an ADR | Deploy monthly updates'),
            M('Operating System Deployment (OSD)',
                'Boot images and OS images | Task sequences | Drivers and driver packages | PXE boot | Bare metal, refresh and replace scenarios',
                'Build and capture an image | Create a task sequence | Deploy Windows over PXE'),
            M('Advanced OSD & Windows Servicing',
                'In-place upgrade task sequences | Task sequence variables | Dynamic driver injection | Task sequence media | Servicing plans | OSD troubleshooting',
                'Run an in-place upgrade | Use task sequence variables | Analyse smsts.log'),
            M('Compliance Settings',
                'Configuration items and baselines | Remediation | BitLocker management | Compliance reporting',
                'Create a configuration baseline | Deploy and review compliance'),
            M('Endpoint Protection',
                'Antimalware policies | Windows Firewall policies | Attack surface reduction | Alerts and reporting',
                'Create antimalware policies | Deploy firewall policies'),
            M('Role-Based Administration',
                'Security roles and scopes | Collections as security boundaries | Administrative users | Custom roles',
                'Create a custom security role | Assign scopes and collections'),
            M('Reporting & Monitoring',
                'Reporting services point | Built-in and custom reports | Monitoring workspace | Component and site status | Alerts | Log files',
                'Run built-in reports | Create a custom report | Configure alerts'),
            M('Site Maintenance & Backup',
                'Site maintenance tasks | Backup site server task | Restore and recovery | SQL maintenance | Site health checks',
                'Configure backup | Restore a site in the lab'),
            M('Co-management & Cloud Attach',
                'Cloud management gateway | Tenant attach | Co-management workloads | Migrating workloads to Intune',
                'Enable co-management | Move a workload to Intune'),
            M('Upgrades & Hotfixes',
                'In-console updates | Prerequisite checks | Client upgrades | Hotfixes | Version servicing strategy',
                'Install an in-console update | Upgrade clients'),
            M('Troubleshooting',
                'Log analysis with CMTrace | Client logs (ccmexec, PolicyAgent, execmgr) | Discovery failures | Content distribution issues | Software update scan failures | OSD failures | Common errors',
                'Diagnose a client failure | Fix a content distribution issue | Troubleshoot an OSD failure'),
        ],
    }),

    C('Endpoint & Device Management', 'Windows Autopilot', {
        heading: 'Zero-touch Windows deployment, from box to productive',
        description:
            'Learn to register devices, build deployment profiles and deliver ready-to-work Windows PCs to users without traditional imaging, integrated with Microsoft Intune and Microsoft Entra ID.',
        duration: '12–16 Hours',
        prerequisites: ['Basic Microsoft Intune knowledge', 'Microsoft Entra ID fundamentals'],
        highlights: [
            'User-driven, self-deploying and pre-provisioning modes',
            'Hardware hash registration and dynamic group targeting',
            'Enrollment Status Page with app and policy sequencing',
            'Reset, retire and reuse devices at scale',
        ],
        modules: [
            M('Autopilot Fundamentals', 'What Autopilot is and when to use it | Licensing and requirements | Network and Microsoft Entra ID prerequisites | Deployment scenarios overview'),
            M('Device Registration', 'Hardware hash collection | Registering via CSV, OEM and reseller | Group tags | Autopilot devices in Intune'),
            M('Deployment Profiles', 'User-driven Entra join | Hybrid Entra join | Self-deploying mode | Pre-provisioning (technician flow)'),
            M('Enrollment Status Page & App Delivery', 'ESP settings | Required apps and policies | Blocking until ready | Troubleshooting timeouts'),
            M('Lifecycle & Troubleshooting', 'Autopilot Reset | Retire and re-register | Diagnostics and logs | Common error codes'),
        ],
    }),

    C('Endpoint & Device Management', 'Windows Autopatch', {
        heading: 'Automate Windows and Microsoft 365 Apps updates',
        description:
            'Understand how Windows Autopatch takes over update management with ring-based rollouts, readiness checks and reporting, so devices stay current with far less manual effort.',
        duration: '8–12 Hours',
        prerequisites: ['Microsoft Intune basics', 'Microsoft 365 licensing overview'],
        highlights: [
            'Ring-based update deployment',
            'Readiness checks and device registration',
            'Windows quality, feature and driver updates',
            'Update reports and issue resolution',
        ],
        modules: [
            M('Autopatch Fundamentals', 'What Autopatch manages | Licensing and prerequisites | Autopatch vs Windows Update for Business | Service architecture'),
            M('Onboarding & Device Registration', 'Tenant enrollment | Readiness checks | Registering devices | Device groups and rings'),
            M('Update Management', 'Quality updates | Feature updates | Driver and firmware updates | Microsoft 365 Apps updates'),
            M('Monitoring & Reporting', 'Update status reports | Ring health | Alerts | Support requests'),
            M('Operations & Troubleshooting', 'Pausing and resuming updates | Deregistering devices | Common failures | Best practices'),
        ],
    }),

    C('Endpoint & Device Management', 'Windows Update for Business', {
        heading: 'Control how and when Windows updates reach your devices',
        description:
            'Configure update rings, feature and quality policies and deadlines with Microsoft Intune and Group Policy, and monitor update compliance across your Windows estate.',
        duration: '10–14 Hours',
        prerequisites: ['Windows client administration', 'Basic Microsoft Intune knowledge'],
        highlights: [
            'Update rings, deferrals and deadlines',
            'Feature update policies and version targeting',
            'Driver and expedited update controls',
            'Compliance reporting and troubleshooting',
        ],
        modules: [
            M('Windows Servicing Fundamentals', 'Windows servicing model | Update types | Channels and versions | Windows Update for Business vs WSUS vs Autopatch'),
            M('Update Rings', 'Ring design | Deferrals and deadlines | Active hours and restarts | Pause and rollback'),
            M('Feature & Quality Update Policies', 'Target version | Expedited quality updates | Safeguard holds | Staged rollouts'),
            M('Drivers & Microsoft 365 Apps', 'Driver update management | Microsoft 365 Apps update channels | Delivery Optimization | Bandwidth control'),
            M('Reporting & Troubleshooting', 'Update compliance reports | Windows Update logs | Common error codes | Policy conflict resolution'),
        ],
    }),

    C('Endpoint & Device Management', 'Microsoft Endpoint Analytics', {
        heading: 'Measure and improve the everyday experience on your devices',
        description:
            'Use endpoint analytics to score startup performance, application reliability and work-from-anywhere readiness, then act on recommendations to cut boot times and support tickets.',
        duration: '8–10 Hours',
        prerequisites: ['Microsoft Intune basics', 'Windows client fundamentals'],
        highlights: [
            'Startup performance and boot insights',
            'Application reliability scores',
            'Work-from-anywhere readiness',
            'Remediations for common issues',
        ],
        modules: [
            M('Analytics Fundamentals', 'Endpoint analytics overview | Licensing and prerequisites | Data collection and privacy | Scoring model'),
            M('Enrollment & Data Collection', 'Enrolling Intune-managed devices | Configuration Manager tenant attach | Baselines | Data latency'),
            M('Startup Performance & App Reliability', 'Startup score | Restart frequency | Application crash trends | Reliability recommendations'),
            M('Work From Anywhere & Battery Health', 'Cloud identity and management | Cloud provisioning | Windows readiness | Battery health reporting'),
            M('Remediations & Advanced Analytics', 'Remediation scripts | Detection and remediation packages | Anomaly detection | Reporting to stakeholders'),
        ],
    }),

    C('Endpoint & Device Management', 'Microsoft 365 Endpoint Administrator', {
        heading: 'Deploy, manage and secure Windows devices end to end',
        description:
            'Build the skills of a Microsoft 365 Endpoint Administrator: Windows deployment, Intune management, application delivery and endpoint protection in Microsoft 365 environments.',
        duration: '35–40 Hours',
        prerequisites: ['Windows 10/11 administration', 'Microsoft 365 and Microsoft Entra ID fundamentals', 'Basic networking'],
        highlights: [
            'Windows deployment with Autopilot and images',
            'Device enrollment, configuration and compliance',
            'App deployment and update management',
            'Endpoint protection and monitoring',
        ],
        modules: [
            M('Deploy Windows Client', 'Deployment options | Windows Autopilot | Imaging and provisioning | Upgrades and migrations'),
            M('Manage Identity & Compliance', 'Microsoft Entra device identity | Roles and RBAC | Compliance policies | Conditional Access'),
            M('Manage, Maintain & Protect Devices', 'Configuration profiles | Windows Update management | Endpoint security policies | Remote actions and monitoring'),
            M('Manage Applications', 'Win32, Store and Microsoft 365 Apps | App protection policies | Deployment intents | Reporting'),
            M('Exam Preparation & Labs', 'Case-study labs | Mock questions | Troubleshooting drills | Review of key objectives'),
        ],
    }),

    C('Endpoint & Device Management', 'Microsoft Endpoint Security', {
        heading: 'Protect every endpoint with Intune and Defender',
        description:
            'Deploy antivirus, firewall, attack surface reduction, encryption and EDR policies through Microsoft Intune and Microsoft Defender for Endpoint, and measure your security posture.',
        duration: '14–18 Hours',
        prerequisites: ['Microsoft Intune basics', 'Windows security fundamentals'],
        highlights: [
            'Antivirus, firewall and attack surface reduction policies',
            'BitLocker and FileVault encryption',
            'EDR onboarding and security baselines',
            'Compliance and Conditional Access alignment',
        ],
        modules: [
            M('Endpoint Security Fundamentals', 'Threat landscape | Zero Trust for endpoints | Intune endpoint security node | Policy vs profile'),
            M('Antivirus & Attack Surface Reduction', 'Microsoft Defender Antivirus policies | ASR rules | Exploit protection | Web protection'),
            M('Firewall & Encryption', 'Windows Firewall policies | BitLocker | FileVault | Key recovery'),
            M('EDR & Security Baselines', 'Defender for Endpoint onboarding | EDR policies | Security baselines | Windows LAPS'),
            M('Compliance & Monitoring', 'Device compliance | Conditional Access | Security reports | Incident response basics'),
        ],
    }),

    /* ============================ SECURITY & DEFENDER ======================== */

    C('Security & Defender', 'Microsoft Defender XDR', {
        heading: 'One unified view across endpoints, email, identities and cloud apps',
        description:
            'Learn to investigate and respond to multi-stage attacks in Microsoft Defender XDR, using correlated incidents, advanced hunting with KQL and automated investigation.',
        duration: '24–30 Hours',
        prerequisites: ['Microsoft 365 fundamentals', 'Basic security concepts', 'Familiarity with Microsoft Entra ID'],
        highlights: [
            'Unified incidents and alert correlation',
            'Advanced hunting with KQL',
            'Automated investigation and response',
            'Secure Score and threat analytics',
        ],
        modules: [
            M('XDR Fundamentals', 'XDR concepts | Defender portal tour | Licensing and roles | Component overview'),
            M('Incidents & Alerts', 'Incident queue | Correlation and grouping | Investigation workflow | Response actions'),
            M('Advanced Hunting', 'KQL basics | Hunting tables | Custom detections | Sharing queries'),
            M('Automation & Threat Intelligence', 'Automated investigation | Threat analytics | Secure Score | Reports'),
            M('Operations & Integration', 'Microsoft Sentinel integration | RBAC | SOC tiers and workflow | Best practices'),
        ],
    }),

    C('Security & Defender', 'Microsoft Defender for Endpoint', {
        heading: 'Detect, investigate and respond to threats on every device',
        description:
            'Onboard devices, tune attack surface reduction, hunt threats and respond with EDR and vulnerability management capabilities in Microsoft Defender for Endpoint.',
        duration: '20–24 Hours',
        prerequisites: ['Windows, macOS or Linux administration basics', 'Basic security concepts'],
        highlights: [
            'Onboarding for Windows, macOS, Linux and mobile',
            'EDR investigation and live response',
            'Attack surface reduction and next-generation protection',
            'Vulnerability management',
        ],
        modules: [
            M('Fundamentals & Licensing', 'Defender for Endpoint architecture | Licensing and requirements | Security portal tour | Roles and permissions'),
            M('Onboarding Devices', 'Microsoft Intune | Configuration Manager | Group Policy | Onboarding scripts'),
            M('Threat Protection', 'Next-generation antivirus | ASR rules | Network protection | Web content filtering'),
            M('EDR & Response', 'Alerts and incidents | Device timeline | Live response | Isolation and remediation'),
            M('Vulnerability Management', 'Exposure score | Security recommendations | Remediation tracking | Reporting'),
        ],
    }),

    C('Security & Defender', 'Microsoft Defender for Office 365', {
        heading: 'Stop phishing and email threats before they reach users',
        description:
            'Configure Safe Links, Safe Attachments and anti-phishing protection, investigate email threats and run attack simulations with Microsoft Defender for Office 365.',
        duration: '14–18 Hours',
        prerequisites: ['Exchange Online basics', 'Microsoft 365 administration'],
        highlights: [
            'Safe Links and Safe Attachments',
            'Anti-phishing and impersonation protection',
            'Threat Explorer and automated investigation',
            'Attack simulation training',
        ],
        modules: [
            M('Email Security Fundamentals', 'Email attack types | Exchange Online Protection vs Defender for Office 365 | Plans and licensing | Preset security policies'),
            M('Protection Policies', 'Anti-spam and anti-malware | Anti-phishing | Safe Attachments | Safe Links'),
            M('Investigation', 'Threat Explorer | Real-time detections | Submissions and quarantine | Campaign views'),
            M('Automation & Response', 'Automated investigation and response | Remediation actions | Alerts and incidents | Integration with Defender XDR'),
            M('Awareness & Reporting', 'Attack simulation training | User reporting | Reports and dashboards | Best practices'),
        ],
    }),

    C('Security & Defender', 'Microsoft Defender for Identity', {
        heading: 'Detect identity attacks inside your on-premises Active Directory',
        description:
            'Deploy sensors on domain controllers, understand lateral movement and credential attacks, and investigate identity threats with Microsoft Defender for Identity.',
        duration: '14–18 Hours',
        prerequisites: ['Active Directory Domain Services', 'Basic security concepts'],
        highlights: [
            'Sensor deployment on domain controllers',
            'Detection of reconnaissance and lateral movement',
            'Identity threat investigation and timelines',
            'Integration with Defender XDR',
        ],
        modules: [
            M('Fundamentals & Architecture', 'Identity-based attacks | Defender for Identity architecture | Licensing | Portal overview'),
            M('Deployment', 'Prerequisites | Sensor installation | Directory service accounts | Health issues'),
            M('Attack Detection', 'Reconnaissance | Credential access | Lateral movement | Domain dominance'),
            M('Investigation & Response', 'Alerts and evidence | Entity profiles | Response actions | Identity security posture'),
            M('Integration & Tuning', 'Defender XDR | Alert tuning and exclusions | Hunting | Best practices'),
        ],
    }),

    C('Security & Defender', 'Microsoft Defender for Cloud Apps', {
        heading: 'See and control how cloud apps are used across your organisation',
        description:
            'Discover shadow IT, connect SaaS apps, apply session and access policies and detect risky behaviour with Microsoft Defender for Cloud Apps.',
        duration: '12–16 Hours',
        prerequisites: ['Microsoft Entra ID basics', 'Conditional Access fundamentals'],
        highlights: [
            'Cloud Discovery and shadow IT visibility',
            'App connectors and OAuth app governance',
            'Conditional Access App Control',
            'Anomaly and activity policies',
        ],
        modules: [
            M('CASB Fundamentals', 'Cloud app risks | Defender for Cloud Apps architecture | Licensing | Portal overview'),
            M('Cloud Discovery', 'Log upload and Defender for Endpoint integration | App risk scoring | Sanctioning and unsanctioning | Discovery reports'),
            M('Connecting Apps', 'API connectors | Microsoft 365 | Third-party SaaS apps | App governance'),
            M('Policies & Controls', 'Access policies | Session policies | File policies | Activity and anomaly detection'),
            M('Investigation & Reporting', 'Activity log | Alerts | Incident response | Reports'),
        ],
    }),

    C('Security & Defender', 'Microsoft Defender for Cloud', {
        heading: 'Strengthen security posture and protect workloads across clouds',
        description:
            'Assess posture with Secure Score and recommendations, enable workload protection plans and cover Azure, AWS and GCP resources with Microsoft Defender for Cloud.',
        duration: '14–18 Hours',
        prerequisites: ['Azure fundamentals', 'Basic security concepts'],
        highlights: [
            'Cloud security posture management',
            'Workload protection plans',
            'Multicloud connectors for AWS and GCP',
            'Regulatory compliance dashboards',
        ],
        modules: [
            M('Fundamentals', 'CSPM and CWPP concepts | Defender for Cloud architecture | Plans and pricing | Portal overview'),
            M('Posture Management', 'Secure Score | Recommendations | Security policies | Attack path analysis'),
            M('Workload Protection', 'Servers | Containers | Storage | Databases'),
            M('Multicloud & DevOps', 'AWS connector | GCP connector | DevOps security | Governance rules'),
            M('Alerts & Compliance', 'Security alerts | Regulatory compliance | Workflow automation | Continuous export'),
        ],
    }),

    C('Security & Defender', 'Microsoft Sentinel (SIEM & SOAR)', {
        heading: 'Build a cloud-native security operations capability',
        description:
            'Ingest data, write detections in KQL, investigate incidents and automate response with playbooks in Microsoft Sentinel.',
        duration: '24–30 Hours',
        prerequisites: ['Azure fundamentals', 'Basic security concepts', 'Basic networking'],
        highlights: [
            'Data connectors and log ingestion',
            'Analytics rules and threat detection',
            'Incident investigation and hunting',
            'SOAR automation with playbooks',
        ],
        modules: [
            M('SIEM & SOAR Fundamentals', 'SIEM and SOAR concepts | Sentinel architecture | Licensing and costs | Roles and permissions'),
            M('Workspace & Data Connectors', 'Log Analytics workspace | Data connectors | Data collection rules | Cost management'),
            M('KQL for Security', 'KQL fundamentals | Joins and parsing | Watchlists | Workbooks'),
            M('Detection & Investigation', 'Analytics rules | Incidents | Entity mapping | Hunting and bookmarks'),
            M('Automation & Operations', 'Automation rules | Logic Apps playbooks | Threat intelligence | Content hub and best practices'),
        ],
    }),

    C('Security & Defender', 'Microsoft Purview', {
        heading: 'Protect, govern and manage your data across the organisation',
        description:
            'Classify data with sensitivity labels, prevent data loss, manage retention and run eDiscovery and audit investigations with Microsoft Purview.',
        duration: '18–24 Hours',
        prerequisites: ['Microsoft 365 administration', 'Basic compliance concepts'],
        highlights: [
            'Sensitivity labels and information protection',
            'Data loss prevention policies',
            'Retention, records management and eDiscovery',
            'Insider risk and audit',
        ],
        modules: [
            M('Fundamentals & Compliance Portal', 'Data security and compliance concepts | Purview portal tour | Licensing | Roles and permissions'),
            M('Information Protection', 'Sensitive information types | Sensitivity labels | Auto-labeling | Encryption'),
            M('Data Loss Prevention', 'DLP policies | Endpoint DLP | Policy tips | Alerts'),
            M('Governance & Retention', 'Retention policies and labels | Records management | Data lifecycle | Communication compliance'),
            M('eDiscovery, Audit & Insider Risk', 'eDiscovery cases | Audit logs | Insider risk management | Compliance Manager'),
        ],
    }),

    C('Security & Defender', 'Microsoft Cloud Security', {
        heading: 'Apply Zero Trust across identities, devices, apps and data',
        description:
            "Get a practical overview of Microsoft's cloud security stack, from identity and endpoint protection to threat detection, and learn how the pieces fit together.",
        duration: '16–20 Hours',
        prerequisites: ['Microsoft 365 and Azure fundamentals', 'Basic security concepts'],
        highlights: [
            'Zero Trust principles in practice',
            'Identity, device and app protection',
            'Threat detection and response tooling',
            'Security posture and governance',
        ],
        modules: [
            M('Cloud Security Fundamentals', 'Shared responsibility | Zero Trust | Threat landscape | Microsoft security portfolio'),
            M('Identity & Access Security', 'Conditional Access | MFA and passwordless | Privileged access | Identity Protection'),
            M('Device & App Security', 'Intune and Defender | Cloud app security | Email protection | Application controls'),
            M('Data & Network Security', 'Sensitivity labels and DLP | Network security groups and firewalls | Encryption | Key management'),
            M('Monitoring & Response', 'Defender XDR | Microsoft Sentinel | Secure Score | Incident response basics'),
        ],
    }),

    C('Security & Defender', 'Microsoft 365 Security Administrator', {
        heading: 'Secure and govern Microsoft 365 for your organisation',
        description:
            'Implement identity, threat protection and information protection controls across Microsoft 365 as a security administrator.',
        duration: '35–40 Hours',
        prerequisites: ['Microsoft 365 administration', 'Microsoft Entra ID fundamentals', 'Basic security concepts'],
        highlights: [
            'Identity and access management',
            'Threat protection across Microsoft 365',
            'Information protection and governance',
            'Compliance and security operations',
        ],
        modules: [
            M('Identity & Access', 'Microsoft Entra ID security | MFA and Conditional Access | Identity Protection | Privileged Identity Management'),
            M('Threat Protection', 'Defender for Office 365 | Defender for Endpoint | Defender for Identity | Defender XDR'),
            M('Information Protection', 'Sensitivity labels | Data loss prevention | Retention | Data classification'),
            M('Security Operations', 'Alerts and incidents | Advanced hunting | Secure Score | Reporting'),
            M('Compliance & Practice', 'Compliance Manager | Audit | Scenario labs | Mock questions'),
        ],
    }),

    C('Security & Defender', 'Microsoft 365 Security Deep Dive', {
        heading: 'Advanced protection and hunting across Microsoft 365',
        description:
            'Go beyond the basics with advanced hunting, detection tuning, data protection and incident response across the Microsoft 365 security stack.',
        duration: '24–30 Hours',
        prerequisites: ['Microsoft 365 Security Administrator knowledge', 'KQL basics helpful'],
        highlights: [
            'Advanced hunting and custom detections',
            'Email and collaboration security tuning',
            'Insider risk and data protection',
            'Investigation playbooks',
        ],
        modules: [
            M('Advanced Threat Hunting', 'KQL for hunting | Custom detection rules | Cross-workload queries | Threat intelligence'),
            M('Email & Collaboration Security', 'Policy tuning | Teams and SharePoint protection | Phishing investigations | Attack simulation'),
            M('Endpoint & Identity Response', 'Live response | Identity compromise response | Device isolation | Recovery steps'),
            M('Data Protection & Insider Risk', 'Advanced DLP | Insider risk policies | Sensitivity label strategy | Audit investigations'),
            M('Incident Response Practice', 'End-to-end incident labs | Reporting | Lessons learned | Hardening recommendations'),
        ],
    }),

    C('Security & Defender', 'Microsoft Cloud Security Deep Dive', {
        heading: 'Advanced cloud security architecture and operations',
        description:
            'Deepen your skills in cloud security architecture, posture management, workload protection and detection engineering across Azure and Microsoft 365.',
        duration: '24–30 Hours',
        prerequisites: ['Microsoft Cloud Security knowledge', 'Azure fundamentals'],
        highlights: [
            'Secure cloud architecture patterns',
            'Posture management and workload protection tuning',
            'Detection engineering with Microsoft Sentinel',
            'Cloud incident response',
        ],
        modules: [
            M('Secure Cloud Architecture', 'Landing zones | Network segmentation | Identity boundaries | Governance with Azure Policy'),
            M('Posture & Workload Protection', 'Advanced Defender for Cloud | Attack path analysis | Container and server protection | Multicloud coverage'),
            M('Detection Engineering', 'Custom analytics rules | KQL optimisation | Threat intelligence | Detection testing'),
            M('Data & Key Protection', 'Encryption strategies | Key Vault design | Private connectivity | Data residency considerations'),
            M('Cloud Incident Response', 'Response playbooks | Forensics in the cloud | Containment and recovery | Post-incident review'),
        ],
    }),

    /* ============================== AZURE & CLOUD ============================ */

    C('Azure & Cloud', 'Microsoft Azure Administrator', {
        heading: 'Run and manage Azure infrastructure day to day',
        description:
            'Learn to deploy and manage compute, storage and network resources, govern access and monitor and back up workloads in Microsoft Azure.',
        duration: '35–40 Hours',
        prerequisites: ['Basic networking and virtualization', 'Windows or Linux server basics'],
        highlights: [
            'Virtual machines, storage and networking',
            'Identity, RBAC and Azure Policy',
            'Monitoring and backup',
            'Hands-on Azure labs',
        ],
        modules: [
            M('Azure Fundamentals & Identity', 'Subscriptions and management groups | Microsoft Entra ID basics | RBAC | Azure Policy and resource locks'),
            M('Storage', 'Storage accounts | Blob and Files | Access keys and SAS | Redundancy and lifecycle management'),
            M('Compute', 'Virtual machines | Scale sets and availability | Containers and App Service | ARM and Bicep basics'),
            M('Networking', 'Virtual networks and peering | Network security groups | DNS | Load balancing and VPN'),
            M('Monitoring & Backup', 'Azure Monitor | Alerts | Backup and recovery | Cost management'),
        ],
    }),

    C('Azure & Cloud', 'Microsoft Azure Solutions Architect', {
        heading: 'Design secure, resilient and cost-effective Azure solutions',
        description:
            'Learn to translate business needs into Azure architectures covering identity, data, compute, networking, high availability and migration.',
        duration: '35–40 Hours',
        prerequisites: ['Azure Administrator-level knowledge', 'Networking and security fundamentals'],
        highlights: [
            'Design for identity, governance and monitoring',
            'Storage, compute and network design',
            'High availability and disaster recovery',
            'Migration planning and cost optimisation',
        ],
        modules: [
            M('Governance & Identity Design', 'Management group structure | Identity and access design | Monitoring strategy | Cost governance'),
            M('Data Storage Design', 'Storage account options | Relational and non-relational databases | Data integration | Data protection'),
            M('Business Continuity', 'Backup | Site Recovery | Availability zones | RTO and RPO planning'),
            M('Infrastructure Design', 'Compute options | Networking topologies | Hybrid connectivity | Application architecture'),
            M('Migration & Optimisation', 'Azure Migrate | Assessment and cutover | Cost optimisation | Well-Architected Framework'),
        ],
    }),

    C('Azure & Cloud', 'Microsoft Azure Security', {
        heading: 'Secure identities, networks, data and workloads on Azure',
        description:
            'Implement Azure security controls: identity protection, network defences, encryption and key management, and threat detection with Microsoft Defender for Cloud.',
        duration: '24–30 Hours',
        prerequisites: ['Azure Administrator knowledge', 'Security fundamentals'],
        highlights: [
            'Secure identities with Microsoft Entra ID and PIM',
            'Network security with NSGs and Azure Firewall',
            'Key Vault and data encryption',
            'Defender for Cloud and Microsoft Sentinel',
        ],
        modules: [
            M('Identity Security', 'Microsoft Entra ID security | Conditional Access | Privileged Identity Management | Managed identities'),
            M('Network Security', 'NSGs and ASGs | Azure Firewall | Private endpoints | DDoS protection'),
            M('Compute & Container Security', 'VM hardening | Update management | Container and App Service security | Endpoint protection'),
            M('Data & Key Vault', 'Encryption at rest and in transit | Key Vault | Storage security | Database security'),
            M('Security Operations', 'Defender for Cloud | Microsoft Sentinel | Logging and alerting | Incident handling'),
        ],
    }),

    C('Azure & Cloud', 'Microsoft Azure Networking', {
        heading: 'Design and manage Azure network infrastructure',
        description:
            'Build virtual networks, connect on-premises environments, balance traffic and secure network access across Azure.',
        duration: '24–30 Hours',
        prerequisites: ['TCP/IP, DNS and routing basics', 'Azure fundamentals'],
        highlights: [
            'Virtual networks, subnets and peering',
            'VPN Gateway and ExpressRoute',
            'Load balancing and traffic routing',
            'Firewall, NSGs and private access',
        ],
        modules: [
            M('Virtual Networks', 'VNets and subnets | IP addressing | Peering | Service endpoints and private links'),
            M('Hybrid Connectivity', 'Site-to-site VPN | Point-to-site VPN | ExpressRoute | Virtual WAN'),
            M('Traffic Management', 'Azure Load Balancer | Application Gateway | Front Door | Traffic Manager'),
            M('Network Security', 'NSGs and ASGs | Azure Firewall | DDoS protection | Azure Bastion'),
            M('Name Resolution & Monitoring', 'Azure DNS | Private DNS | Network Watcher | Troubleshooting'),
        ],
    }),

    C('Azure & Cloud', 'Microsoft Azure Virtual Desktop (AVD)', {
        heading: 'Deliver secure cloud desktops and apps to any device',
        description:
            'Plan, deploy and manage Azure Virtual Desktop environments including host pools, images, FSLogix profiles, scaling and monitoring.',
        duration: '24–30 Hours',
        prerequisites: ['Azure Administrator basics', 'Windows client or server administration'],
        highlights: [
            'Host pools, session hosts and app groups',
            'Image management and FSLogix profiles',
            'Networking, identity and security',
            'Autoscaling and monitoring',
        ],
        modules: [
            M('AVD Fundamentals & Planning', 'AVD architecture | Licensing | Sizing and design | Networking and identity prerequisites'),
            M('Deployment', 'Host pools | Workspaces and app groups | Session hosts | Microsoft Entra join options'),
            M('Images & Profiles', 'Custom images | Azure Compute Gallery | FSLogix | Storage for profiles'),
            M('Apps & Security', 'RemoteApp | MSIX app attach | Conditional Access | Network security'),
            M('Scaling & Monitoring', 'Scaling plans | AVD Insights | Cost control | Troubleshooting'),
        ],
    }),

    C('Azure & Cloud', 'Microsoft Azure AVD Deep Dive', {
        heading: 'Advanced design, optimisation and troubleshooting for AVD',
        description:
            'Take Azure Virtual Desktop skills further: architecture at scale, performance tuning, multi-session Windows, security hardening and advanced troubleshooting.',
        duration: '16–20 Hours',
        prerequisites: ['Azure Virtual Desktop course or equivalent experience'],
        highlights: [
            'Large-scale AVD architecture',
            'Performance and user-experience tuning',
            'Hardening and Zero Trust for AVD',
            'Advanced diagnostics',
        ],
        modules: [
            M('Architecture at Scale', 'Multi-region design | Capacity planning | Landing zone integration | Cost modelling'),
            M('Performance & Optimisation', 'Session host sizing | GPU workloads | RDP optimisation | Latency tuning'),
            M('Profiles & Storage Deep Dive', 'FSLogix advanced configuration | Azure Files and NetApp Files | Profile troubleshooting | Cloud cache'),
            M('Security & Compliance', 'Hardening session hosts | Conditional Access and MFA | Screen capture protection | Logging and audit'),
            M('Advanced Troubleshooting', 'Connection failures | Diagnostics and Log Analytics | Agent and health issues | Support escalation'),
        ],
    }),

    /* ================================ MICROSOFT 365 ========================== */

    C('Microsoft 365', 'Microsoft 365 Administration (O365)', {
        heading: 'Administer users, licences, services and security in Microsoft 365',
        description:
            'Master the Microsoft 365 admin center: manage identities, licences, Exchange, Teams and SharePoint services and keep your tenant secure and healthy.',
        duration: '30–35 Hours',
        prerequisites: ['Windows Server and Active Directory basics', 'Basic networking'],
        highlights: [
            'Users, groups, licences and admin roles',
            'Exchange, Teams and SharePoint administration',
            'Tenant security with MFA and Conditional Access',
            'Monitoring, reporting and support',
        ],
        modules: [
            M('Tenant Setup & Domains', 'Tenant creation | Custom domains | Admin roles | Service health'),
            M('Users, Groups & Licences', 'User management | Groups | Licensing | Hybrid identity overview'),
            M('Core Services', 'Exchange Online | Microsoft Teams | SharePoint and OneDrive | Microsoft 365 Apps deployment'),
            M('Security & Compliance', 'MFA | Conditional Access | Defender basics | Retention and DLP overview'),
            M('Monitoring & Support', 'Usage reports | Message center | Service requests | Troubleshooting'),
        ],
    }),

    C('Microsoft 365', 'Microsoft Exchange Online', {
        heading: 'Manage mail flow, mailboxes and email protection',
        description:
            'Administer mailboxes, mail flow, protection and hybrid coexistence in Exchange Online, including migrations and PowerShell management.',
        duration: '24–30 Hours',
        prerequisites: ['Basic email and DNS knowledge', 'Microsoft 365 administration basics'],
        highlights: [
            'Mailboxes, groups and shared resources',
            'Mail flow, connectors and transport rules',
            'Anti-spam and anti-phishing protection',
            'Migration and hybrid coexistence',
        ],
        modules: [
            M('Fundamentals & Recipients', 'Exchange Online architecture | Mailbox types | Groups and contacts | Shared and resource mailboxes'),
            M('Mail Flow', 'MX and DNS records | Connectors | Transport rules | Message trace'),
            M('Protection & Compliance', 'Exchange Online Protection | Anti-phishing | Retention and holds | eDiscovery basics'),
            M('Migrations & Hybrid', 'Cutover, staged and IMAP migrations | Hybrid Configuration Wizard | Coexistence | Decommissioning on-premises'),
            M('PowerShell & Troubleshooting', 'Exchange Online PowerShell | Bulk operations | Delivery issues | Mailbox recovery'),
        ],
    }),

    C('Microsoft 365', 'Microsoft Teams Administration', {
        heading: 'Configure, secure and support Teams across your organisation',
        description:
            'Manage teams, meetings, calling and policies, control external access and monitor quality in Microsoft Teams.',
        duration: '18–24 Hours',
        prerequisites: ['Microsoft 365 administration basics'],
        highlights: [
            'Teams and channels governance',
            'Meeting, messaging and calling policies',
            'External and guest access',
            'Call quality monitoring',
        ],
        modules: [
            M('Teams Architecture & Admin Center', 'Teams architecture | Admin center tour | Licensing | Roles'),
            M('Teams & Channels Management', 'Creating and managing teams | Channel types | Templates | Lifecycle and expiration'),
            M('Meetings & Messaging', 'Meeting policies | Messaging policies | Live events and webinars | Apps and permissions'),
            M('Voice & Calling', 'Phone System overview | Calling Plans and Direct Routing | Call queues and auto attendants | Emergency calling'),
            M('Governance, Security & Monitoring', 'External and guest access | Data protection | Call quality dashboard | Troubleshooting'),
        ],
    }),

    C('Microsoft 365', 'SharePoint Online Administration', {
        heading: 'Build and govern secure collaboration sites',
        description:
            'Administer SharePoint Online sites, hubs, permissions, sharing and governance, and plan content migration.',
        duration: '18–24 Hours',
        prerequisites: ['Microsoft 365 administration basics'],
        highlights: [
            'Site architecture and hubs',
            'Permissions and external sharing',
            'Governance and lifecycle',
            'Migration and search',
        ],
        modules: [
            M('SharePoint Fundamentals', 'SharePoint Online architecture | Admin center tour | Site types | Licensing'),
            M('Sites & Hubs', 'Team and communication sites | Hub sites | Navigation | Site templates'),
            M('Permissions & Sharing', 'Permission model | Groups and inheritance | External sharing | Conditional Access for SharePoint'),
            M('Content & Governance', 'Libraries and metadata | Content types | Retention and sensitivity labels | Site lifecycle'),
            M('Migration & Troubleshooting', 'SharePoint Migration Tool | Migration planning | Search administration | PowerShell (PnP)'),
        ],
    }),

    C('Microsoft 365', 'OneDrive for Business', {
        heading: 'Deploy, secure and support OneDrive across your users',
        description:
            'Configure OneDrive storage, sync and sharing policies, deploy Known Folder Move and protect files with recovery and retention.',
        duration: '10–14 Hours',
        prerequisites: ['Microsoft 365 administration basics'],
        highlights: [
            'Sync client deployment and policies',
            'Known Folder Move',
            'Sharing and external access controls',
            'File recovery and retention',
        ],
        modules: [
            M('OneDrive Fundamentals', 'OneDrive architecture | Storage and quotas | Admin center | Licensing'),
            M('Sync Client & Known Folder Move', 'Sync client deployment | Group Policy and Intune settings | Known Folder Move | Files On-Demand'),
            M('Sharing & Security', 'Sharing settings | External access | Conditional Access | Sensitivity labels'),
            M('Recovery & Retention', 'Recycle bin | Files Restore | Retention policies | Departed user data'),
            M('Monitoring & Troubleshooting', 'Sync health reports | Usage reports | Common sync errors | Support tools'),
        ],
    }),

    /* =============================== IDENTITY & ACCESS ======================= */

    C('Identity & Access', 'Microsoft Entra ID (Azure AD)', {
        heading: 'Master identity and access administration with Microsoft Entra ID',
        description:
            'The complete Microsoft Entra ID (Azure AD) administration curriculum from L1 to L3: tenant and user management, authentication, Conditional Access, hybrid identity, application management, Identity Protection, PIM, governance and troubleshooting.',
        duration: '30–40 Hours',
        prerequisites: [
            'Basic Windows Server Administration',
            'Active Directory Domain Services (AD DS)',
            'Microsoft 365 Fundamentals',
            'Basic Networking (DNS, DHCP, TCP/IP)',
        ],
        highlights: [
            'Tenant, user, group and device identity administration',
            'MFA, passwordless, SSPR and Conditional Access',
            'Hybrid identity, application management and SSO',
            'Identity Protection, PIM and identity governance',
        ],
        modules: [
            M('Identity & Microsoft Entra Fundamentals',
                'Identity & Access Management (IAM) | Authentication vs Authorization | Active Directory vs Microsoft Entra ID | Microsoft Entra Product Family | Microsoft 365 Identity Architecture | Zero Trust Security | Identity Types | Tenant Architecture | Microsoft Entra Licensing (Free, P1, P2) | Microsoft Entra Portal Overview',
                'Create Free Azure Tenant | Explore Entra Admin Center | Configure Custom Domain'),
            M('Microsoft Entra Tenant Administration',
                'Tenant Configuration | Custom Domains | Branding | Company Information | Privacy Settings | Regions | Administrative Units | Named Locations | Tenant Restrictions',
                'Add Custom Domain | Configure Company Branding | Configure Tenant Settings'),
            M('User Management',
                'User Creation | Bulk User Import | User Templates | Guest Users (B2B) | External Users | User Properties | Password Policies | License Assignment | Usage Location | Soft Delete | Restore Users',
                'Create Users | Bulk Import CSV | Restore Deleted Users | Assign Licenses'),
            M('Group Management',
                'Security Groups | Microsoft 365 Groups | Mail-enabled Groups | Dynamic Groups | Nested Groups | Group-based Licensing | Group Ownership',
                'Dynamic Device Groups | Dynamic User Groups | Group-based License Assignment'),
            M('Device Identity',
                'Device Registration | Azure AD Join | Hybrid Azure AD Join | Azure AD Registered Devices | Device Trust | Device Cleanup Rules | Device Authentication | Device Compliance Integration',
                'Join Windows Device | Register Personal Device | Hybrid Join Validation'),
            M('Authentication Methods',
                'Password Authentication | Passwordless Authentication | Microsoft Authenticator | FIDO2 Keys | Windows Hello for Business | Passkeys | Temporary Access Pass (TAP) | Certificate Authentication | Smart Lockout',
                'Configure Passwordless Login | Configure Windows Hello | Enable TAP'),
            M('Multi-Factor Authentication (MFA)',
                'Authentication Methods | Legacy MFA | Authentication Strength | Registration Campaign | Trusted Locations | Number Matching | Fraud Alerts',
                'Enable MFA | Configure Authentication Methods | Test MFA'),
            M('Self-Service Password Reset (SSPR)',
                'SSPR Configuration | Password Writeback | Authentication Methods | Combined Registration | Password Protection',
                'Configure SSPR | Password Reset Testing'),
            M('Conditional Access',
                'Zero Trust | Named Locations | Device Filters | Grant Controls | Session Controls | Risk-based Policies | Authentication Context | Report-only Mode',
                'MFA Policy | Block Legacy Authentication | Location-based Policy | Device Compliance Policy'),
            M('Role-Based Access Control (RBAC)',
                'Built-in Roles | Custom Roles | Administrative Units | PIM Eligible Roles | Least Privilege',
                'Assign Roles | Create Custom Role | Administrative Unit Demo'),
            M('Hybrid Identity',
                'Microsoft Entra Connect | Cloud Sync | Password Hash Sync | Pass-through Authentication | Federation | Entra Connect Health | Sync Rules | OU Filtering',
                'Install Entra Connect | Configure Sync | Password Writeback | Health Monitoring'),
            M('Application Management',
                'Enterprise Applications | App Registration | Service Principals | OAuth | OpenID Connect | SAML | SCIM Provisioning | Application Proxy | Single Sign-On',
                'Register Application | Configure SSO | Add SaaS Application | Publish On-prem Application'),
            M('Identity Protection (P2)',
                'Risk Detection | User Risk | Sign-in Risk | Risk Policies | Risk Remediation | Password Leak Detection',
                'Review Risk Events | Configure Risk Policies'),
            M('Privileged Identity Management (PIM)',
                'Eligible Assignment | Time-bound Roles | Approval Workflow | Just-In-Time Access | Role Activation | Access Review',
                'Configure PIM | Activate Role | Approval Workflow'),
            M('Identity Governance',
                'Entitlement Management | Access Packages | Access Reviews | Lifecycle Workflows | Guest Lifecycle | Approval Process',
                'Create Access Package | Configure Access Review'),
            M('Monitoring & Reporting',
                'Audit Logs | Sign-in Logs | Provisioning Logs | Workbooks | Log Analytics | Diagnostic Settings'),
            M('Integration with Microsoft Intune',
                'Device Enrollment | Compliance Policies | Conditional Access Integration | Autopilot Integration | Azure AD Join with Intune | Co-management',
                'Enroll Device | Test Conditional Access | Autopilot Demo'),
            M('Security Best Practices',
                'Zero Trust | Least Privilege | Break Glass Accounts | Passwordless Strategy | Secure Score | Identity Secure Score | Emergency Access Accounts | Legacy Authentication Blocking',
                'Configure Break Glass | Secure Score Improvement'),
            M('Troubleshooting',
                'Authentication Issues | Sync Issues | MFA Problems | SSPR Failures | Conditional Access Failures | Device Join Issues | Token Problems | Sign-in Error Codes',
                'Troubleshoot Sync | Analyze Sign-in Logs | Resolve Conditional Access Issues'),
        ],
    }),

    C('Identity & Access', 'Microsoft Identity & Access Admin', {
        heading: 'Design and implement identity and access solutions on Microsoft Entra',
        description:
            'Implement identities, authentication, access management and identity governance with Microsoft Entra, building the skills of an Identity and Access Administrator.',
        duration: '30–35 Hours',
        prerequisites: ['Microsoft Entra ID fundamentals', 'Microsoft 365 basics'],
        highlights: [
            'Identity implementation and hybrid sync',
            'Authentication and Conditional Access',
            'Application access and workload identities',
            'Identity governance with PIM and access reviews',
        ],
        modules: [
            M('Implement Identities', 'Tenant and domains | Users and groups | External identities | Hybrid identity'),
            M('Authentication & Access Management', 'MFA | Passwordless | Conditional Access | Identity Protection'),
            M('Workload & Application Access', 'App registrations | Enterprise applications | Single sign-on | Managed identities'),
            M('Identity Governance', 'Entitlement management | Access reviews | Privileged Identity Management | Lifecycle workflows'),
            M('Monitoring & Practice', 'Logs and workbooks | Troubleshooting | Case labs | Mock questions'),
        ],
    }),

    /* ============================== GOOGLE WORKSPACE ========================= */

    C('Google Workspace', 'Google Workspace Administration', {
        heading: 'Manage users, security and collaboration in Google Workspace',
        description:
            'Administer Google Workspace: users and organisational units, Gmail and Drive settings, security controls and device management.',
        duration: '20–24 Hours',
        prerequisites: ['Basic IT administration', 'DNS and email fundamentals'],
        highlights: [
            'Users, groups and organisational units',
            'Gmail, Drive, Meet and Calendar settings',
            '2-step verification, SSO and admin roles',
            'Device management and data migration',
        ],
        modules: [
            M('Workspace Fundamentals & Setup', 'Editions | Domain verification and DNS | Admin console | Provisioning users'),
            M('Users, Groups & Org Units', 'User lifecycle | Groups and access | Organisational units | Directory sync options'),
            M('Services Configuration', 'Gmail routing and rules | Drive and shared drives | Calendar and Meet | Chat and Spaces'),
            M('Security', '2-step verification | Single sign-on | Admin roles | DLP and context-aware access'),
            M('Devices, Migration & Support', 'Mobile and endpoint management | Data migration | Reporting and audit | Troubleshooting'),
        ],
    }),
]

/* ------------------------------ lookups ----------------------------------- */

const getCourseBySlug = (slug) => courses.find((c) => c.slug === slug)

// Matches a course by its exact name (ignoring case, spacing and punctuation)
const getCourseByName = (name) => {
    const n = norm(name || '')
    return n ? courses.find((c) => norm(c.name) === n) : undefined
}

const getRelatedCourses = (course, count = 3) =>
    courses.filter((c) => c.category === course.category && c.slug !== course.slug).slice(0, count)

const courseHref = (name) => {
    const c = getCourseByName(name)
    return c ? `/courses/${c.slug}` : `/courses?search=${encodeURIComponent(name)}`
}

/* ========================= SHARED UI HELPERS ========================= */

const ICONS = { Laptop, ShieldCheck, Cloud, Layers, KeyRound, Globe, Smartphone, Server };
const pad = (n) => String(n + 1).padStart(2, "0");
const formatINR = (n) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;
const percentOff = (c) => Math.round((1 - c.price / c.originalPrice) * 100);
const FEATURED_INCLUDES = [
    "Live, instructor-led sessions",
    "Small batches, 8 learners max",
    "Course material included",
    "Certificate of attendance",
];

/* ============================ COURSE PAGE ============================ */

const CourseDetail = ({ slug }) => {
    const course = getCourseBySlug(slug);

    const { theme } = useContext(UserContext);
    const isDark = theme === "dark";

    // First module open by default; the learner can open any number of modules
    const [openModules, setOpenModules] = useState(() => new Set([0]));

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
        setOpenModules(new Set([0]));
        document.title = course ? `${course.name} | AVP Tech Group` : "Course not found | AVP Tech Group";
    }, [slug, course]);

    const related = useMemo(() => (course ? getRelatedCourses(course, 3) : []), [course]);

    // Theme tokens (logo palette: navy #0D3F7A, royal #1B57A0, azure #2380CC, sky #3AA6E8, cyan #5CD6F5)
    const accent = isDark ? "#3AA6E8" : "#1B57A0";
    const accentSoft = isDark ? "rgba(58,166,232,0.15)" : "rgba(27,87,160,0.08)";
    const accent2 = isDark ? "#5CD6F5" : "#0D3F7A";
    const accent2Soft = isDark ? "rgba(92,214,245,0.14)" : "rgba(13,63,122,0.08)";
    const headingText = isDark ? "text-white" : "text-slate-900";
    const bodyText = isDark ? "text-slate-300" : "text-slate-600";
    const mutedText = isDark ? "text-slate-400" : "text-slate-500";
    const card = isDark
        ? "border-slate-800 bg-slate-900/40 hover:border-[#2380CC]/50"
        : "border-slate-200 bg-white hover:border-[#1B57A0]/30";
    const primaryBtn = isDark
        ? "bg-[#2380CC] text-white hover:bg-[#1B6FB5]"
        : "bg-[#1B57A0] text-white hover:bg-[#0D3F7A]";

    // ── Fallback for unknown slug ──
    if (!course) {
        return (
            <div
                className={`min-h-screen flex flex-col items-center justify-center px-4 text-center transition-colors duration-300 ${
                    isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"
                }`}
            >
                <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                    style={{ background: accentSoft }}
                >
                    <Sparkles size={28} style={{ color: accent }} />
                </div>
                <h1 className="font-heading text-2xl font-bold mb-2">Course not found</h1>
                <p className={`font-body text-sm max-w-xs mx-auto mb-6 ${mutedText}`}>
                    We couldn't find the course you're looking for.
                </p>
                <Link
                    to="/courses"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-body font-semibold text-sm shadow-md transition-all duration-200 ${primaryBtn}`}
                >
                    <ArrowLeft size={16} /> Browse all courses
                </Link>
            </div>
        );
    }

    const Icon = ICONS[course.icon] || Sparkles;
    const totalLabs = course.modules.reduce((n, m) => n + m.handsOn.length, 0);
    const allOpen = openModules.size === course.modules.length;

    const toggleModule = (i) =>
        setOpenModules((prev) => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i);
            else next.add(i);
            return next;
        });

    const toggleAll = () =>
        setOpenModules(allOpen ? new Set() : new Set(course.modules.map((_, i) => i)));

    const facts = [
        { icon: Clock, label: "Duration", value: course.duration },
        { icon: GraduationCap, label: "Level", value: course.level },
        { icon: Layers, label: "Modules", value: `${course.modules.length} modules` },
        { icon: Wrench, label: "Format", value: course.format },
    ];

    const SectionLabel = ({ children, tone = "primary" }) => {
        const color = tone === "primary" ? accent : accent2;
        const soft = tone === "primary" ? accentSoft : accent2Soft;
        return (
            <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${color}4d, transparent)` }} />
                <span
                    className="font-body text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ color, background: soft }}
                >
                    {children}
                </span>
                <div className="h-px flex-1" style={{ background: `linear-gradient(to left, ${color}4d, transparent)` }} />
            </div>
        );
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"}`}>
            <style>{`
                @keyframes cdUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes cdFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes cdFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                .cd-anim { animation: cdUp 0.6s ease forwards; opacity: 0; }
                .cd-fade { animation: cdFade 0.9s ease forwards; opacity: 0; }
                .cd-float { animation: cdFloat 6s ease-in-out infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .cd-anim, .cd-fade, .cd-float { animation: none; opacity: 1; }
                }
            `}</style>

            {/* ── Hero: Image left / Heading right ── */}
            <div
                className={`relative overflow-hidden pt-16 pb-16 sm:pt-20 sm:pb-24 transition-colors duration-300 ${
                    isDark ? "bg-slate-950 border-b border-slate-900" : "bg-slate-50 border-b border-slate-200"
                }`}
            >
                <div
                    className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full opacity-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle, #2380CC 0%, transparent 70%)" }}
                />
                <div
                    className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full opacity-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle, #5CD6F5 0%, transparent 70%)" }}
                />
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(${isDark ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "#fff" : "#000"} 1px, transparent 1px)`,
                        backgroundSize: "48px 48px",
                    }}
                />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 z-10">
                    {/* breadcrumb */}
                    <nav className={`font-body text-xs sm:text-sm mb-8 flex items-center gap-2 ${mutedText}`} aria-label="Breadcrumb">
                        <Link to="/courses" className="hover:underline" style={{ color: accent }}>
                            Courses
                        </Link>
                        <span>/</span>
                        <span>{course.category}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
                        {/* Left: Image */}
                        <div className="cd-fade order-2 lg:order-1" style={{ animationDelay: "120ms" }}>
                            <div className="relative mx-auto max-w-md lg:max-w-none">
                                <div
                                    className="absolute -inset-4 rounded-[2rem] blur-2xl opacity-40 pointer-events-none"
                                    style={{ background: "linear-gradient(135deg, rgba(35,128,204,0.35) 0%, rgba(92,214,245,0.25) 100%)" }}
                                />
                                <div
                                    className={`relative rounded-[1.75rem] overflow-hidden border shadow-2xl cd-float ${
                                        isDark ? "border-slate-800 bg-slate-900/60" : "border-white bg-white"
                                    }`}
                                    style={{
                                        boxShadow: isDark
                                            ? "0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
                                            : "0 30px 60px -20px rgba(15,23,42,0.18), 0 0 0 1px rgba(15,23,42,0.03)",
                                    }}
                                >
                                    {/* Illustration panel (pure CSS: no image files needed) */}
                                    <div
                                        className="relative w-full aspect-[13/9] overflow-hidden"
                                        role="img"
                                        aria-label={`${course.name} course`}
                                        style={{
                                            backgroundColor: "#050B1C",
                                            backgroundImage:
                                                "radial-gradient(circle at 22% 18%, rgba(35,128,204,0.38), transparent 55%), radial-gradient(circle at 82% 88%, rgba(92,214,245,0.22), transparent 50%), radial-gradient(rgba(120,190,255,0.16) 1.2px, transparent 1.5px)",
                                            backgroundSize: "auto, auto, 26px 26px",
                                        }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="absolute w-[92%] aspect-square rounded-full border border-[#2380CC]/10" />
                                            <div className="absolute w-[68%] aspect-square rounded-full border border-dashed border-[#2380CC]/25" />
                                            <div className="absolute w-[46%] aspect-square rounded-full border border-[#3AA6E8]/35" />
                                            <div
                                                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center"
                                                style={{
                                                    background: "linear-gradient(135deg, #3AA6E8 0%, #0D3F7A 100%)",
                                                    boxShadow: "0 0 60px rgba(58,166,232,0.45)",
                                                }}
                                            >
                                                <Icon size={44} className="text-white" strokeWidth={1.6} />
                                            </div>
                                        </div>
                                        <span className="absolute left-4 top-4 rounded-full border border-[#5CD6F5]/30 bg-[#5CD6F5]/10 px-3 py-1 text-[11px] font-semibold text-[#5CD6F5]">
                                            {course.category}
                                        </span>
                                        <span className="absolute right-4 bottom-4 rounded-full border border-[#3AA6E8]/30 bg-[#3AA6E8]/10 px-3 py-1 text-[11px] font-semibold text-[#9BD4F5]">
                                            {course.level} · {course.duration}
                                        </span>
                                    </div>
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 30%)" }}
                                    />
                                </div>

                                {/* Floating icon badge */}
                                <div
                                    className={`absolute -top-5 -right-5 sm:-top-6 sm:-right-6 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-xl border ${
                                        isDark ? "border-slate-800" : "border-white"
                                    }`}
                                    style={{
                                        background: isDark
                                            ? "linear-gradient(135deg, #2380CC 0%, #1B57A0 100%)"
                                            : "linear-gradient(135deg, #1B57A0 0%, #0D3F7A 100%)",
                                    }}
                                >
                                    <Icon size={30} className="text-white" strokeWidth={1.8} />
                                </div>

                                {/* Floating stat chip */}
                                <div
                                    className={`absolute -bottom-5 -left-5 sm:-bottom-6 sm:-left-6 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 backdrop-blur-md ${
                                        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/95 border-slate-100"
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: accent2Soft }}>
                                        <ListChecks size={16} style={{ color: accent2 }} />
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-heading text-sm font-bold leading-none ${headingText}`}>
                                            {course.modules.length} Modules
                                        </p>
                                        <p className={`font-body text-[11px] mt-1 ${mutedText}`}>{course.duration}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Heading & description */}
                        <div className="order-1 lg:order-2 text-center lg:text-left">
                            <div
                                className="cd-anim inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs sm:text-sm font-body font-semibold shadow-sm"
                                style={{ animationDelay: "60ms", background: accentSoft, color: accent }}
                            >
                                <Icon size={14} /> {course.name}
                            </div>

                            <h1
                                className={`cd-anim font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.1] mb-5 tracking-tight ${headingText}`}
                                style={{ animationDelay: "140ms" }}
                            >
                                {course.heading}
                            </h1>

                            <p
                                className={`cd-anim font-body text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 ${bodyText}`}
                                style={{ animationDelay: "200ms" }}
                            >
                                {course.description}
                            </p>

                            {course.price && (
                                <div
                                    className="cd-anim flex flex-wrap items-end gap-x-4 gap-y-2 justify-center lg:justify-start mb-7"
                                    style={{ animationDelay: "230ms" }}
                                >
                                    <span
                                        className={`font-body text-lg font-semibold line-through decoration-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                                        style={{ textDecorationColor: "#F87171" }}
                                    >
                                        {formatINR(course.originalPrice)}
                                    </span>
                                    <span className={`font-heading text-4xl sm:text-5xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#0D3F7A]"}`}>
                                        {formatINR(course.price)}
                                    </span>
                                    <span
                                        className="mb-1 rounded-full px-3 py-1 text-xs font-extrabold"
                                        style={{ background: "linear-gradient(90deg, #5CD6F5, #2DD4BF)", color: "#062A55" }}
                                    >
                                        {percentOff(course)}% OFF
                                    </span>
                                </div>
                            )}

                            <div
                                className="cd-anim flex flex-col sm:flex-row items-center lg:items-start gap-3 justify-center lg:justify-start"
                                style={{ animationDelay: "260ms" }}
                            >
                                <Link
                                    to="/contact"
                                    className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-body font-semibold text-sm sm:text-base shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${primaryBtn}`}
                                >
                                    Enquire Now <ArrowRight size={16} />
                                </Link>
                                <Link
                                    to="/courses"
                                    className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-body font-semibold text-sm sm:text-base transition-all duration-200 border ${
                                        isDark
                                            ? "border-slate-700 text-slate-200 hover:border-[#2380CC]/60 hover:text-[#3AA6E8]"
                                            : "border-slate-200 text-slate-700 hover:border-[#1B57A0]/40 hover:text-[#1B57A0]"
                                    }`}
                                >
                                    <ArrowLeft size={16} /> All Courses
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick facts ── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-10 relative z-20">
                <div
                    className={`grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border shadow-lg ${
                        isDark ? "bg-slate-800 border-slate-800" : "bg-slate-200 border-slate-200"
                    }`}
                >
                    {facts.map(({ icon: FIcon, label, value }) => (
                        <div key={label} className={`p-4 sm:p-5 ${isDark ? "bg-slate-900" : "bg-white"}`}>
                            <div className="flex items-center gap-2 mb-1.5" style={{ color: accent }}>
                                <FIcon size={15} />
                                <span className="font-body text-[11px] font-semibold uppercase tracking-wider">{label}</span>
                            </div>
                            <p className={`font-heading text-sm sm:text-base font-bold leading-snug ${headingText}`}>{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Body Content ── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
                {/* What you'll learn */}
                <div className="mb-16">
                    <SectionLabel>What You&apos;ll Learn</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {course.highlights.map((item, i) => (
                            <div
                                key={i}
                                className={`cd-anim flex items-start gap-3 p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${card}`}
                                style={{ animationDelay: `${100 + i * 70}ms` }}
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5" style={{ background: accentSoft }}>
                                    <CheckCircle2 size={16} style={{ color: accent }} />
                                </div>
                                <p className={`font-body font-medium text-sm sm:text-base leading-snug pt-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course structure */}
                <div className="mb-16" id="course-structure">
                    <SectionLabel>Course Structure</SectionLabel>

                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                        <p className={`font-body text-sm ${mutedText}`}>
                            {course.modules.length} modules
                            {totalLabs ? ` · ${totalLabs} hands-on labs` : ""} · {course.duration}
                        </p>
                        <button
                            type="button"
                            onClick={toggleAll}
                            className="font-body text-sm font-semibold hover:underline cursor-pointer"
                            style={{ color: accent }}
                        >
                            {allOpen ? "Collapse all" : "Expand all"}
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {course.modules.map((mod, i) => {
                            const isOpen = openModules.has(i);
                            return (
                                <div key={i} className={`rounded-2xl border overflow-hidden transition-colors duration-200 ${card}`}>
                                    <button
                                        type="button"
                                        onClick={() => toggleModule(i)}
                                        aria-expanded={isOpen}
                                        className="w-full flex items-center gap-4 text-left px-4 sm:px-5 py-4 cursor-pointer"
                                    >
                                        <span
                                            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-heading text-sm font-bold"
                                            style={{ background: accentSoft, color: accent }}
                                        >
                                            {pad(i)}
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className={`block font-heading text-sm sm:text-base font-bold leading-snug ${headingText}`}>
                                                {mod.title}
                                            </span>
                                            <span className={`block font-body text-xs mt-0.5 ${mutedText}`}>
                                                {mod.topics.length} topics
                                                {mod.handsOn.length ? ` · ${mod.handsOn.length} hands-on labs` : ""}
                                            </span>
                                        </span>
                                        <ChevronDown
                                            size={18}
                                            className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${mutedText}`}
                                        />
                                    </button>

                                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                                        <div className="overflow-hidden">
                                            <div className="px-4 sm:px-5 pb-5 sm:pl-[4.5rem]">
                                                <p className="font-body text-[11px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: accent }}>
                                                    Topics
                                                </p>
                                                <ul className="flex flex-wrap gap-2 mb-1">
                                                    {mod.topics.map((t) => (
                                                        <li
                                                            key={t}
                                                            className={`font-body text-xs sm:text-[13px] px-3 py-1.5 rounded-full border ${
                                                                isDark ? "border-slate-700 bg-slate-800/50 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-700"
                                                            }`}
                                                        >
                                                            {t}
                                                        </li>
                                                    ))}
                                                </ul>

                                                {mod.handsOn.length > 0 && (
                                                    <div
                                                        className="mt-4 rounded-xl p-4"
                                                        style={{ background: accent2Soft, border: `1px solid ${accent2}33` }}
                                                    >
                                                        <p
                                                            className="font-body text-[11px] font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-1.5"
                                                            style={{ color: accent2 }}
                                                        >
                                                            <Wrench size={13} /> Hands-on
                                                        </p>
                                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                                                            {mod.handsOn.map((lab) => (
                                                                <li key={lab} className={`flex items-start gap-2 font-body text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                                                    <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: accent2 }} />
                                                                    {lab}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Prerequisites + What's included */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    <div className={`rounded-2xl border p-6 sm:p-7 ${isDark ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: accentSoft }}>
                                <BookOpen size={17} style={{ color: accent }} />
                            </div>
                            <h3 className={`font-heading text-lg font-bold ${headingText}`}>Prerequisites</h3>
                        </div>
                        <ul className="flex flex-col gap-2.5">
                            {course.prerequisites.map((p) => (
                                <li key={p} className={`flex items-start gap-2.5 font-body text-sm ${bodyText}`}>
                                    <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" style={{ color: accent }} />
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={`rounded-2xl border p-6 sm:p-7 ${isDark ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: accent2Soft }}>
                                <Award size={17} style={{ color: accent2 }} />
                            </div>
                            <h3 className={`font-heading text-lg font-bold ${headingText}`}>Included With Every Course</h3>
                        </div>
                        <ul className="flex flex-col gap-2.5">
                            {INCLUDED_WITH_EVERY_COURSE.map((p) => (
                                <li key={p} className={`flex items-start gap-2.5 font-body text-sm ${bodyText}`}>
                                    <Sparkles size={15} className="mt-0.5 flex-shrink-0" style={{ color: accent2 }} />
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Related courses */}
                {related.length > 0 && (
                    <div className="mb-16">
                        <SectionLabel tone="secondary">More in {course.category}</SectionLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {related.map((r) => {
                                const RIcon = ICONS[r.icon] || Sparkles;
                                return (
                                    <Link
                                        key={r.slug}
                                        to={`/courses/${r.slug}`}
                                        className={`group rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${card}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: accent2Soft }}>
                                            <RIcon size={18} style={{ color: accent2 }} />
                                        </div>
                                        <h4 className={`font-heading text-sm font-bold leading-snug mb-1 ${headingText}`}>{r.name}</h4>
                                        <p className={`font-body text-xs mb-3 ${mutedText}`}>{r.duration}</p>
                                        <span className="font-body text-sm font-semibold group-hover:underline" style={{ color: accent }}>
                                            View course →
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Bottom CTA Box */}
                <div
                    className="relative overflow-hidden rounded-2xl p-8 sm:p-10 text-center cd-anim"
                    style={{
                        background: isDark
                            ? "linear-gradient(135deg, rgba(35,128,204,0.10) 0%, rgba(92,214,245,0.06) 100%)"
                            : "linear-gradient(135deg, rgba(27,87,160,0.06) 0%, rgba(92,214,245,0.08) 100%)",
                        border: isDark ? "1px solid rgba(92,214,245,0.25)" : "1px solid rgba(27,87,160,0.15)",
                    }}
                >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: accentSoft }}>
                        <MessageCircle size={22} style={{ color: accent }} />
                    </div>
                    <h3 className={`font-heading text-xl sm:text-2xl font-bold mb-2 ${headingText}`}>
                        Ready to get started with {course.name}?
                    </h3>
                    <p className={`font-body text-sm sm:text-base max-w-md mx-auto mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Talk to our team about batch dates, fees and how this course fits your career or your team, with no commitment required.
                    </p>
                    <Link
                        to="/contact"
                        className={`inline-flex items-center gap-2 px-7 py-3 rounded-full font-body font-semibold text-sm sm:text-base shadow-md transition-all duration-200 hover:-translate-y-0.5 ${primaryBtn}`}
                    >
                        Enquire Now <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

/* ============================ COURSE LIST ============================ */

const PAGE_SIZE = 9;

// Featured (priced) course card: same look as the Pricing section
const FeaturedCourseCard = ({ course, isDark }) => {
    const Icon = ICONS[course.icon] || Sparkles;
    const saved = course.originalPrice - course.price;

    return (
        <Link
            to={`/courses/${course.slug}`}
            className="group block h-full rounded-[26px] p-[1.5px] transition-transform duration-300 hover:-translate-y-1"
            style={{ background: "linear-gradient(135deg, #5CD6F5 0%, #2380CC 45%, #14B8A6 100%)" }}
        >
            <article
                className="relative flex h-full flex-col overflow-hidden rounded-[24.5px] p-6 sm:p-7"
                style={{ backgroundColor: isDark ? "#071329" : "#ffffff" }}
            >
                {/* corner glow */}
                <div
                    className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl"
                    style={{ background: "radial-gradient(circle, rgba(58,166,232,0.28), transparent 70%)" }}
                />

                <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                            style={{ background: "linear-gradient(135deg, #3AA6E8, #0D3F7A)" }}
                        >
                            <Icon size={22} />
                        </div>
                        <span
                            className="rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest"
                            style={{
                                color: isDark ? "#5CD6F5" : "#0D3F7A",
                                borderColor: isDark ? "rgba(92,214,245,0.35)" : "rgba(13,63,122,0.25)",
                                backgroundColor: isDark ? "rgba(92,214,245,0.08)" : "rgba(35,128,204,0.07)",
                            }}
                        >
                            Featured
                        </span>
                    </div>
                    <span
                        className="rounded-full px-3 py-1 text-xs font-extrabold"
                        style={{ background: "linear-gradient(90deg, #5CD6F5, #2DD4BF)", color: "#062A55" }}
                    >
                        {percentOff(course)}% OFF
                    </span>
                </div>

                <h2
                    className="relative mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl"
                    style={{ color: isDark ? "#ffffff" : "#0f172a" }}
                >
                    {course.name}
                </h2>
                <p className="relative mt-1 text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#5CD6F5" : "#2380CC" }}>
                    {course.category}
                </p>
                <p className="relative mt-3 text-sm leading-relaxed line-clamp-3" style={{ color: isDark ? "#94a3b8" : "#475569" }}>
                    {course.description}
                </p>

                <div className="relative mt-4 flex flex-wrap gap-2">
                    {[
                        { icon: Clock, text: course.duration },
                        { icon: Layers, text: `${course.modules.length} modules` },
                        { icon: GraduationCap, text: course.level },
                    ].map(({ icon: MIcon, text }) => (
                        <span
                            key={text}
                            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                            style={{
                                color: isDark ? "#cbd5e1" : "#334155",
                                borderColor: isDark ? "rgba(148,163,184,0.25)" : "rgba(15,23,42,0.12)",
                            }}
                        >
                            <MIcon size={11} /> {text}
                        </span>
                    ))}
                </div>

                <ul className="relative mt-5 mb-6 grid gap-2.5 sm:grid-cols-2">
                    {FEATURED_INCLUDES.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-[13px] font-medium" style={{ color: isDark ? "#cbd5e1" : "#334155" }}>
                            <span
                                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                                style={{
                                    backgroundColor: isDark ? "rgba(45,212,191,0.18)" : "#D1F7F3",
                                    color: isDark ? "#2DD4BF" : "#0F8F82",
                                }}
                            >
                                <Check size={10} strokeWidth={3.5} />
                            </span>
                            {item}
                        </li>
                    ))}
                </ul>

                {/* Price: crossed-out price, then the discounted price */}
                <div
                    className="relative mt-auto flex flex-wrap items-end justify-between gap-4 border-t pt-5"
                    style={{ borderColor: isDark ? "rgba(148,163,184,0.18)" : "rgba(15,23,42,0.08)" }}
                >
                    <div>
                        <div className="flex items-baseline gap-3">
                            <span
                                className="text-lg font-semibold line-through decoration-2"
                                style={{ color: isDark ? "#64748b" : "#94a3b8", textDecorationColor: "#F87171" }}
                            >
                                {formatINR(course.originalPrice)}
                            </span>
                            <span
                                className="text-4xl font-extrabold tracking-tight sm:text-[44px]"
                                style={{ color: isDark ? "#ffffff" : "#0D3F7A" }}
                            >
                                {formatINR(course.price)}
                            </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold" style={{ color: isDark ? "#2DD4BF" : "#0F8F82" }}>
                            You save {formatINR(saved)} · per learner
                        </p>
                    </div>

                    <span
                        className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-transform duration-300 group-hover:translate-x-0.5"
                        style={{ background: "linear-gradient(90deg, #5CD6F5 0%, #3AA6E8 100%)", color: "#062A55" }}
                    >
                        View Course Details <ArrowRight size={16} />
                    </span>
                </div>
            </article>
        </Link>
    );
};

const CourseList = () => {
    const { theme } = useContext(UserContext);
    const isDark = theme === "dark";
    const [params, setParams] = useSearchParams();
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const search = params.get("search") || "";
    const category = params.get("category") || "All";

    // Typing in the search box also updates the URL. We must not treat that as
    // a "jump straight to the course" request, so we flag it and clear the flag after render.
    const typing = useRef(false);
    useEffect(() => {
        typing.current = false;
    });

    useEffect(() => {
        document.title = "Courses | AVP Tech Group";
    }, []);

    // Start from the first page again whenever the search or category changes
    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [search, category]);

    const results = useMemo(() => {
        const q = search.trim().toLowerCase();
        return courses.filter((c) => {
            if (category !== "All" && c.category !== category) return false;
            if (!q) return true;
            return (
                c.name.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q) ||
                c.heading.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q)
            );
        });
    }, [search, category]);

    // Priced courses (Intune and SCCM) are shown on top; everything else below
    const featured = useMemo(() => results.filter((c) => c.price), [results]);
    const others = useMemo(() => results.filter((c) => !c.price), [results]);

    // Links such as /courses?search=Microsoft%20SCCM%20(MECM) (Pricing cards, navbar menu)
    // open that course's page directly.
    const exact = getCourseByName(search);
    if (exact && !typing.current) {
        return <Navigate to={`/courses/${exact.slug}`} replace />;
    }

    const updateParams = (next) => {
        const merged = { search, category, ...next };
        const out = {};
        if (merged.search) out.search = merged.search;
        if (merged.category && merged.category !== "All") out.category = merged.category;
        setParams(out, { replace: true });
    };

    const onSearch = (e) => {
        typing.current = true;
        updateParams({ search: e.target.value });
    };

    const shown = others.slice(0, visibleCount);
    const remaining = others.length - shown.length;

    const heading = isDark ? "text-white" : "text-slate-900";
    const muted = isDark ? "text-slate-400" : "text-slate-600";
    const accent = isDark ? "#3AA6E8" : "#1B57A0";
    const gradientText = `bg-gradient-to-r bg-clip-text text-transparent ${
        isDark ? "from-[#3AA6E8] to-[#5CD6F5]" : "from-[#0D3F7A] to-[#2380CC]"
    }`;

    return (
        <div
            className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
                isDark ? "bg-[#030712] text-slate-100" : "bg-slate-50 text-slate-900"
            }`}
        >
            {/* Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-20 blur-[120px]"
                    style={{ background: "radial-gradient(circle, #2380CC 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-[45%] right-[-200px] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
                    style={{ background: "radial-gradient(circle, #5CD6F5 0%, transparent 70%)" }}
                />
            </div>

            {/* Header */}
            <header className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-10 text-center">
                <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs sm:text-sm font-semibold tracking-wide border backdrop-blur-md"
                    style={{
                        backgroundColor: isDark ? "rgba(35, 128, 204, 0.10)" : "rgba(35, 128, 204, 0.06)",
                        borderColor: "rgba(35, 128, 204, 0.30)",
                        color: accent,
                    }}
                >
                    <Sparkles size={14} className="animate-pulse" /> {courses.length} Live Courses
                </div>

                <h1 className={`text-3xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight ${heading}`}>
                    Microsoft &amp; Cloud <span className={gradientText}>Technology Courses</span>
                </h1>
                <p className={`text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed mb-8 ${muted}`}>
                    Live, instructor-led training with hands-on labs. Open any course to see its full structure,
                    modules and prerequisites.
                </p>

                {/* Search */}
                <div
                    className={`flex items-center gap-3 rounded-2xl border px-4 sm:px-5 h-14 max-w-xl mx-auto backdrop-blur-md transition-all focus-within:border-[#2380CC]/60 ${
                        isDark ? "bg-white/[0.04] border-white/10" : "bg-white border-slate-200 shadow-sm"
                    }`}
                >
                    <Search size={20} className="text-[#2380CC] flex-shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={onSearch}
                        placeholder="Search courses, e.g. Intune, Defender, Azure"
                        aria-label="Search courses"
                        className={`w-full h-full bg-transparent outline-none text-sm sm:text-base ${
                            isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"
                        }`}
                    />
                </div>

                {/* Category filter */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter courses by category">
                    {["All", ...COURSE_CATEGORIES.map((c) => c.name)].map((name) => {
                        const active = category === name;
                        const count = name === "All" ? courses.length : courses.filter((c) => c.category === name).length;
                        return (
                            <button
                                key={name}
                                type="button"
                                aria-pressed={active}
                                onClick={() => updateParams({ category: name })}
                                className="rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 cursor-pointer sm:text-[13px]"
                                style={
                                    active
                                        ? { background: "linear-gradient(90deg, #1B57A0, #2380CC)", borderColor: "transparent", color: "#ffffff" }
                                        : {
                                              backgroundColor: isDark ? "rgba(7,19,41,0.85)" : "#ffffff",
                                              borderColor: isDark ? "rgba(148,163,184,0.25)" : "rgba(203,213,225,0.9)",
                                              color: isDark ? "#cbd5e1" : "#334155",
                                          }
                                }
                            >
                                {name} <span className="opacity-70">({count})</span>
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Results */}
            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-24">
                {results.length === 0 ? (
                    <div
                        className={`rounded-2xl border p-10 text-center ${
                            isDark ? "bg-slate-950/40 border-slate-800/60" : "bg-white/80 border-slate-200/80"
                        }`}
                    >
                        <p className={`text-sm sm:text-base mb-5 ${muted}`}>
                            No courses match your search. Can&apos;t find what you need? We can arrange custom training.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-[#0D3F7A] to-[#2380CC]"
                        >
                            Talk to Our Experts <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* ── Featured courses with pricing ── */}
                        {featured.length > 0 && (
                            <section className="mb-16" aria-labelledby="featured-courses">
                                <div className="mb-6 text-center sm:text-left">
                                    <h2 id="featured-courses" className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${heading}`}>
                                        Featured <span className={gradientText}>Courses</span>
                                    </h2>
                                    <p className={`mt-1 text-sm ${muted}`}>
                                        The price you see is the price you pay. Course material and a certificate of attendance are included.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                                    {featured.map((c) => (
                                        <FeaturedCourseCard key={c.slug} course={c} isDark={isDark} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── All other courses ── */}
                        {others.length > 0 && (
                            <section aria-labelledby="more-courses">
                                <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                                    <h2 id="more-courses" className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${heading}`}>
                                        More <span className={gradientText}>Courses</span>
                                    </h2>
                                    <p className={`text-sm ${muted}`}>
                                        {others.length} course{others.length !== 1 ? "s" : ""}
                                        {search ? ` matching "${search}"` : ""}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {shown.map((c) => {
                                        const Icon = ICONS[c.icon] || Sparkles;
                                        return (
                                            <Link
                                                key={c.slug}
                                                to={`/courses/${c.slug}`}
                                                className={`group flex flex-col rounded-2xl border p-5 sm:p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                                                    isDark
                                                        ? "bg-slate-950/40 border-slate-800/60 hover:border-[#2380CC]/50"
                                                        : "bg-white/80 border-slate-200/80 hover:border-[#2380CC]/50 shadow-sm"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-4">
                                                    <div
                                                        className="w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0"
                                                        style={{ color: c.color, backgroundColor: `${c.color}1A`, borderColor: `${c.color}4D` }}
                                                    >
                                                        <Icon size={19} />
                                                    </div>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 border ${
                                                            isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"
                                                        }`}
                                                    >
                                                        <Clock size={11} /> {c.duration}
                                                    </span>
                                                </div>

                                                <h3 className={`text-base sm:text-lg font-bold leading-snug mb-1 ${heading}`}>{c.name}</h3>
                                                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: accent }}>
                                                    {c.category}
                                                </p>
                                                <p className={`text-sm leading-relaxed line-clamp-3 mb-5 ${muted}`}>{c.heading}</p>

                                                <div className="mt-auto flex items-center justify-between text-sm">
                                                    <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                        {c.modules.length} modules
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: accent }}>
                                                        View course structure
                                                        <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Explore more */}
                                {remaining > 0 && (
                                    <div className="mt-10 flex flex-col items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                                            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm sm:text-base font-semibold text-white cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
                                            style={{
                                                background: "linear-gradient(135deg, #0D3F7A 0%, #2380CC 100%)",
                                                boxShadow: "0 8px 24px rgba(35,128,204,0.32)",
                                            }}
                                        >
                                            Explore More Courses <ChevronDown size={18} />
                                        </button>
                                        <p className={`text-xs ${muted}`}>
                                            Showing {shown.length} of {others.length} · {remaining} more to explore
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

/* ============================ ENTRY POINT ============================ */

const Courses = () => {
    const { slug } = useParams();
    return slug ? <CourseDetail slug={slug} /> : <CourseList />;
};

export default Courses;