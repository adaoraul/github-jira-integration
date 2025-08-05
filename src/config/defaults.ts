import { DEFAULT_PR_TEMPLATE } from '../templates/pr-template';

export const CONFIG_DEFAULTS = {
  jiraUrl: '',
  jiraEmail: '',
  jiraApiToken: '',
  acceptanceStartString: 'h3. Acceptance Criteria',
  acceptanceEndString: 'h3. Notes',
  prTemplateEnabled: true,
  prTitleEnabled: true,
  prTemplate: DEFAULT_PR_TEMPLATE,
} as const;

export const JIRA_TICKET_REGEX = /([A-Z0-9]+-[0-9]+)/g;

export const GITHUB_PR_PATHS = ['/pull/', '/compare/', '/issues/new'];

export const STORAGE_KEYS = {
  JIRA_URL: 'jiraUrl',
  JIRA_EMAIL: 'jiraEmail',
  JIRA_API_TOKEN: 'jiraApiToken',
  ACCEPTANCE_START: 'acceptanceStartString',
  ACCEPTANCE_END: 'acceptanceEndString',
  PR_TEMPLATE_ENABLED: 'prTemplateEnabled',
  PR_TITLE_ENABLED: 'prTitleEnabled',
  PR_TEMPLATE: 'prTemplate',
} as const;
