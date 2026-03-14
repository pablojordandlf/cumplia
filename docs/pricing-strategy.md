# CumplIA Pricing Strategy

This document outlines the comprehensive pricing strategy for CumplIA, an AI Act compliance SaaS platform. It defines four distinct tiers designed to cater to a range of business needs, from individual testing to large enterprise deployments.

## 1. Feature Matrix

| Feature                        | FREE (€0)                             | PRO (€99/month)                        | BUSINESS (€239/month)                      | ENTERPRISE (Custom)                                 |
| :----------------------------- | :------------------------------------ | :------------------------------------- | :----------------------------------------- | :-------------------------------------------------- |
| **AI Systems Included**        | Max 1                                 | Up to 5                                | Up to 15                                   | Unlimited                                           |
| **Risk Evaluation**            | Basic (no classification)             | Full risk classification               | Full risk classification                   | Full risk classification                            |
| **Document Generation**        | Cannot generate                       | Up to 10/month                         | Unlimited                                  | Unlimited                                           |
| **FRIA Generation**            | No                                    | Basic                                  | Advanced (Full Article 27)                 | Advanced (Full Article 27)                          |
| **Users Included**             | 1                                     | 3                                      | 10                                         | Unlimited (scalable)                                |
| **Support**                    | Community                             | Email                                  | Priority                                   | Dedicated Account Manager, SLA 99.9%                |
| **Export Formats**             | N/A                                   | PDF/DOCX                               | PDF/DOCX                                   | PDF/DOCX                                            |
| **Multi-department Management**| No                                    | No                                     | Yes                                        | Yes                                                 |
| **API Access**                 | No                                    | No                                     | Yes                                        | Yes                                                 |
| **Integrations**               | No                                    | No                                     | Slack, Teams                               | Custom Integrations                                 |
| **Custom Templates**           | No                                    | No                                     | Yes                                        | Yes                                                 |
| **On-premise / Private Cloud** | No                                    | No                                     | No                                         | Yes                                                 |
| **SSO & Advanced Access**      | No                                    | No                                     | No                                         | Yes                                                 |
| **Audit & Certification Support** | No                                    | No                                     | No                                         | Yes                                                 |

## 2. Value Propositions

### FREE (€0)
**For Testing & Exploration:** Empower individual developers, researchers, or small teams to experiment with AI compliance basics without financial commitment. Get started quickly with fundamental risk assessment.

### PRO (€99/month)
**For Small Businesses & Startups:** Provide essential AI Act compliance tools for growing businesses. Effortlessly classify risks, generate initial compliance documents, and support a small team, enabling a foundation of regulatory adherence.

### BUSINESS (€239/month)
**For Growing Companies:** Scale your compliance efforts with advanced features. Manage multiple departments, generate unlimited documents, leverage API access for automation, and benefit from priority support to meet complex regulatory demands.

### ENTERPRISE (Custom)
**For Large Organizations & Regulated Industries:** Deliver comprehensive, secure, and fully customizable compliance solutions. Robust features, dedicated support, and flexible deployment options (including on-premise) ensure adherence for the most demanding and sensitive operations.

## 3. Target Customer Profiles

### FREE
- Individual developers
- AI researchers
- Students
- Startups in very early stages
- Teams testing the platform's capabilities

### PRO
- Small to medium-sized businesses (SMBs)
- SaaS companies with a few AI features
- Consulting firms starting AI compliance services
- Teams of 2-3 looking for core compliance tools

### BUSINESS
- Mid-sized companies with developing AI strategies
- Organizations with multiple AI systems or departments
- Companies needing to integrate compliance into existing workflows
- Businesses prioritizing efficiency and automation in compliance

### ENTERPRISE
- Large corporations with extensive AI deployments
- Financial institutions, healthcare providers, government agencies
- Companies operating in highly regulated sectors
- Organizations requiring on-premise solutions or strict data governance

## 4. Upgrade Triggers

### FREE to PRO
- Exceeding 1 AI system limit.
- Needing to generate compliance documents.
- Requiring more than basic risk evaluation (i.e., classification).
- Needing support beyond community forums.

### PRO to BUSINESS
- Exceeding 5 AI systems limit.
- Requiring generation of more than 10 documents per month.
- Needing advanced FRIA generation (full Article 27 compliance).
- Requiring multi-department management capabilities.
- Seeking API access for automation or custom workflows.
- Needing integrations with tools like Slack or Teams.
- Expansion of user base beyond 3 users.

### BUSINESS to ENTERPRISE
- Exceeding 15 AI systems limit.
- Requiring unlimited everything (documents, AI systems, etc.).
- Needing an on-premise or private cloud deployment.
- Requiring Single Sign-On (SSO) and advanced access control for large user bases.
- Needing dedicated strategic support (account manager, SLA).
- Requiring custom integrations or audit/certification support.

## 5. Technical Implementation Notes (Feature Gating)

The platform's features will be gated based on the user's subscription plan. This will be enforced at the application layer.

-   **AI System Count:**
    -   Application logic will track the number of registered AI systems per account.
    -   Creation of new AI systems will be blocked if the user's plan limit is reached.
    -   `FREE`: Limit 1.
    -   `PRO`: Limit 5.
    -   `BUSINESS`: Limit 15.
    -   `ENTERPRISE`: No limit.
-   **Document Generation Quota:**
    -   A counter will track documents generated per account per month.
    -   Users will be prevented from generating documents once their monthly quota is met.
    -   `FREE`: Blocked.
    -   `PRO`: Max 10/month.
    -   `BUSINESS`/`ENTERPRISE`: Unlimited.
-   **FRIA Generation Complexity:**
    -   Different generation modules or templates will be available based on plan.
    -   `FREE`: N/A.
    -   `PRO`: Basic FRIA module/template.
    -   `BUSINESS`/`ENTERPRISE`: Advanced FRIA module/template with Article 27 specifics.
-   **User Count:**
    -   User invitation and management features will enforce per-plan user limits.
    -   `FREE`: Limit 1.
    -   `PRO`: Limit 3.
    -   `BUSINESS`: Limit 10.
    -   `ENTERPRISE`: No limit.
-   **API Access:**
    -   API keys and endpoints will only be provisioned for `BUSINESS` and `ENTERPRISE` plans.
-   **Integrations:**
    -   Toggles and setup flows for integrations (Slack, Teams, custom) will be enabled based on plan.
    -   `BUSINESS`: Slack, Teams.
    -   `ENTERPRISE`: Custom Integrations.
-   **On-premise/Private Cloud:**
    -   This requires a separate deployment mechanism and licensing model, exclusively for `ENTERPRISE`.
-   **SSO & Advanced Access Control:**
    -   Integration with identity providers (SAML, OAuth2) will be available only for `ENTERPRISE`.
-   **Support Level:**
    -   Support ticket routing and response SLAs will be configured based on the plan.
    -   `FREE`: Community forum access.
    -   `PRO`: Email support queue.
    -   `BUSINESS`: Priority email queue.
    -   `ENTERPRISE`: Dedicated account manager engagement.

## 6. Recommended Database Schema Updates (Plans Table)

Assuming a `plans` table exists, the following updates or additions are recommended to support the tiered structure.

**Existing `plans` table (example):**
```sql
CREATE TABLE plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'FREE', 'PRO', 'BUSINESS', 'ENTERPRISE'
    monthly_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Recommended modifications/additions:**

1.  **Enhance `plans` table with plan-specific limits and features:**
    Add columns to `plans` to store quantitative limits and flags for feature availability.

    ```sql
    ALTER TABLE plans
    ADD COLUMN max_ai_systems INT UNSIGNED DEFAULT 1, -- default for FREE
    ADD COLUMN max_documents_per_month INT UNSIGNED NULL, -- NULL for unlimited
    ADD COLUMN basic_fria_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN advanced_fria_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN max_users INT UNSIGNED DEFAULT 1, -- default for FREE
    ADD COLUMN api_access_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN slack_integration_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN teams_integration_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN custom_integrations_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN custom_templates_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN multi_department_management_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN on_premise_option BOOLEAN DEFAULT FALSE,
    ADD COLUMN sso_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN audit_certification_support BOOLEAN DEFAULT FALSE,
    ADD COLUMN support_level ENUM('COMMUNITY', 'EMAIL', 'PRIORITY', 'DEDICATED') DEFAULT 'COMMUNITY';
    ```

2.  **Populate `plans` table with data:**

    ```sql
    -- Sample INSERT statements (adjust based on actual plan ID management)
    -- Assuming 'FREE' plan ID is 1, 'PRO' is 2, etc.

    -- FREE Plan
    UPDATE plans SET
        monthly_price = 0.00,
        max_ai_systems = 1,
        max_documents_per_month = NULL, -- Not applicable/blocked
        basic_fria_enabled = FALSE,
        advanced_fria_enabled = FALSE,
        max_users = 1,
        api_access_enabled = FALSE,
        slack_integration_enabled = FALSE,
        teams_integration_enabled = FALSE,
        custom_integrations_enabled = FALSE,
        custom_templates_enabled = FALSE,
        multi_department_management_enabled = FALSE,
        on_premise_option = FALSE,
        sso_enabled = FALSE,
        audit_certification_support = FALSE,
        support_level = 'COMMUNITY'
    WHERE name = 'FREE';

    -- PRO Plan
    UPDATE plans SET
        monthly_price = 99.00,
        max_ai_systems = 5,
        max_documents_per_month = 10,
        basic_fria_enabled = TRUE,
        advanced_fria_enabled = FALSE,
        max_users = 3,
        api_access_enabled = FALSE,
        slack_integration_enabled = FALSE,
        teams_integration_enabled = FALSE,
        custom_integrations_enabled = FALSE,
        custom_templates_enabled = FALSE,
        multi_department_management_enabled = FALSE,
        on_premise_option = FALSE,
        sso_enabled = FALSE,
        audit_certification_support = FALSE,
        support_level = 'EMAIL'
    WHERE name = 'PRO';

    -- BUSINESS Plan
    UPDATE plans SET
        monthly_price = 239.00,
        max_ai_systems = 15,
        max_documents_per_month = NULL, -- Unlimited
        basic_fria_enabled = FALSE, -- Basic is superseded by Advanced
        advanced_fria_enabled = TRUE,
        max_users = 10,
        api_access_enabled = TRUE,
        slack_integration_enabled = TRUE,
        teams_integration_enabled = TRUE,
        custom_integrations_enabled = FALSE,
        custom_templates_enabled = TRUE,
        multi_department_management_enabled = TRUE,
        on_premise_option = FALSE,
        sso_enabled = FALSE,
        audit_certification_support = FALSE,
        support_level = 'PRIORITY'
    WHERE name = 'BUSINESS';

    -- ENTERPRISE Plan
    UPDATE plans SET
        monthly_price = NULL, -- Custom pricing managed separately/via CRM
        max_ai_systems = NULL, -- Unlimited
        max_documents_per_month = NULL, -- Unlimited
        basic_fria_enabled = FALSE, -- Basic is superseded by Advanced
        advanced_fria_enabled = TRUE,
        max_users = NULL, -- Unlimited
        api_access_enabled = TRUE,
        slack_integration_enabled = TRUE, -- Can include standard integrations
        teams_integration_enabled = TRUE,
        custom_integrations_enabled = TRUE,
        custom_templates_enabled = TRUE,
        multi_department_management_enabled = TRUE,
        on_premise_option = TRUE,
        sso_enabled = TRUE,
        audit_certification_support = TRUE,
        support_level = 'DEDICATED'
    WHERE name = 'ENTERPRISE';
    ```
3.  **Consideration for `max_documents_per_month` and `max_ai_systems`:**
    *   For `FREE` and `PRO`, `max_documents_per_month` should be set to the specific limit. For `FREE`, document generation is blocked entirely. This could be handled by a `CAN_GENERATE_DOCUMENTS BOOLEAN` flag or by setting `max_documents_per_month = 0` for FREE.
    *   For `BUSINESS` and `ENTERPRISE`, `max_documents_per_month` should be `NULL` or a very large number to signify unlimited.
    *   Similarly, `max_ai_systems` should be `NULL` for `ENTERPRISE` to denote unlimited.

4.  **`support_level` `ENUM`:** This provides a flexible way to define different tiers of support.

5.  **Feature Flags:** Boolean flags for each distinct feature ensure clear gatekeeping.

This schema update allows the application to fetch a user's plan details and enforce feature availability and limits directly from the database, forming the core of the permission system.
