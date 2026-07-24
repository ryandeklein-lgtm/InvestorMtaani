// =========================================
// Investor Mtaani Registration Form Schema
// =========================================

// ---------- Option Lists ----------

export const industries = [
  { value: "fintech", label: "FinTech" },
  { value: "agritech", label: "AgriTech" },
  { value: "healthtech", label: "HealthTech" },
  { value: "edtech", label: "EdTech" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "logistics", label: "Logistics" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "real_estate", label: "Real Estate" },
  { value: "construction", label: "Construction" },
  { value: "tourism", label: "Tourism & Hospitality" },
  { value: "energy", label: "Energy" },
  { value: "transport", label: "Transport" },
  { value: "fashion", label: "Fashion" },
  { value: "food", label: "Food & Beverage" },
  { value: "other", label: "Other" },
];

export const businessStages = [
  { value: "idea", label: "Idea Stage" },
  { value: "prototype", label: "Prototype" },
  { value: "mvp", label: "MVP" },
  { value: "early_revenue", label: "Early Revenue" },
  { value: "growth", label: "Growth Stage" },
  { value: "scaling", label: "Scaling" },
];

export const investorTypes = [
  { value: "angel", label: "Angel Investor" },
  { value: "venture_capital", label: "Venture Capital" },
  { value: "private_equity", label: "Private Equity" },
  { value: "family_office", label: "Family Office" },
  { value: "corporate", label: "Corporate Investor" },
  { value: "government", label: "Government Fund" },
];

export const investmentRanges = [
  { value: "100k_500k", label: "KES 100,000 - 500,000" },
  { value: "500k_1m", label: "KES 500,000 - 1 Million" },
  { value: "1m_5m", label: "KES 1 Million - 5 Million" },
  { value: "5m_20m", label: "KES 5 Million - 20 Million" },
  { value: "20m_plus", label: "Above KES 20 Million" },
];

export const countries = [
  { value: "Kenya", label: "Kenya" },
  { value: "Uganda", label: "Uganda" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "South Africa", label: "South Africa" },
];

// =========================================
// Business Registration Fields
// =========================================

export const businessFields = [
  {
    component: "input",
    label: "Business Name",
    name: "businessName",
    type: "text",
    placeholder: "Enter business name",
    required: true,
    grid: 12,
  },

  {
    component: "input",
    label: "Founder Name",
    name: "name",
    type: "text",
    placeholder: "Full name",
    required: true,
    grid: 12,
  },

  {
    component: "input",
    label: "Phone Number",
    name: "phone",
    type: "tel",
    placeholder: "+254...",
    required: true,
    grid: 6,
  },

  {
    component: "input",
    label: "Email Address",
    name: "email",
    type: "email",
    placeholder: "example@email.com",
    required: true,
    grid: 6,
  },

  {
    component: "select",
    label: "Country",
    name: "country",
    options: countries,
    required: true,
    grid: 6,
  },

  {
    component: "input",
    label: "County / City",
    name: "county",
    type: "text",
    placeholder: "Nairobi",
    required: true,
    grid: 6,
  },

  {
    component: "select",
    label: "Industry",
    name: "industry",
    options: industries,
    required: true,
    grid: 6,
  },

  {
    component: "select",
    label: "Business Stage",
    name: "stage",
    options: businessStages,
    required: true,
    grid: 6,
  },

  {
    component: "password",
    label: "Password",
    name: "password",
    required: true,
    grid: 6,
  },

  {
    component: "password",
    label: "Confirm Password",
    name: "confirmPassword",
    required: true,
    grid: 6,
  },
];

// =========================================
// Investor Registration Fields
// =========================================

export const investorFields = [
  {
    component: "input",
    label: "Full Name",
    name: "name",
    type: "text",
    placeholder: "John Doe",
    required: true,
    grid: 12,
  },

  {
    component: "input",
    label: "Company / Fund",
    name: "company",
    type: "text",
    placeholder: "Optional",
    required: false,
    grid: 12,
  },

  {
    component: "input",
    label: "Phone Number",
    name: "phone",
    type: "tel",
    placeholder: "+254...",
    required: true,
    grid: 6,
  },

  {
    component: "input",
    label: "Email Address",
    name: "email",
    type: "email",
    placeholder: "example@email.com",
    required: true,
    grid: 6,
  },

  {
    component: "select",
    label: "Country",
    name: "country",
    options: countries,
    required: true,
    grid: 6,
  },

  {
    component: "select",
    label: "Investor Type",
    name: "investorType",
    options: investorTypes,
    required: true,
    grid: 6,
  },

  {
    component: "select",
    label: "Investment Range",
    name: "investmentRange",
    options: investmentRanges,
    required: true,
    grid: 12,
  },

  {
    component: "password",
    label: "Password",
    name: "password",
    required: true,
    grid: 6,
  },

  {
    component: "password",
    label: "Confirm Password",
    name: "confirmPassword",
    required: true,
    grid: 6,
  },
];