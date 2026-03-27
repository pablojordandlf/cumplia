/**
 * Micro-copy dictionary for Cumplia
 * Keep it human-friendly, contextual, and never generic
 */

export const microcopy = {
  // Form actions
  actions: {
    submit: 'Create Use Case',
    save: 'Save Changes',
    create: 'Create System',
    add: 'Add Item',
    delete: 'Remove',
    cancel: 'Cancel',
    continue: 'Continue',
    next: 'Next Step',
    previous: 'Go Back',
    done: 'Done',
    close: 'Close',
  },

  // Loading states
  loading: {
    default: 'Loading...',
    analysis: 'Analyzing with AI...',
    saving: 'Saving your work...',
    generating: 'Generating your report...',
    validating: 'Checking your input...',
    importing: 'Importing systems...',
    compliance: 'Organizing your AI Act compliance data...',
    assessment: 'Running risk assessment...',
  },

  // Success messages
  success: {
    saved: 'Changes saved!',
    created: 'Created successfully!',
    added: 'Added to your inventory.',
    completed: 'All set!',
    validated: 'Looks good!',
    imported: 'Systems imported.',
  },

  // Error messages (friendly)
  errors: {
    generic: 'Oops, something went sideways. Try again?',
    network: 'Looks like we lost connection. Let\'s try again.',
    notfound: 'Can\'t find that. Double-check and try again?',
    permission: 'You don\'t have access here. Contact your admin if this seems wrong.',
    timeout: 'That took too long. Let\'s try again.',
    validation: 'Hmm, that didn\'t look right. Check and try again?',
    required: 'This one\'s required.',
    invalid: 'That doesn\'t look right.',
  },

  // Form labels (more human)
  labels: {
    systemName: 'What\'s the name of this system?',
    description: 'Tell us about it',
    email: 'Your email',
    password: 'Password',
    organization: 'Your organization',
    riskLevel: 'How risky is this?',
    compliance: 'Does this affect compliance?',
  },

  // Empty states
  empty: {
    noSystems: 'Your inventory is empty',
    noUseCases: 'No use cases yet',
    noRisks: 'No risks identified',
    noCompliance: 'Ready for compliance',
    addFirst: 'Let\'s add your first one',
  },

  // Placeholders
  placeholders: {
    search: 'Search systems...',
    enterValue: 'Enter value...',
    description: 'Add a description...',
  },

  // Buttons in context
  buttons: {
    addSystem: 'Add Your First System',
    createUseCase: 'Create Use Case',
    startAssessment: 'Start Risk Assessment',
    reviewCompliance: 'Begin Compliance Review',
    tryAgain: 'Try Again',
    learnMore: 'Learn More',
    skipForNow: 'Skip for Now',
  },

  // Validation
  validation: {
    perfect: 'Perfect!',
    almostThere: 'Almost there!',
    checkAgain: 'Let\'s check this again.',
  },

  // Risk assessment
  assessment: {
    analyzing: 'Analyzing your systems...',
    identifying: 'Identifying potential risks...',
    complete: 'Risk assessment complete!',
  },
}

export const getMicrocopy = (path: string): string => {
  const keys = path.split('.')
  let value: any = microcopy

  for (const key of keys) {
    value = value?.[key]
  }

  return value || path
}
