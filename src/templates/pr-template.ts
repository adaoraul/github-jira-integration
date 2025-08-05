export const DEFAULT_PR_TEMPLATE = `## Overview
<!-- Provide a brief summary of what this PR does and why it's needed -->

## Key Changes
<!-- List the main changes/features introduced in this PR -->
- 
- 
- 

## Related Issues/Tickets
<!-- Link to related issues, tickets, or discussions -->
- Fixes {{TICKETNUMBER}}
- {{TICKETURL}}

## Testing
<!-- Describe the testing you've performed -->
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

### Test Details
<!-- Provide specific testing scenarios or steps -->


## Screenshots/Demo
<!-- If applicable, add screenshots or GIFs showing the changes -->
<!-- Delete this section if not applicable -->


## Checklist
<!-- Mark completed items with [x] -->
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code sections
- [ ] Documentation updated
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Breaking changes documented (if any)

## Additional Notes
<!-- Any additional context, decisions, or concerns -->

### Acceptance Criteria
{{ACCEPTANCE}}`;

export interface TemplateVariables {
  TICKETNUMBER: string;
  TICKETURL: string;
  ACCEPTANCE: string;
}

export function replaceTemplateVariables(template: string, variables: TemplateVariables): string {
  return template
    .replace(/{{TICKETNUMBER}}/g, variables.TICKETNUMBER)
    .replace(/{{TICKETURL}}/g, variables.TICKETURL)
    .replace(/{{ACCEPTANCE}}/g, variables.ACCEPTANCE);
}
