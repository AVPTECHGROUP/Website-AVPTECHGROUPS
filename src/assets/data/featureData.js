import itSolutionsImg from "../Images/Features/it-solutions.svg";
import certificationImg from "../Images/Features/certification-training.svg";
import corporateImg from "../Images/Features/corporate-training.svg";
import staffingImg from "../Images/Features/staffing-services.svg";
import endpointImg from "../Images/Features/endpoint-management.svg";
import securityImg from "../Images/Features/security-identity.svg";
import cloudImg from "../Images/Features/cloud-azure.svg";
import m365Img from "../Images/Features/microsoft-365.svg";

/*
 * `category` is shown as a chip on the home-page cards; `icon` must match a key in the ICONS map inside FeatureDetails.jsx.
 * NOTE: the copy below is draft content — replace anything that does not
 * match what AVP Tech Group actually offers before going live.
 */
export const featureData = [
    {
        slug: "it-solutions",
        category: "Services",
        icon: "Wrench",
        title: "IT Solutions & Support",
        shortDescription:
            "Infrastructure, cloud, devices and security, diagnosed and fixed end to end.",
        heading: "One team that fixes IT problems end to end",
        description:
            "From infrastructure and cloud migration to device management and security, we diagnose the problem, design the fix and stay until it holds.",
        bgImage: itSolutionsImg,
        features: [
            "Infrastructure setup, upgrades and monitoring",
            "Cloud migration and Microsoft 365 administration",
            "Device management and endpoint security",
            "On-demand technical support for your team",
            "Documentation and knowledge transfer after every project",
        ],
        benefits: [
            "Faster resolution with no vendor hand-offs",
            "A single accountable point of contact",
            "Solutions built around your real environment",
            "Fewer repeat incidents",
        ],
        footer: "Have an IT problem that won't go away?",
    },
    {
        slug: "certification-training",
        category: "Training",
        icon: "GraduationCap",
        title: "Certification Training",
        shortDescription:
            "Live, instructor-led Microsoft and cloud courses built around the exam and the job.",
        heading: "Live courses built around the exam and the real job",
        description:
            "Instructor-led training in Microsoft Intune, Defender, Azure, Microsoft 365 and more, delivered by trainers who work with these products in the field.",
        bgImage: certificationImg,
        features: [
            "36+ courses across Microsoft and cloud technologies",
            "Live sessions with working professionals",
            "Small batches with a maximum of 8 learners",
            "Digital course material with every course",
            "Mock and test questions in full-time courses",
            "Certificate of attendance for every learner",
        ],
        benefits: [
            "Exam-ready with practice tests",
            "Personal attention in every batch",
            "Transparent pricing with no extra costs",
            "Skills you can use on the job from day one",
        ],
        footer: "Ready to get certified?",
    },
    {
        slug: "corporate-training",
        category: "Training",
        icon: "Building2",
        title: "Corporate Training",
        shortDescription:
            "Private team training on your schedule, tailored to the tools your staff use.",
        heading: "Private team training tailored to your tools",
        description:
            "We build the course around your environment and your schedule, so your team learns the exact tools and workflows they use every day.",
        bgImage: corporateImg,
        features: [
            "Private batches scheduled around your team",
            "Content tailored to your environment and tools",
            "Live, instructor-led delivery",
            "Hands-on labs and real-world scenarios",
            "Course material and certificates for every attendee",
            "Single topics or full certification tracks",
        ],
        benefits: [
            "Upskill many people at once",
            "Training that matches your real stack",
            "Flexible scheduling with less downtime",
            "Consistent skills across the whole team",
        ],
        footer: "Want to upskill your whole team?",
    },
    {
        slug: "staffing-services",
        category: "Services",
        icon: "Handshake",
        title: "Staffing Services",
        shortDescription:
            "Skilled IT professionals for short-term projects and long-term roles.",
        heading: "Skilled IT professionals, matched to your stack",
        description:
            "Whether you need extra hands for a project or a long-term team member, we match experienced professionals to your technology and your culture.",
        bgImage: staffingImg,
        features: [
            "Short-term project resources",
            "Long-term and permanent placements",
            "Engineers across Microsoft, cloud and security",
            "Certified professionals with hands-on experience",
            "Matching based on your stack, not just a job title",
        ],
        benefits: [
            "Fill skill gaps quickly",
            "Flexible engagement models",
            "Talent that is productive from the first week",
            "One partner for both training and hiring",
        ],
        footer: "Need the right IT talent for your team?",
    },
    {
        slug: "endpoint-management",
        category: "Technology",
        icon: "Smartphone",
        title: "Endpoint Management",
        shortDescription:
            "Enroll, secure and update every device from one console.",
        heading: "Manage every device from one console",
        description:
            "Deploy, configure, patch and protect Windows and mobile devices with Microsoft Intune, Autopilot and the wider endpoint toolset.",
        bgImage: endpointImg,
        features: [
            "Microsoft Intune enrollment, policies and compliance",
            "Windows Autopilot for zero-touch deployment",
            "SCCM (MECM) software and patch deployment",
            "Windows Autopatch and Windows Update for Business",
            "Endpoint Analytics for device health insights",
            "Microsoft Defender for Endpoint integration",
        ],
        benefits: [
            "Faster device rollouts",
            "Consistent security policies everywhere",
            "Less manual patching and setup",
            "Clear visibility into device health",
        ],
        footer: "Ready to take control of your devices?",
    },
    {
        slug: "security-identity",
        category: "Technology",
        icon: "ShieldCheck",
        title: "Security & Identity",
        shortDescription:
            "Threat protection, identity and compliance designed in from day one.",
        heading: "Security built in, not bolted on",
        description:
            "Protect identities, devices, email, apps and data with Microsoft Defender, Entra ID, Sentinel and Purview, designed as one connected system.",
        bgImage: securityImg,
        features: [
            "Microsoft Defender XDR, Endpoint, Office 365 and Cloud Apps",
            "Microsoft Defender for Identity and Defender for Cloud",
            "Microsoft Sentinel for SIEM and SOAR",
            "Microsoft Entra ID and conditional access",
            "Microsoft Purview for data protection and compliance",
            "Identity and access administration",
        ],
        benefits: [
            "Detect and respond to threats sooner",
            "Stronger control over who can access what",
            "Compliance support built into the design",
            "Security your team understands and can run",
        ],
        footer: "Want to strengthen your security posture?",
    },
    {
        slug: "cloud-azure",
        category: "Technology",
        icon: "Cloud",
        title: "Cloud & Azure",
        shortDescription:
            "Plan, migrate and run workloads on Azure with governance and security.",
        heading: "Move to the cloud without the chaos",
        description:
            "From assessment and architecture to networking, security and virtual desktops, we help you run on Azure with clear governance and predictable cost.",
        bgImage: cloudImg,
        features: [
            "Azure administration and solution architecture",
            "Azure networking and security",
            "Azure Virtual Desktop (AVD) design and deep dives",
            "Migration planning and execution",
            "Cloud security posture with Defender for Cloud",
            "Governance and cost control practices",
        ],
        benefits: [
            "Migrations that are planned, not improvised",
            "Secure, well-governed environments",
            "Work-from-anywhere desktops",
            "Fewer surprises on the monthly bill",
        ],
        footer: "Planning a move to the cloud?",
    },
    {
        slug: "microsoft-365",
        category: "Technology",
        icon: "Layers",
        title: "Microsoft 365 & Collaboration",
        shortDescription:
            "Tenant setup, email, Teams, SharePoint and OneDrive administered properly.",
        heading: "Collaboration tools that just work",
        description:
            "Set up and administer Microsoft 365 the right way, from mail and Teams to SharePoint and OneDrive, with Google Workspace support where you need it.",
        bgImage: m365Img,
        features: [
            "Microsoft 365 tenant administration",
            "Exchange Online mail flow and policies",
            "Microsoft Teams administration",
            "SharePoint Online and OneDrive for Business",
            "Google Workspace administration",
            "Licensing, security defaults and user lifecycle",
        ],
        benefits: [
            "A clean, well-organized tenant",
            "Smoother teamwork across locations",
            "Fewer support tickets for everyday tasks",
            "Security settings configured from the start",
        ],
        footer: "Want your Microsoft 365 set up properly?",
    },
];

export const getFeatureBySlug = (slug) =>
    featureData.find((feature) => feature.slug === slug);

export default featureData;