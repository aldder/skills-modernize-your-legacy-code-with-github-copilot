# Test Plan: Account Management System

## Overview

This test plan covers all business logic and functionality of the COBOL-based Account Management System. The system provides account balance viewing, credit, and debit operations with persistent storage.

---

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-001 | Display Main Menu | System is started | 1. Launch the program | Main menu is displayed with options: 1. View Balance, 2. Credit Account, 3. Debit Account, 4. Exit | | | |
| TC-002 | Valid Menu Selection - View Balance | Main menu is displayed | 1. Select option 1 | System calls Operations with 'TOTAL' operation | | | |
| TC-003 | Valid Menu Selection - Credit Account | Main menu is displayed | 1. Select option 2 | System calls Operations with 'CREDIT' operation | | | |
| TC-004 | Valid Menu Selection - Debit Account | Main menu is displayed | 1. Select option 3 | System calls Operations with 'DEBIT' operation | | | |
| TC-005 | Valid Menu Selection - Exit | Main menu is displayed | 1. Select option 4 | Program displays "Exiting the program. Goodbye!" and terminates | | | |
| TC-006 | Invalid Menu Selection - Out of Range | Main menu is displayed | 1. Select option 5 (or any number > 4) | System displays "Invalid choice, please select 1-4." and returns to menu | | | |
| TC-007 | Invalid Menu Selection - Negative Number | Main menu is displayed | 1. Select option -1 | System displays "Invalid choice, please select 1-4." and returns to menu | | | |
| TC-008 | Initial Account Balance | Program is started for the first time | 1. Launch program 2. Select option 1 (View Balance) | System displays current balance of 1000.00 | | | |
| TC-009 | View Balance Operation | Account has balance of 1000.00 | 1. Select option 1 from menu 2. System calls DataProgram with 'READ' operation | System displays "Current balance: 1000.00" | | | |
| TC-010 | Credit Account - Valid Amount | Initial balance is 1000.00 | 1. Select option 2 (Credit Account) 2. Enter amount: 500.00 3. System reads current balance 4. System adds amount to balance 5. System writes new balance | New balance is 1500.00, message displays "Amount credited. New balance: 1500.00" | | | |
| TC-011 | Credit Account - Zero Amount | Initial balance is 1000.00 | 1. Select option 2 (Credit Account) 2. Enter amount: 0.00 | Balance remains 1000.00, message displays "Amount credited. New balance: 1000.00" | | | |
| TC-012 | Credit Account - Large Amount | Initial balance is 1000.00 | 1. Select option 2 (Credit Account) 2. Enter amount: 999999.99 | Balance is updated to 1000999.99, message displays "Amount credited. New balance: 1000999.99" | | | |
| TC-013 | Credit Account - Decimal Amount | Initial balance is 1000.00 | 1. Select option 2 (Credit Account) 2. Enter amount: 123.45 | Balance is updated to 1123.45, message displays "Amount credited. New balance: 1123.45" | | | |
| TC-014 | Debit Account - Valid Amount (Sufficient Funds) | Initial balance is 1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount: 250.00 3. System reads current balance 4. System validates sufficient funds 5. System subtracts amount 6. System writes new balance | New balance is 750.00, message displays "Amount debited. New balance: 750.00" | | | |
| TC-015 | Debit Account - Exact Balance Amount | Initial balance is 1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount: 1000.00 | New balance is 0.00, message displays "Amount debited. New balance: 0.00" | | | |
| TC-016 | Debit Account - Insufficient Funds | Initial balance is 1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount: 1500.00 3. System reads current balance 4. System validates balance >= amount | System displays "Insufficient funds for this debit.", balance remains 1000.00 | | | |
| TC-017 | Debit Account - Zero Amount | Initial balance is 1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount: 0.00 | Balance remains 1000.00, message displays "Amount debited. New balance: 1000.00" | | | |
| TC-018 | Debit Account - Decimal Amount (Sufficient Funds) | Initial balance is 1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount: 250.75 | New balance is 749.25, message displays "Amount debited. New balance: 749.25" | | | |
| TC-019 | Debit Account - Negative Amount | Initial balance is 1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount: -100.00 | System behavior depends on input validation (should either reject or treat as credit) | | | |
| TC-020 | Data Persistence - READ Operation | Initial balance is 1000.00 | 1. Call DataProgram with operation 'READ' | DataProgram returns current stored balance (1000.00) | | | |
| TC-021 | Data Persistence - WRITE Operation | Balance variable is set to 1500.00 | 1. Call DataProgram with operation 'WRITE' and balance 1500.00 | STORAGE-BALANCE is updated to 1500.00 | | | |
| TC-022 | Data Persistence - Read After Write | Initial balance is 1000.00 | 1. Credit account with 500.00 2. View balance 3. Exit and restart 4. View balance again | Balance persists as 1500.00 in subsequent session | | | |
| TC-023 | Sequential Credit Operations | Initial balance is 1000.00 | 1. Select option 2, enter 100.00 2. Select option 2, enter 200.00 3. Select option 1 to view balance | Final balance is 1300.00 | | | |
| TC-024 | Sequential Debit Operations | Initial balance is 1000.00 | 1. Select option 3, enter 100.00 2. Select option 3, enter 200.00 3. Select option 1 to view balance | Final balance is 700.00 | | | |
| TC-025 | Mixed Credit and Debit Operations | Initial balance is 1000.00 | 1. Select option 2, enter 500.00 2. Select option 3, enter 250.00 3. Select option 1 to view balance | Final balance is 1250.00 | | | |
| TC-026 | Credit After Insufficient Debit Attempt | Initial balance is 1000.00 | 1. Select option 3, enter 1500.00 (fails) 2. Select option 2, enter 500.00 3. View balance | Balance is 1500.00 (debit attempt did not affect balance) | | | |
| TC-027 | Debit to Bring Balance to Zero | Initial balance is 500.00 | 1. Select option 3, enter 500.00 | New balance is 0.00, message displays "Amount debited. New balance: 0.00" | | | |
| TC-028 | Debit from Zero Balance | Initial balance is 0.00 | 1. Select option 3, enter 100.00 | System displays "Insufficient funds for this debit.", balance remains 0.00 | | | |
| TC-029 | Credit to Zero Balance Account | Initial balance is 0.00 | 1. Select option 2, enter 500.00 | New balance is 500.00, message displays "Amount credited. New balance: 500.00" | | | |
| TC-030 | Menu Loop Continuity | User performs multiple operations | 1. Perform 3-4 operations (view, credit, debit) without exiting | Menu displays correctly after each operation, CONTINUE-FLAG remains 'YES' | | | |
| TC-031 | Program Termination | Menu is displayed with CONTINUE-FLAG = 'YES' | 1. Select option 4 | CONTINUE-FLAG is set to 'NO', loop terminates, program executes STOP RUN | | | |
| TC-032 | Invalid Input - Non-numeric Menu Choice | Main menu is displayed | 1. Enter 'A' or other non-numeric input | System handles gracefully (behavior depends on input acceptance mechanism) | | | |
| TC-033 | Invalid Input - Decimal Menu Choice | Main menu is displayed | 1. Enter 1.5 | System treats as invalid and displays error message or prompts for valid selection | | | |
| TC-034 | Large Balance Calculation | Initial balance is 999999.99 | 1. Select option 2, enter 1.00 | Balance is updated to 1000000.99 (or system maximum) | | | |
| TC-035 | Precision Validation - Credit | Initial balance is 1000.00 | 1. Select option 2, enter 0.01 | Balance is updated to 1000.01, two decimal places preserved | | | |

---

## Notes

- **Initial Balance**: The system initializes with a balance of 1000.00
- **Data Storage**: All balance changes should be persisted via the DataProgram
- **Decimal Precision**: The system uses 2 decimal places (PIC 9(6)V99)
- **Operation Codes**:
  - 'TOTAL ' - View balance
  - 'CREDIT' - Credit operation
  - 'DEBIT ' - Debit operation
  - 'READ' - Read balance from storage
  - 'WRITE' - Write balance to storage
- **Error Handling**: System should gracefully handle invalid inputs and provide appropriate error messages
- **Menu Loop**: System should return to main menu after each operation until user selects exit

---

## Test Environment Requirements

- COBOL Runtime Environment
- Access to all three programs: MainProgram, Operations, and DataProgram
- Input/Output capabilities for accepting user input and displaying results
- Data storage mechanism for balance persistence
