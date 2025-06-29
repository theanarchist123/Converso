#!/usr/bin/env node

// Simple test to check if our fixes resolved the client/server import issues
console.log('Testing imports...');

try {
    // Test client-side session actions
    const sessionActions = require('./lib/actions/session.actions.ts');
    console.log('✓ Session actions imported successfully');
    
    // Test client-side companion actions
    const companionClientActions = require('./lib/actions/companion.client.ts');
    console.log('✓ Companion client actions imported successfully');
    
    console.log('✅ All client imports look good!');
} catch (error) {
    console.error('❌ Import error:', error.message);
    process.exit(1);
}
