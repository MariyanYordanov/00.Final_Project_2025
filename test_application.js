#!/usr/bin/env node

/**
 * MyFamilyTreeNet Application E2E Test Suite
 * Simulates user interactions and tests key functionalities
 */

const https = require('https');
const http = require('http');

class MyFamilyTreeNetTester {
    constructor() {
        this.apiUrl = 'http://localhost:5000';
        this.frontendUrl = 'http://localhost:4200';
        this.testResults = [];
        this.authToken = null;
    }

    // Utility function to make HTTP requests
    makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const isHttps = url.startsWith('https');
            const client = isHttps ? https : http;
            
            const reqOptions = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                }
            };

            const req = client.request(url, reqOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = data ? JSON.parse(data) : null;
                        resolve({
                            status: res.statusCode,
                            data: jsonData,
                            headers: res.headers
                        });
                    } catch (e) {
                        resolve({
                            status: res.statusCode,
                            data: data,
                            headers: res.headers
                        });
                    }
                });
            });

            req.on('error', reject);
            
            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            req.end();
        });
    }

    // Log test results
    logTest(testName, success, message, response = null) {
        const result = {
            test: testName,
            success,
            message,
            timestamp: new Date().toISOString()
        };
        
        if (response) {
            result.status = response.status;
            result.responseSize = JSON.stringify(response.data || '').length;
        }
        
        this.testResults.push(result);
        
        const icon = success ? '✅' : '❌';
        const status = response ? ` [${response.status}]` : '';
        console.log(`${icon} ${testName}${status}: ${message}`);
        
        if (!success && response && response.data) {
            console.log(`   Response: ${JSON.stringify(response.data).slice(0, 200)}...`);
        }
    }

    // Test 1: API Health Check
    async testApiHealth() {
        try {
            const response = await this.makeRequest(`${this.apiUrl}/api/family`);
            
            if (response.status === 200 && Array.isArray(response.data)) {
                this.logTest('API Health Check', true, `Found ${response.data.length} families`, response);
                return true;
            } else {
                this.logTest('API Health Check', false, 'Invalid response format', response);
                return false;
            }
        } catch (error) {
            this.logTest('API Health Check', false, `Connection failed: ${error.message}`);
            return false;
        }
    }

    // Test 2: User Authentication
    async testAuthentication() {
        try {
            const loginData = {
                email: 'admin@worldfamily.com',
                password: 'Admin123!'
            };

            const response = await this.makeRequest(`${this.apiUrl}/api/auth/login`, {
                method: 'POST',
                body: loginData
            });

            if (response.status === 200 && response.data && response.data.token) {
                this.authToken = response.data.token;
                this.logTest('User Authentication', true, `Login successful for ${response.data.user?.firstName || 'admin'}`, response);
                return true;
            } else {
                this.logTest('User Authentication', false, 'Login failed', response);
                return false;
            }
        } catch (error) {
            this.logTest('User Authentication', false, `Login request failed: ${error.message}`);
            return false;
        }
    }

    // Test 3: Family Data Retrieval
    async testFamilyRetrieval() {
        try {
            const response = await this.makeRequest(`${this.apiUrl}/api/family`);
            
            if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
                const family = response.data[0];
                const hasRequiredFields = family.id && family.name && family.createdAt;
                
                if (hasRequiredFields) {
                    this.logTest('Family Data Retrieval', true, `Retrieved ${response.data.length} families with proper structure`, response);
                    return family;
                } else {
                    this.logTest('Family Data Retrieval', false, 'Family data missing required fields', response);
                    return null;
                }
            } else {
                this.logTest('Family Data Retrieval', false, 'No families found or invalid format', response);
                return null;
            }
        } catch (error) {
            this.logTest('Family Data Retrieval', false, `Request failed: ${error.message}`);
            return null;
        }
    }

    // Test 4: Family Details
    async testFamilyDetails(familyId) {
        try {
            const response = await this.makeRequest(`${this.apiUrl}/api/family/${familyId}`);
            
            if (response.status === 200 && response.data && response.data.id === familyId) {
                this.logTest('Family Details', true, `Retrieved details for family "${response.data.name}"`, response);
                return response.data;
            } else {
                this.logTest('Family Details', false, `Failed to get family ${familyId} details`, response);
                return null;
            }
        } catch (error) {
            this.logTest('Family Details', false, `Request failed: ${error.message}`);
            return null;
        }
    }

    // Test 5: Family Members
    async testFamilyMembers(familyId) {
        try {
            const response = await this.makeRequest(`${this.apiUrl}/api/member/family/${familyId}`);
            
            if (response.status === 200 && Array.isArray(response.data)) {
                const members = response.data;
                const validMembers = members.filter(m => m.firstName && m.lastName && m.middleName);
                
                this.logTest('Family Members', true, `Found ${members.length} members (${validMembers.length} with complete names)`, response);
                return members;
            } else {
                this.logTest('Family Members', false, `Failed to get members for family ${familyId}`, response);
                return [];
            }
        } catch (error) {
            this.logTest('Family Members', false, `Request failed: ${error.message}`);
            return [];
        }
    }

    // Test 6: Frontend Connectivity
    async testFrontendConnectivity() {
        try {
            const response = await this.makeRequest(this.frontendUrl);
            
            if (response.status === 200 || response.status === 302) {
                this.logTest('Frontend Connectivity', true, 'Angular app is accessible', response);
                return true;
            } else {
                this.logTest('Frontend Connectivity', false, 'Angular app not accessible', response);
                return false;
            }
        } catch (error) {
            this.logTest('Frontend Connectivity', false, `Connection failed: ${error.message}`);
            return false;
        }
    }

    // Test 7: CORS Headers
    async testCorsHeaders() {
        try {
            const response = await this.makeRequest(`${this.apiUrl}/api/family`, {
                headers: {
                    'Origin': 'http://localhost:4200'
                }
            });
            
            const hasCors = response.headers['access-control-allow-origin'] || 
                           response.headers['Access-Control-Allow-Origin'];
            
            if (hasCors) {
                this.logTest('CORS Headers', true, 'CORS properly configured', response);
                return true;
            } else {
                this.logTest('CORS Headers', false, 'CORS headers missing', response);
                return false;
            }
        } catch (error) {
            this.logTest('CORS Headers', false, `Request failed: ${error.message}`);
            return false;
        }
    }

    // Test 8: Protected Endpoint (requires auth)
    async testProtectedEndpoint() {
        if (!this.authToken) {
            this.logTest('Protected Endpoint', false, 'No auth token available');
            return false;
        }

        try {
            const newFamily = {
                name: 'Test Family ' + Date.now(),
                description: 'Test family created by automated test',
                isPublic: true
            };

            const response = await this.makeRequest(`${this.apiUrl}/api/family`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: newFamily
            });

            if (response.status === 200 || response.status === 201) {
                this.logTest('Protected Endpoint', true, `Created test family "${newFamily.name}"`, response);
                return response.data;
            } else {
                this.logTest('Protected Endpoint', false, 'Failed to create family', response);
                return null;
            }
        } catch (error) {
            this.logTest('Protected Endpoint', false, `Request failed: ${error.message}`);
            return null;
        }
    }

    // Test 9: Data Validation
    async testDataValidation() {
        const tests = [];
        
        // Test empty family name
        try {
            const response = await this.makeRequest(`${this.apiUrl}/api/family`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: {
                    name: '',
                    description: 'Test'
                }
            });
            
            tests.push({
                name: 'Empty name validation',
                success: response.status === 400 || response.status === 422,
                status: response.status
            });
        } catch (error) {
            tests.push({
                name: 'Empty name validation',
                success: false,
                error: error.message
            });
        }

        const successfulTests = tests.filter(t => t.success).length;
        const success = successfulTests === tests.length;
        
        this.logTest('Data Validation', success, `${successfulTests}/${tests.length} validation tests passed`);
        return success;
    }

    // Main test runner
    async runAllTests() {
        console.log('🚀 Starting MyFamilyTreeNet Application Test Suite\n');
        console.log(`Testing API: ${this.apiUrl}`);
        console.log(`Testing Frontend: ${this.frontendUrl}\n`);

        const startTime = Date.now();

        // Run tests in sequence
        const apiHealthy = await this.testApiHealth();
        if (!apiHealthy) {
            console.log('\n❌ API is not healthy. Stopping tests.');
            return this.generateReport();
        }

        await this.testFrontendConnectivity();
        await this.testCorsHeaders();
        
        const authSuccess = await this.testAuthentication();
        const family = await this.testFamilyRetrieval();
        
        if (family) {
            await this.testFamilyDetails(family.id);
            await this.testFamilyMembers(family.id);
        }

        if (authSuccess) {
            await this.testProtectedEndpoint();
            await this.testDataValidation();
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`\n⏱️  Tests completed in ${duration} seconds`);
        
        return this.generateReport();
    }

    // Generate final report
    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);

        console.log('\n📊 TEST REPORT');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${successRate}%`);

        if (failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => !r.success)
                .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
        }

        console.log('\n🎯 Key Functionality Status:');
        console.log(`  API Health: ${this.getTestStatus('API Health Check')}`);
        console.log(`  Authentication: ${this.getTestStatus('User Authentication')}`);
        console.log(`  Data Retrieval: ${this.getTestStatus('Family Data Retrieval')}`);
        console.log(`  Frontend: ${this.getTestStatus('Frontend Connectivity')}`);
        console.log(`  CORS: ${this.getTestStatus('CORS Headers')}`);

        const overallStatus = passedTests >= totalTests * 0.8 ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION';
        console.log(`\n🏁 Overall Status: ${overallStatus}`);

        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: parseFloat(successRate),
            healthy: passedTests >= totalTests * 0.8
        };
    }

    getTestStatus(testName) {
        const test = this.testResults.find(r => r.test === testName);
        return test ? (test.success ? '✅' : '❌') : '⏸️';
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new MyFamilyTreeNetTester();
    tester.runAllTests().then(report => {
        process.exit(report.healthy ? 0 : 1);
    }).catch(error => {
        console.error('Test suite failed:', error);
        process.exit(1);
    });
}

module.exports = MyFamilyTreeNetTester;