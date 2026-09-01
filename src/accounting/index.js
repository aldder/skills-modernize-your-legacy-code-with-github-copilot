#!/usr/bin/env node

/**
 * Account Management System - Node.js Implementation
 * Converted from COBOL (MainProgram, Operations, DataProgram)
 * 
 * This application provides account management with:
 * - View Balance (READ operation)
 * - Credit Account (ADD operation)
 * - Debit Account (SUBTRACT operation with validation)
 * - Persistent storage of account balance
 */

const fs = require('fs');
const readline = require('readline');
const path = require('path');

// ============================================================================
// DATA LAYER - Equivalent to DataProgram
// ============================================================================

class AccountDataStore {
    constructor(storagePath = path.join(__dirname, '.account-storage.json')) {
        this.storagePath = storagePath;
        this.storageBalance = this.loadBalance();
    }

    /**
     * Load balance from persistent storage or initialize to 1000.00
     */
    loadBalance() {
        try {
            if (fs.existsSync(this.storagePath)) {
                const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
                const balance = parseFloat(data.balance);
                // Check for NaN explicitly instead of using falsy check
                // This ensures 0.00 is treated as a valid balance, not as falsy
                return isNaN(balance) ? 1000.00 : balance;
            }
        } catch (error) {
            console.error('Warning: Could not load balance from storage, initializing to default.');
        }
        return 1000.00;
    }

    /**
     * Read current balance (equivalent to COBOL READ operation)
     */
    read() {
        return this.storageBalance;
    }

    /**
     * Write balance to storage (equivalent to COBOL WRITE operation)
     */
    write(balance) {
        // Store as number internally, but maintain 2 decimal precision
        const numericBalance = parseFloat(parseFloat(balance).toFixed(2));
        this.storageBalance = numericBalance;
        try {
            fs.writeFileSync(
                this.storagePath,
                JSON.stringify({ balance: numericBalance.toFixed(2) }, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('Error: Could not persist balance to storage.');
            throw error;
        }
    }

    /**
     * Get current balance as formatted string
     */
    getFormattedBalance() {
        return this.storageBalance.toFixed(2);
    }
}

// ============================================================================
// OPERATIONS LAYER - Equivalent to Operations Program
// ============================================================================

class AccountOperations {
    constructor(dataStore) {
        this.dataStore = dataStore;
    }

    /**
     * TOTAL Operation - Display current balance (equivalent to COBOL TOTAL)
     */
    viewBalance() {
        const balance = this.dataStore.read();
        console.log(`Current balance: ${parseFloat(balance).toFixed(2)}`);
    }

    /**
     * CREDIT Operation - Add amount to account (equivalent to COBOL CREDIT)
     */
    creditAccount(amount) {
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount < 0) {
            console.log('Invalid amount. Please enter a positive number.');
            return false;
        }

        const currentBalance = this.dataStore.read();
        const newBalance = parseFloat(currentBalance) + numAmount;

        this.dataStore.write(newBalance.toFixed(2));
        console.log(`Amount credited. New balance: ${newBalance.toFixed(2)}`);
        return true;
    }

    /**
     * DEBIT Operation - Subtract amount from account (equivalent to COBOL DEBIT)
     * Includes validation for insufficient funds
     */
    debitAccount(amount) {
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount < 0) {
            console.log('Invalid amount. Please enter a positive number.');
            return false;
        }

        const currentBalance = this.dataStore.read();

        // Validation: Check if sufficient funds available (equivalent to COBOL IF condition)
        if (parseFloat(currentBalance) >= numAmount) {
            const newBalance = parseFloat(currentBalance) - numAmount;
            this.dataStore.write(newBalance.toFixed(2));
            console.log(`Amount debited. New balance: ${newBalance.toFixed(2)}`);
            return true;
        } else {
            console.log('Insufficient funds for this debit.');
            return false;
        }
    }
}

// ============================================================================
// MENU/UI LAYER - Equivalent to MainProgram
// ============================================================================

class AccountManagementSystem {
    constructor() {
        this.dataStore = new AccountDataStore();
        this.operations = new AccountOperations(this.dataStore);

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.continueFlag = true;
    }

    /**
     * Display main menu (equivalent to COBOL DISPLAY statements)
     */
    displayMenu() {
        console.log('');
        console.log('--------------------------------');
        console.log('Account Management System');
        console.log('1. View Balance');
        console.log('2. Credit Account');
        console.log('3. Debit Account');
        console.log('4. Exit');
        console.log('--------------------------------');
    }

    /**
     * Prompt user for menu choice and return as number
     */
    async getUserChoice() {
        return new Promise((resolve) => {
            this.rl.question('Enter your choice (1-4): ', (answer) => {
                resolve(parseInt(answer, 10));
            });
        });
    }

    /**
     * Prompt user for amount input
     */
    async getAmount(operationType) {
        return new Promise((resolve) => {
            const prompt = operationType === 'CREDIT'
                ? 'Enter credit amount: '
                : 'Enter debit amount: ';

            this.rl.question(prompt, (answer) => {
                resolve(parseFloat(answer));
            });
        });
    }

    /**
     * Handle user menu selection (equivalent to COBOL EVALUATE statement)
     */
    async handleMenuChoice(choice) {
        switch (choice) {
            case 1:
                // CALL 'Operations' USING 'TOTAL '
                this.operations.viewBalance();
                break;
            case 2:
                // CALL 'Operations' USING 'CREDIT'
                const creditAmount = await this.getAmount('CREDIT');
                this.operations.creditAccount(creditAmount);
                break;
            case 3:
                // CALL 'Operations' USING 'DEBIT '
                const debitAmount = await this.getAmount('DEBIT');
                this.operations.debitAccount(debitAmount);
                break;
            case 4:
                // MOVE 'NO' TO CONTINUE-FLAG
                this.continueFlag = false;
                break;
            default:
                // WHEN OTHER
                console.log('Invalid choice, please select 1-4.');
        }
    }

    /**
     * Main program loop (equivalent to COBOL PERFORM UNTIL loop)
     */
    async run() {
        console.log('\n=== Account Management System Started ===\n');

        // PERFORM UNTIL CONTINUE-FLAG = 'NO'
        while (this.continueFlag) {
            this.displayMenu();
            const choice = await this.getUserChoice();
            await this.handleMenuChoice(choice);
        }

        // EXIT - Display goodbye message and stop
        console.log('\nExiting the program. Goodbye!');
        this.rl.close();
    }
}

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================

async function main() {
    const system = new AccountManagementSystem();
    await system.run();
}

// Run the application
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
// ============================================================================
// EXPORTS FOR TESTING
// ============================================================================

module.exports = {
    AccountDataStore,
    AccountOperations,
    AccountManagementSystem
};