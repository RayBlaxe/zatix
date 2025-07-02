# ZaTix Development Workflow

*Last Updated: 2025-07-02*

This document defines the mandatory development workflow and processes for the ZaTix project. **All developers and AI assistants MUST follow these procedures.**

---

## 🚨 MANDATORY WORKFLOW OVERVIEW

### Pre-Development Phase (REQUIRED)
1. **Read Documentation** - Always start by reading project documentation
2. **Understand Current State** - Check feature status and existing implementations
3. **Plan Approach** - Define implementation strategy based on existing patterns
4. **Update Todo List** - Track progress and communicate intentions

### Development Phase (REQUIRED)
1. **Follow Established Patterns** - Maintain architectural consistency
2. **Implement Features** - Write code following project standards
3. **Test Implementation** - Verify functionality and run checks
4. **Update Documentation** - Keep all docs current and accurate

---

## 📋 PRE-DEVELOPMENT CHECKLIST

**CRITICAL: Complete ALL steps before writing any code**

### ✅ Step 1: Documentation Review
```bash
# Always read these files in order:
1. CLAUDE.md          # Project overview and patterns
2. FEATURES.md        # Current feature implementation status  
3. ROADMAP.md         # Planned features and priorities
4. DEVELOPMENT-WORKFLOW.md  # This file - process guidelines
```

**Validation Questions:**
- [ ] Do I understand the current project architecture?
- [ ] Do I know which features are already implemented?
- [ ] Do I understand the planned development priorities?
- [ ] Am I familiar with the established code patterns?

### ✅ Step 2: Codebase Analysis
```bash
# For any new task, examine:
1. Relevant existing files/components
2. Similar implemented features
3. Type definitions and interfaces
4. API integration patterns
5. Component structure and styling
```

**Required Actions:**
- [ ] Identify files that will be modified or created
- [ ] Check existing implementations of similar features
- [ ] Understand dependencies and integration points
- [ ] Review type definitions for consistency

### ✅ Step 3: Planning & Documentation
```bash
# Update TodoWrite with findings:
1. Document understanding from documentation review
2. List planned approach based on existing patterns
3. Identify potential conflicts or dependencies
4. Define success criteria and testing approach
```

**Required TodoWrite Updates:**
- [ ] Current understanding of the task
- [ ] Planned implementation approach
- [ ] Files to be created/modified
- [ ] Testing and validation steps

---

## 🛠️ DEVELOPMENT STANDARDS

### Code Quality Requirements

#### TypeScript Standards
```typescript
// ✅ Good: Proper typing with existing patterns
interface EventData extends BaseEvent {
  ticketTypes: TicketType[]
  venue: VenueInfo
}

// ❌ Bad: Any types or missing interfaces
const eventData: any = {...}
```

#### Component Patterns
```typescript
// ✅ Good: Follow established component structure
export function FeatureComponent() {
  const { user, hasRole } = useAuth()
  
  return (
    <Card className="p-6">
      {/* Component content */}
    </Card>
  )
}

// ❌ Bad: Different patterns or missing hooks
```

#### File Organization
```bash
# ✅ Good: Follow established structure
/app/dashboard/feature/page.tsx          # Main page
/components/feature/feature-component.tsx # Components
/types/feature.ts                        # Type definitions
/lib/feature-api.ts                      # API integration

# ❌ Bad: Different structure or random placement  
```

### API Integration Standards

#### API Client Usage
```typescript
// ✅ Good: Use established API patterns
import { apiClient } from '@/lib/api'

export async function fetchFeatureData(): Promise<FeatureResponse> {
  try {
    const response = await apiClient.get<FeatureResponse>('/feature')
    return response.data
  } catch (error) {
    // Use established error handling
    throw new APIError('Failed to fetch feature data', error)
  }
}
```

#### Mock Response Implementation
```typescript
// ✅ Good: Provide development fallbacks
const mockFeatureData: FeatureResponse = {
  success: true,
  data: {
    // Mock data matching API structure
  }
}
```

---

## 🧪 TESTING REQUIREMENTS

### Pre-Commit Testing
```bash
# MANDATORY: Run before considering task complete
npm run lint      # Code quality check
npm run typecheck # TypeScript validation  
npm test         # Unit tests
npm run build    # Build verification
```

### Testing Standards
- [ ] All new components must have basic tests
- [ ] API integrations must have mock response tests
- [ ] Critical features require integration tests
- [ ] Edge cases and error states must be tested

---

## 📝 DOCUMENTATION UPDATE PROCESS

### After Completing ANY Task

#### 1. Update FEATURES.md
```markdown
# Example update:
| Feature Name | Status | Priority | Files | Notes |
|-------------|--------|----------|-------|-------|
| New Feature | ✅ | High | `app/feature/page.tsx` | Implemented with X pattern |
```

#### 2. Update ROADMAP.md (if applicable)
- [ ] Mark completed features as done
- [ ] Adjust priorities based on new learnings
- [ ] Update timelines if needed
- [ ] Add any new discovered requirements

#### 3. Update CLAUDE.md (if new patterns established)
- [ ] Document new architectural patterns
- [ ] Add component examples
- [ ] Update file structure if changed
- [ ] Add new development commands

---

## 🔄 WORKFLOW ENFORCEMENT MECHANISMS

### Automated Checks
```typescript
// Example: Pre-commit hook verification
const validateWorkflow = () => {
  checkDocumentationUpdated()
  checkTestsPassing()
  checkLintingPassing()
  checkTypeScriptValid()
}
```

### Manual Verification Points
- [ ] **Before coding**: Documentation read and understood
- [ ] **During coding**: Following established patterns
- [ ] **After coding**: All tests passing and docs updated
- [ ] **Before commit**: All validation checks complete

---

## 🚀 DEVELOPMENT COMMANDS & SHORTCUTS

### Quick Start Commands
```bash
# Development workflow commands
npm run dev         # Start development server
npm run lint        # Run ESLint
npm run typecheck   # TypeScript validation
npm test           # Run tests
npm run build      # Production build
```

### Documentation Commands
```bash
# Quick documentation access
code CLAUDE.md              # Open project overview
code FEATURES.md            # Check feature status
code ROADMAP.md             # Review development priorities
code DEVELOPMENT-WORKFLOW.md # This workflow guide
```

### File Creation Templates
```bash
# New page template
mkdir -p app/feature
touch app/feature/page.tsx

# New component template  
mkdir -p components/feature
touch components/feature/feature-component.tsx

# New types template
touch types/feature.ts
```

---

## 🎯 SUCCESS CRITERIA FOR TASKS

### Definition of Done
A task is only complete when:
- [ ] **Code written** following established patterns
- [ ] **Tests passing** (lint, typecheck, unit tests)
- [ ] **Documentation updated** (FEATURES.md minimum)
- [ ] **Integration verified** with existing features
- [ ] **Performance validated** (build succeeds)

### Quality Gates
- **Code Quality**: ESLint passes with no errors
- **Type Safety**: TypeScript compilation successful
- **Functionality**: Core feature works as intended
- **Integration**: No breaking changes to existing features
- **Documentation**: Project docs reflect current state

---

## 🚨 WORKFLOW VIOLATIONS & FIXES

### Common Violations
1. **Starting without reading docs** → Stop, read all documentation first
2. **Creating inconsistent patterns** → Review existing code, follow established patterns  
3. **Forgetting documentation updates** → Update FEATURES.md minimum after each task
4. **Skipping tests** → Run full test suite before considering complete

### Remediation Process
1. **Identify violation** from checklist or validation failure
2. **Stop current work** and address the violation
3. **Follow proper workflow** from the beginning if necessary
4. **Validate completion** using defined success criteria

---

## 📊 WORKFLOW METRICS & TRACKING

### Development Velocity Tracking
- **Documentation Reading Time**: < 10 minutes per task
- **Planning Phase**: 15-20% of total development time
- **Implementation Phase**: 60-70% of total development time  
- **Documentation Update**: 10-15% of total development time

### Quality Metrics
- **Test Coverage**: Maintain > 80% for new code
- **Type Safety**: 100% TypeScript compliance
- **Code Quality**: 0 ESLint errors, minimize warnings
- **Build Success**: 100% build success rate

---

## 🔧 TROUBLESHOOTING GUIDE

### Common Issues & Solutions

#### Documentation Out of Sync
```bash
# Problem: Features implemented but docs not updated
# Solution: 
1. Review recent changes in git log
2. Update FEATURES.md with current status
3. Verify all implemented features are documented
```

#### Pattern Inconsistencies  
```bash
# Problem: New code doesn't follow established patterns
# Solution:
1. Review similar existing implementations
2. Refactor to match established patterns
3. Update component to use existing utilities/hooks
```

#### Test Failures
```bash
# Problem: Tests failing after changes
# Solution:
1. Run npm test to identify failing tests
2. Update tests to match new implementation
3. Add tests for any new functionality
4. Ensure all tests pass before proceeding
```

---

**Remember: This workflow exists to maintain code quality, architectural consistency, and project continuity. Following it ensures that all development work contributes positively to the overall project goals.**

*Next workflow review: August 15, 2025*