# Testing and CI/CD Documentation

This document describes the testing infrastructure and CI/CD pipeline implemented for the Water Tracker Hydration project.

## Table of Contents

- [Testing Overview](#testing-overview)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [Running Tests](#running-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Test Coverage](#test-coverage)

## Testing Overview

The project uses **Jest** as the testing framework with **jest-expo** preset for React Native compatibility. Tests are organized into two main categories:

1. **Unit Tests** - Test individual functions and utilities in isolation
2. **Integration Tests** - Test complete workflows and interactions between components

## Unit Tests

Unit tests are located in `__tests__` subdirectories next to the code they test. They validate individual functions and utilities.

### Tested Utilities

#### Validation Utils (`utils/__tests__/validation.test.ts`)
Tests for input validation functions:
- `isNonNegativeNumber()` - Validates non-negative numbers
- `isPositiveNumber()` - Validates positive numbers
- `isValidTimeFormat()` - Validates time format (HH:mm)
- `isNonEmptyString()` - Validates non-empty strings
- `sanitizeNonNegativeNumber()` - Sanitizes input to non-negative numbers
- `sanitizePositiveNumber()` - Sanitizes input to positive numbers

**Coverage**: 100% (17 tests)

#### Numbers Utils (`utils/__tests__/numbers.test.ts`)
Tests for number manipulation functions:
- `roundToTen()` - Rounds numbers to nearest 10
- `roundBy()` - Rounds numbers by specified value

**Coverage**: 100% (8 tests)

#### Backup Utils (`utils/__tests__/backup.test.ts`)
Tests for backup and data export/import functions:
- `waterHistoryToCSV()` - Converts water history to CSV format
- `parseCSVToWaterHistory()` - Parses CSV to water history object
- CSV round-trip conversion validation
- Error handling and edge cases

**Coverage**: 58.92% (12 tests)

## Integration Tests

Integration tests are located in `__tests__/integration/` and test complete workflows.

### Backup Integration Tests (`__tests__/integration/backup.integration.test.ts`)

Tests complete backup and restore workflows:
- Full backup and restore cycle
- JSON export and import
- CSV export and import
- Data merging on CSV import
- Error handling for invalid data

**Coverage**: 7 integration tests

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

The coverage report will be generated in the `coverage/` directory.

### Run Specific Test File
```bash
npm test -- validation.test.ts
```

### Run Integration Tests Only
```bash
npm test -- --testPathPattern=integration
```

## CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration. The workflow is defined in `.github/workflows/ci.yml`.

### Workflow Jobs

#### 1. Lint Job
- **Trigger**: On push/PR to `main` or `develop` branches
- **Actions**:
  - Checkout code
  - Setup Node.js 20
  - Install dependencies
  - Run ESLint

#### 2. Test Job
- **Trigger**: On push/PR to `main` or `develop` branches
- **Actions**:
  - Checkout code
  - Setup Node.js 20
  - Install dependencies
  - Run unit tests
  - Generate coverage report
  - Upload coverage as artifact (retained for 30 days)

#### 3. Integration Job
- **Trigger**: After lint and test jobs complete
- **Actions**:
  - Checkout code
  - Setup Node.js 20
  - Install dependencies
  - Run integration tests

### Pipeline Features

✅ **Automated linting** - Ensures code quality and style consistency
✅ **Unit test execution** - Validates individual components
✅ **Integration testing** - Validates complete workflows
✅ **Coverage reporting** - Tracks test coverage metrics
✅ **Artifact storage** - Saves coverage reports for review

### Future Enhancements (Not Implemented)

As per project requirements, the following are planned for future implementation:
- Build pipeline for production deployments
- Automatic error reporting (Sentry integration)

## Test Coverage

Current test coverage metrics:

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| **validation.ts** | 100% | 100% | 100% | 100% |
| **numbers.ts** | 100% | 100% | 100% | 100% |
| **backup.ts** | 58.92% | 80% | 64.7% | 60.18% |

**Total Tests**: 44 tests (all passing ✅)

### Coverage Goals

- Core utility functions: ✅ 100% coverage achieved
- Backup utilities: ⚠️ 58.92% coverage (acceptable for v1)
- Integration workflows: ✅ Comprehensive coverage

## Best Practices

### Writing Tests

1. **Use descriptive test names**
   ```typescript
   it('should return true for valid non-negative numbers', () => {
     // test code
   });
   ```

2. **Test edge cases**
   - Empty inputs
   - Null/undefined values
   - Negative numbers
   - Invalid formats

3. **Group related tests**
   ```typescript
   describe('Validation Utils', () => {
     describe('isNonNegativeNumber', () => {
       // related tests
     });
   });
   ```

4. **Clean up after tests**
   ```typescript
   afterEach(async () => {
     await AsyncStorage.clear();
   });
   ```

### Maintaining CI/CD

1. Keep dependencies up to date
2. Monitor test execution times
3. Review coverage reports regularly
4. Fix failing tests immediately
5. Add tests for new features

## Troubleshooting

### Tests Failing Locally

1. Clear Jest cache:
   ```bash
   npm test -- --clearCache
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

### CI/CD Pipeline Failures

1. Check the GitHub Actions logs
2. Verify Node.js version compatibility
3. Ensure all dependencies are in package.json
4. Check for environment-specific issues

## Resources

- [Jest Documentation](https://jestjs.io/)
- [jest-expo Documentation](https://docs.expo.dev/develop/unit-testing/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)

---

For questions or issues with the testing infrastructure, please open an issue on GitHub.
