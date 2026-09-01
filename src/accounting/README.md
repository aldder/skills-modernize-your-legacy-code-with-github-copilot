# Account Management System - Node.js Implementation

## Overview

This is a Node.js implementation of the COBOL Account Management System. The application has been converted from three separate COBOL programs into a single, well-structured Node.js application while preserving all original business logic.

## Conversion Summary

### Original COBOL Programs

- **MainProgram** (`main.cob`): Menu-driven user interface and control flow
- **Operations** (`operations.cob`): Business logic for account operations (View, Credit, Debit)
- **DataProgram** (`data.cob`): Data storage and persistence layer

### Node.js Architecture

The application follows the same layered architecture as the original COBOL implementation:

```
AccountManagementSystem (UI/Menu Layer)
    ↓
AccountOperations (Business Logic Layer)
    ↓
AccountDataStore (Data Persistence Layer)
```

## Features

✅ **View Balance** - Display current account balance
✅ **Credit Account** - Add funds to account
✅ **Debit Account** - Subtract funds from account (with validation)
✅ **Persistent Storage** - Balance persists between sessions
✅ **Input Validation** - Handles invalid amounts and insufficient funds
✅ **Interactive Menu** - Menu-driven interface with looping logic

## Prerequisites

- Node.js >= 14.0.0
- npm (comes with Node.js)

## Installation

```bash
cd src/accounting
npm install
```

The application uses only Node.js built-in modules, so no external dependencies are required.

## Running the Application

### From the workspace root

```bash
node src/accounting/index.js
```

### From the accounting directory

```bash
cd src/accounting
npm start
```

### Using VS Code Debugger

1. Open the Run and Debug panel (Ctrl+Shift+D)
2. Select "Account Management System" from the configuration dropdown
3. Click "Start Debugging" (F5)

## Data Persistence

The application stores the account balance in a JSON file:

- **Location**: `src/accounting/.account-storage.json`
- **Format**: Simple JSON with balance field
- **Initial Balance**: 1000.00

Example:

```json
{
  "balance": "1000.00"
}
```

## Business Logic

### Balance Operations

#### View Balance

- Reads current balance from storage
- Displays formatted balance with 2 decimal places

#### Credit Account

- Accepts amount to add
- Validates positive numeric input
- Adds amount to current balance
- Persists new balance
- Displays confirmation with new balance

#### Debit Account

- Accepts amount to withdraw
- Validates positive numeric input
- **Checks for sufficient funds** (key business rule)
- If funds available: subtracts amount and persists
- If insufficient funds: displays error message, balance unchanged
- Displays appropriate confirmation message

## Code Structure

### AccountDataStore Class

Manages data persistence (equivalent to COBOL DataProgram):

- `read()` - Retrieves current balance
- `write(balance)` - Persists balance to file
- `getFormattedBalance()` - Returns formatted balance string
- `loadBalance()` - Loads balance from storage on initialization

### AccountOperations Class

Implements business logic (equivalent to COBOL Operations program):

- `viewBalance()` - TOTAL operation
- `creditAccount(amount)` - CREDIT operation
- `debitAccount(amount)` - DEBIT operation with validation

### AccountManagementSystem Class

Manages UI and program flow (equivalent to COBOL MainProgram):

- `displayMenu()` - Shows menu options
- `getUserChoice()` - Gets user input
- `getAmount()` - Gets amount input
- `handleMenuChoice()` - Routes to appropriate operation
- `run()` - Main program loop

## Testing

The test plan is available in [../../docs/TESTPLAN.md](../../docs/TESTPLAN.md)

All 35 test cases from the COBOL application test plan should pass with this Node.js implementation. Run the application and follow the test steps to validate:

- Menu navigation (TC-001 to TC-007)
- View balance operations (TC-008, TC-009)
- Credit operations (TC-010 to TC-013)
- Debit operations (TC-014 to TC-019)
- Data persistence (TC-020 to TC-022)
- Sequential and mixed operations (TC-023 to TC-029)

## Migration Notes

This application represents a faithful conversion of the COBOL logic to Node.js:

- ✅ Same business logic preserved
- ✅ Same data validation rules (insufficient funds check)
- ✅ Same menu structure and options
- ✅ Same control flow (loop until exit)
- ✅ Persistent data storage
- ✅ Error handling for invalid inputs

## Differences from COBOL Version

1. **Input Handling**: Node.js readline module vs COBOL ACCEPT statement
2. **Storage**: JSON file vs COBOL WORKING-STORAGE SECTION
3. **Error Messages**: Slightly enhanced with validation messages
4. **Number Formatting**: Automatic 2-decimal precision with toFixed(2)
5. **Logging**: Console output instead of COBOL DISPLAY

## Future Enhancements

For a production Node.js application, consider:

- Database integration (SQLite, PostgreSQL, MongoDB)
- Transaction history/audit log
- User authentication and authorization
- REST API endpoints
- Input validation middleware
- Comprehensive error handling
- Unit and integration tests (see TESTPLAN.md)

## License

MIT
