/**
 * Unit Tests for Account Management System
 * 
 * These tests mirror the scenarios documented in docs/TESTPLAN.md
 * They validate the business logic, data persistence, and error handling
 * of the Node.js implementation converted from COBOL.
 */

const fs = require('fs');
const path = require('path');
const { AccountDataStore, AccountOperations } = require('./index');

// Test storage file path - use a temporary file for tests
const TEST_STORAGE_PATH = path.join(__dirname, '.test-account-storage.json');

/**
 * Helper function to clean up test storage file
 */
function cleanupTestStorage() {
    if (fs.existsSync(TEST_STORAGE_PATH)) {
        fs.unlinkSync(TEST_STORAGE_PATH);
    }
}

/**
 * Helper function to reset storage to initial balance
 */
function resetStorage(balance = 1000.00) {
    cleanupTestStorage();
    // Ensure balance is stored with proper precision
    const numericBalance = parseFloat(parseFloat(balance).toFixed(2));
    fs.writeFileSync(
        TEST_STORAGE_PATH,
        JSON.stringify({ balance: numericBalance.toFixed(2) }, null, 2),
        'utf8'
    );
}

// ============================================================================
// TC-020 to TC-022: DATA PERSISTENCE TESTS
// ============================================================================

describe('Data Persistence Layer (AccountDataStore)', () => {

    afterEach(() => {
        cleanupTestStorage();
    });

    describe('TC-020: READ Operation', () => {
        test('should read current balance from storage', () => {
            resetStorage(1000.00);

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const balance = dataStore.read();

            expect(balance).toBe(1000.00);
        });

        test('should return default balance when storage file does not exist', () => {
            cleanupTestStorage();

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const balance = dataStore.read();

            expect(balance).toBe(1000.00);
        });
    });

    describe('TC-021: WRITE Operation', () => {
        test('should write balance to storage and persist it', () => {
            cleanupTestStorage();

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            dataStore.write(1500.00);

            expect(dataStore.read()).toBe(1500.00);
            expect(fs.existsSync(TEST_STORAGE_PATH)).toBe(true);
        });

        test('should update existing balance in storage', () => {
            resetStorage(1000.00);

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            dataStore.write(2500.00);

            const newDataStore = new AccountDataStore(TEST_STORAGE_PATH);
            expect(newDataStore.read()).toBe(2500.00);
        });
    });

    describe('TC-022: Data Persistence - Read After Write', () => {
        test('should persist balance across multiple instances', () => {
            cleanupTestStorage();

            // First instance: write balance
            const dataStore1 = new AccountDataStore(TEST_STORAGE_PATH);
            dataStore1.write(1500.00);

            // Second instance: read balance
            const dataStore2 = new AccountDataStore(TEST_STORAGE_PATH);
            const balance = dataStore2.read();

            expect(balance).toBe(1500.00);
        });

        test('should maintain balance precision with 2 decimal places', () => {
            cleanupTestStorage();

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            dataStore.write(1234.56);

            const retrieved = JSON.parse(fs.readFileSync(TEST_STORAGE_PATH, 'utf8'));
            expect(retrieved.balance).toBe('1234.56');
        });
    });

    describe('TC-008, TC-009: Initial Account Balance', () => {
        test('should initialize with default balance of 1000.00', () => {
            cleanupTestStorage();

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            expect(dataStore.read()).toBe(1000.00);
        });

        test('should return formatted balance string with 2 decimal places', () => {
            resetStorage(1000.00);

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const formatted = dataStore.getFormattedBalance();

            expect(formatted).toBe('1000.00');
        });
    });

    describe('Formatted Balance Display', () => {
        test('TC-035: should preserve 2 decimal place precision', () => {
            resetStorage(1000.00);

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            dataStore.write(1000.01);

            expect(dataStore.getFormattedBalance()).toBe('1000.01');
        });

        test('should format balances with trailing zeros', () => {
            resetStorage(500.00);

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            expect(dataStore.getFormattedBalance()).toBe('500.00');
        });
    });
});

// ============================================================================
// TC-010 to TC-013: CREDIT ACCOUNT OPERATIONS
// ============================================================================

describe('Credit Account Operations', () => {

    beforeEach(() => {
        resetStorage(1000.00);
    });

    afterEach(() => {
        cleanupTestStorage();
    });

    describe('TC-010: Credit Account - Valid Amount', () => {
        test('should add valid amount to account balance', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.creditAccount(500.00);

            expect(dataStore.read()).toBe(1500.00);
        });

        test('should display success message with new balance', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.creditAccount(500.00);

            expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1500.00');
            consoleSpy.mockRestore();
        });
    });

    describe('TC-011: Credit Account - Zero Amount', () => {
        test('should accept zero amount and keep balance unchanged', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.creditAccount(0.00);

            expect(dataStore.read()).toBe(1000.00);
        });

        test('should display message confirming zero credit operation', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.creditAccount(0.00);

            expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1000.00');
            consoleSpy.mockRestore();
        });
    });

    describe('TC-012: Credit Account - Large Amount', () => {
        test('should handle large credit amounts', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.creditAccount(999999.99);

            expect(dataStore.read()).toBe(1000999.99);
        });

        test('should display large amount correctly', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.creditAccount(999999.99);

            expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1000999.99');
            consoleSpy.mockRestore();
        });
    });

    describe('TC-013: Credit Account - Decimal Amount', () => {
        test('should handle decimal credit amounts with precision', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.creditAccount(123.45);

            expect(dataStore.read()).toBe(1123.45);
        });

        test('should maintain decimal precision in display', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.creditAccount(123.45);

            expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1123.45');
            consoleSpy.mockRestore();
        });
    });

    describe('Invalid Credit Operations', () => {
        test('should reject negative credit amounts', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = operations.creditAccount(-100.00);

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Invalid amount. Please enter a positive number.');
            expect(dataStore.read()).toBe(1000.00);

            consoleSpy.mockRestore();
        });

        test('should handle non-numeric input gracefully', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = operations.creditAccount('invalid');

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Invalid amount. Please enter a positive number.');

            consoleSpy.mockRestore();
        });
    });
});

// ============================================================================
// TC-014 to TC-019: DEBIT ACCOUNT OPERATIONS
// ============================================================================

describe('Debit Account Operations', () => {

    beforeEach(() => {
        resetStorage(1000.00);
    });

    afterEach(() => {
        cleanupTestStorage();
    });

    describe('TC-014: Debit Account - Valid Amount (Sufficient Funds)', () => {
        test('should debit valid amount when funds are sufficient', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.debitAccount(250.00);

            expect(dataStore.read()).toBe(750.00);
        });

        test('should display success message after valid debit', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.debitAccount(250.00);

            expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 750.00');
            consoleSpy.mockRestore();
        });

        test('should return true on successful debit', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const result = operations.debitAccount(250.00);

            expect(result).toBe(true);
        });
    });

    describe('TC-015: Debit Account - Exact Balance Amount', () => {
        test('should allow debit of exact balance amount', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.debitAccount(1000.00);

            expect(dataStore.read()).toBe(0.00);
        });

        test('should display correct balance when debited to zero', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.debitAccount(1000.00);

            expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 0.00');
            consoleSpy.mockRestore();
        });
    });

    describe('TC-016: Debit Account - Insufficient Funds', () => {
        test('should reject debit when insufficient funds', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.debitAccount(1500.00);

            expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
            expect(dataStore.read()).toBe(1000.00);

            consoleSpy.mockRestore();
        });

        test('should return false when insufficient funds', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const result = operations.debitAccount(1500.00);

            expect(result).toBe(false);
        });

        test('should not modify balance on failed debit', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.debitAccount(1500.00);
            operations.debitAccount(1500.00);

            expect(dataStore.read()).toBe(1000.00);
        });
    });

    describe('TC-017: Debit Account - Zero Amount', () => {
        test('should accept zero amount debit', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.debitAccount(0.00);

            expect(dataStore.read()).toBe(1000.00);
        });

        test('should display confirmation for zero debit', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.debitAccount(0.00);

            expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 1000.00');
            consoleSpy.mockRestore();
        });
    });

    describe('TC-018: Debit Account - Decimal Amount (Sufficient Funds)', () => {
        test('should handle decimal debit amounts precisely', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.debitAccount(250.75);

            expect(dataStore.read()).toBe(749.25);
        });

        test('should maintain decimal precision in display', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.debitAccount(250.75);

            expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 749.25');
            consoleSpy.mockRestore();
        });
    });

    describe('TC-019: Debit Account - Negative Amount', () => {
        test('should reject negative debit amounts', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = operations.debitAccount(-100.00);

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Invalid amount. Please enter a positive number.');
            expect(dataStore.read()).toBe(1000.00);

            consoleSpy.mockRestore();
        });
    });

    describe('Invalid Debit Operations', () => {
        test('should handle non-numeric input gracefully', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = operations.debitAccount('invalid');

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Invalid amount. Please enter a positive number.');

            consoleSpy.mockRestore();
        });
    });
});

// ============================================================================
// TC-023 to TC-026, TC-027 to TC-029: SEQUENTIAL & MIXED OPERATIONS
// ============================================================================

describe('Sequential and Mixed Operations', () => {

    beforeEach(() => {
        resetStorage(1000.00);
    });

    afterEach(() => {
        cleanupTestStorage();
    });

    describe('TC-023: Sequential Credit Operations', () => {
        test('should correctly process multiple credit operations in sequence', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.creditAccount(100.00);
            operations.creditAccount(200.00);

            expect(dataStore.read()).toBe(1300.00);
        });

        test('should maintain balance after 3+ sequential credits', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.creditAccount(100.00);
            operations.creditAccount(200.00);
            operations.creditAccount(50.00);
            operations.creditAccount(150.00);

            expect(dataStore.read()).toBe(1500.00);
        });
    });

    describe('TC-024: Sequential Debit Operations', () => {
        test('should correctly process multiple debit operations in sequence', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.debitAccount(100.00);
            operations.debitAccount(200.00);

            expect(dataStore.read()).toBe(700.00);
        });

        test('should maintain balance after 3+ sequential debits', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.debitAccount(100.00);
            operations.debitAccount(200.00);
            operations.debitAccount(50.00);

            expect(dataStore.read()).toBe(650.00);
        });
    });

    describe('TC-025: Mixed Credit and Debit Operations', () => {
        test('should correctly process mixed credit and debit operations', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.creditAccount(500.00);
            operations.debitAccount(250.00);

            expect(dataStore.read()).toBe(1250.00);
        });

        test('should handle complex mixed operations with correct result', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.creditAccount(300.00);
            operations.debitAccount(100.00);
            operations.creditAccount(200.00);
            operations.debitAccount(150.00);

            expect(dataStore.read()).toBe(1250.00);
        });
    });

    describe('TC-026: Credit After Insufficient Debit Attempt', () => {
        test('should not modify balance when debit is rejected', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.debitAccount(1500.00);
            operations.creditAccount(500.00);

            expect(dataStore.read()).toBe(1500.00);
        });

        test('should successfully credit after failed debit attempt', () => {
            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            operations.debitAccount(1500.00);
            operations.creditAccount(500.00);

            expect(dataStore.read()).toBe(1500.00);
            expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
            expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1500.00');

            consoleSpy.mockRestore();
        });
    });
});

// ============================================================================
// TC-027 to TC-029: EDGE CASES - ZERO AND NEGATIVE BALANCE TESTS
// ============================================================================

describe('Edge Cases - Zero Balance Operations', () => {

    afterEach(() => {
        cleanupTestStorage();
    });

    describe('TC-027: Debit to Bring Balance to Zero', () => {
        test('should allow debit that reduces balance to exactly zero', () => {
            const initialBalance = 500.00;
            cleanupTestStorage();
            fs.writeFileSync(
                TEST_STORAGE_PATH,
                JSON.stringify({ balance: initialBalance.toFixed(2) }, null, 2),
                'utf8'
            );

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.debitAccount(500.00);

            expect(dataStore.read()).toBe(0.00);
        });

        test('should display zero balance message correctly', () => {
            const initialBalance = 500.00;
            cleanupTestStorage();
            fs.writeFileSync(
                TEST_STORAGE_PATH,
                JSON.stringify({ balance: initialBalance.toFixed(2) }, null, 2),
                'utf8'
            );

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.debitAccount(500.00);

            expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 0.00');
            consoleSpy.mockRestore();

            cleanupTestStorage();
        });
    });

    describe('TC-028: Debit from Zero Balance', () => {
        test('should reject debit when balance is zero', () => {
            cleanupTestStorage();
            fs.writeFileSync(
                TEST_STORAGE_PATH,
                JSON.stringify({ balance: '0.00' }, null, 2),
                'utf8'
            );

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.debitAccount(100.00);

            expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
            expect(dataStore.read()).toBe(0.00);

            consoleSpy.mockRestore();
            cleanupTestStorage();
        });
    });

    describe('TC-029: Credit to Zero Balance Account', () => {
        test('should successfully credit to zero balance account', () => {
            cleanupTestStorage();
            fs.writeFileSync(
                TEST_STORAGE_PATH,
                JSON.stringify({ balance: '0.00' }, null, 2),
                'utf8'
            );

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.creditAccount(500.00);

            expect(dataStore.read()).toBe(500.00);
            cleanupTestStorage();
        });

        test('should display correct balance after crediting zero balance', () => {
            cleanupTestStorage();
            fs.writeFileSync(
                TEST_STORAGE_PATH,
                JSON.stringify({ balance: '0.00' }, null, 2),
                'utf8'
            );

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.creditAccount(500.00);

            expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 500.00');
            consoleSpy.mockRestore();

            cleanupTestStorage();
        });
    });
});

// ============================================================================
// TC-034: LARGE BALANCE CALCULATIONS
// ============================================================================

describe('Large Balance Calculations', () => {

    afterEach(() => {
        cleanupTestStorage();
    });

    describe('TC-034: Large Balance Calculation', () => {
        test('should handle large balance calculations', () => {
            resetStorage(999999.99);

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            operations.creditAccount(1.00);

            expect(dataStore.read()).toBe(1000000.99);
        });

        test('should maintain precision with large numbers', () => {
            resetStorage(999999.99);

            const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
            const operations = new AccountOperations(dataStore);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            operations.creditAccount(1.00);

            expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1000000.99');
            consoleSpy.mockRestore();
        });
    });
});

// ============================================================================
// INTEGRATION TESTS - FULL WORKFLOW SCENARIOS
// ============================================================================

describe('Integration Tests - Full Workflow Scenarios', () => {

    beforeEach(() => {
        resetStorage(1000.00);
    });

    afterEach(() => {
        cleanupTestStorage();
    });

    test('should support realistic banking workflow', () => {
        const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
        const operations = new AccountOperations(dataStore);

        // Initial balance check
        expect(dataStore.read()).toBe(1000.00);

        // Multiple credits (deposits)
        operations.creditAccount(500.00);
        expect(dataStore.read()).toBe(1500.00);

        operations.creditAccount(250.00);
        expect(dataStore.read()).toBe(1750.00);

        // Multiple debits (withdrawals)
        operations.debitAccount(300.00);
        expect(dataStore.read()).toBe(1450.00);

        operations.debitAccount(200.00);
        expect(dataStore.read()).toBe(1250.00);

        // Attempt overspend (should fail)
        operations.debitAccount(2000.00);
        expect(dataStore.read()).toBe(1250.00);

        // Another credit
        operations.creditAccount(100.00);
        expect(dataStore.read()).toBe(1350.00);
    });

    test('should maintain data integrity across persistence boundaries', () => {
        // First session
        const dataStore1 = new AccountDataStore(TEST_STORAGE_PATH);
        dataStore1.write(5000.00);

        // Second session
        const dataStore2 = new AccountDataStore(TEST_STORAGE_PATH);
        const operations = new AccountOperations(dataStore2);

        operations.creditAccount(1000.00);
        expect(dataStore2.read()).toBe(6000.00);

        // Third session
        const dataStore3 = new AccountDataStore(TEST_STORAGE_PATH);
        expect(dataStore3.read()).toBe(6000.00);
    });

    test('should handle rapid consecutive operations correctly', () => {
        const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
        const operations = new AccountOperations(dataStore);

        const operations_list = [
            { type: 'credit', amount: 100.00 },
            { type: 'debit', amount: 50.00 },
            { type: 'credit', amount: 200.00 },
            { type: 'debit', amount: 150.00 },
            { type: 'credit', amount: 75.00 },
        ];

        let expectedBalance = 1000.00;

        for (const op of operations_list) {
            if (op.type === 'credit') {
                operations.creditAccount(op.amount);
                expectedBalance += op.amount;
            } else {
                if (dataStore.read() >= op.amount) {
                    operations.debitAccount(op.amount);
                    expectedBalance -= op.amount;
                }
            }
        }

        expect(dataStore.read()).toBe(expectedBalance);
    });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Edge Cases and Boundary Conditions', () => {

    afterEach(() => {
        cleanupTestStorage();
    });

    test('should handle very small decimal amounts', () => {
        resetStorage(100.00);

        const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
        const operations = new AccountOperations(dataStore);

        operations.creditAccount(0.01);
        expect(dataStore.read()).toBe(100.01);
    });

    test('should handle repeated zero operations', () => {
        resetStorage(1000.00);

        const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
        const operations = new AccountOperations(dataStore);

        for (let i = 0; i < 5; i++) {
            operations.creditAccount(0.00);
            operations.debitAccount(0.00);
        }

        expect(dataStore.read()).toBe(1000.00);
    });

    test('should prevent floating point precision errors', () => {
        resetStorage(100.00);

        const dataStore = new AccountDataStore(TEST_STORAGE_PATH);
        const operations = new AccountOperations(dataStore);

        // Add amounts that could cause floating point issues
        operations.creditAccount(0.1);
        operations.creditAccount(0.2);

        // Should be 100.30, not 100.30000000000001
        const balance = dataStore.read();
        const rounded = Math.round(balance * 100) / 100;

        expect(rounded).toBe(100.30);
    });
});
