#!/usr/bin/env node

/**
 * MyFamilyTreeNet Integration Test Suite
 * Tests the complete flow between Angular frontend and ASP.NET API
 */

const http = require('http');

class IntegrationTester {
    constructor() {
        this.apiUrl = 'http://localhost:5000';
        this.frontendUrl = 'http://localhost:4200';
        this.testResults = [];
        this.authToken = null;
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const isHttp = url.startsWith('http://');
            const client = http;
            
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
                        const jsonData = data && data.trim() ? JSON.parse(data) : null;
                        resolve({
                            status: res.statusCode,
                            data: jsonData,
                            headers: res.headers,
                            rawData: data
                        });
                    } catch (e) {
                        resolve({
                            status: res.statusCode,
                            data: null,
                            rawData: data,
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

    logTest(testName, success, message, response = null) {
        const result = {
            test: testName,
            success,
            message,
            timestamp: new Date().toISOString()
        };
        
        if (response) {
            result.status = response.status;
        }
        
        this.testResults.push(result);
        
        const icon = success ? '✅' : '❌';
        const status = response ? ` [${response.status}]` : '';
        console.log(`${icon} ${testName}${status}: ${message}`);
    }

    // Test complete user workflow
    async testCompleteUserWorkflow() {
        console.log('🔄 Testing Complete User Workflow...\n');

        // Step 1: User visits homepage
        try {
            const homeResponse = await this.makeRequest(this.frontendUrl);
            const homeSuccess = homeResponse.status === 200 || homeResponse.status === 302;
            this.logTest('Homepage Access', homeSuccess, 'User can access homepage', homeResponse);
        } catch (error) {
            this.logTest('Homepage Access', false, `Failed: ${error.message}`);
        }

        // Step 2: API provides family data
        try {
            const familiesResponse = await this.makeRequest(`${this.apiUrl}/api/family`);
            const familiesSuccess = familiesResponse.status === 200 && Array.isArray(familiesResponse.data);
            this.logTest('Family Data API', familiesSuccess, 
                        `API provides ${familiesResponse.data?.length || 0} families`, familiesResponse);
            
            if (familiesSuccess && familiesResponse.data.length > 0) {
                this.testFamily = familiesResponse.data[0];
            }
        } catch (error) {
            this.logTest('Family Data API', false, `Failed: ${error.message}`);
        }

        // Step 3: User views family details
        if (this.testFamily) {
            try {
                const detailsResponse = await this.makeRequest(`${this.apiUrl}/api/family/${this.testFamily.id}`);
                const detailsSuccess = detailsResponse.status === 200 && detailsResponse.data?.id === this.testFamily.id;
                this.logTest('Family Details API', detailsSuccess, 
                            `Details for "${detailsResponse.data?.name}"`, detailsResponse);
            } catch (error) {
                this.logTest('Family Details API', false, `Failed: ${error.message}`);
            }

            // Step 4: User views family members
            try {
                const membersResponse = await this.makeRequest(`${this.apiUrl}/api/member/family/${this.testFamily.id}`);
                const membersSuccess = membersResponse.status === 200 && Array.isArray(membersResponse.data);
                this.logTest('Family Members API', membersSuccess, 
                            `Found ${membersResponse.data?.length || 0} members`, membersResponse);
            } catch (error) {
                this.logTest('Family Members API', false, `Failed: ${error.message}`);
            }
        }

        // Step 5: User attempts login
        try {
            const loginResponse = await this.makeRequest(`${this.apiUrl}/api/auth/login`, {
                method: 'POST',
                body: {
                    email: 'admin@worldfamily.com',
                    password: 'Admin123!'
                }
            });
            
            const loginSuccess = loginResponse.status === 200 && loginResponse.data?.token;
            this.logTest('User Login', loginSuccess, 
                        `Login ${loginSuccess ? 'successful' : 'failed'}`, loginResponse);
            
            if (loginSuccess) {
                this.authToken = loginResponse.data.token;
            }
        } catch (error) {
            this.logTest('User Login', false, `Failed: ${error.message}`);
        }

        // Step 6: Authenticated user creates family
        if (this.authToken) {
            try {
                const createResponse = await this.makeRequest(`${this.apiUrl}/api/family`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    },
                    body: {
                        name: `Integration Test Family ${Date.now()}`,
                        description: 'Created by integration test',
                        isPublic: true
                    }
                });
                
                const createSuccess = createResponse.status === 200 || createResponse.status === 201;
                this.logTest('Create Family (Authenticated)', createSuccess, 
                            `Family creation ${createSuccess ? 'successful' : 'failed'}`, createResponse);
            } catch (error) {
                this.logTest('Create Family (Authenticated)', false, `Failed: ${error.message}`);
            }
        }
    }

    // Test API-Frontend Integration
    async testApiFrontendIntegration() {
        console.log('\n🔗 Testing API-Frontend Integration...\n');

        // Test CORS
        try {
            const corsResponse = await this.makeRequest(`${this.apiUrl}/api/family`, {
                headers: {
                    'Origin': this.frontendUrl
                }
            });
            
            const hasCors = corsResponse.headers['access-control-allow-origin'] || 
                           corsResponse.headers['Access-Control-Allow-Origin'];
            this.logTest('CORS Configuration', !!hasCors, 
                        `CORS ${hasCors ? 'properly configured' : 'missing'}`, corsResponse);
        } catch (error) {
            this.logTest('CORS Configuration', false, `Failed: ${error.message}`);
        }

        // Test API Response Format
        try {
            const formatResponse = await this.makeRequest(`${this.apiUrl}/api/family`);
            if (formatResponse.status === 200 && Array.isArray(formatResponse.data)) {
                const family = formatResponse.data[0];
                const hasRequiredFields = family && family.id && family.name && family.createdAt;
                this.logTest('API Response Format', hasRequiredFields, 
                            `API responses ${hasRequiredFields ? 'match Angular interfaces' : 'have missing fields'}`, 
                            formatResponse);
            }
        } catch (error) {
            this.logTest('API Response Format', false, `Failed: ${error.message}`);
        }

        // Test Frontend Routes
        const routes = ['/families', '/auth/login', '/auth/register'];
        for (const route of routes) {
            try {
                const routeResponse = await this.makeRequest(`${this.frontendUrl}${route}`);
                const routeSuccess = routeResponse.status === 200 || routeResponse.status === 302;
                this.logTest(`Frontend Route ${route}`, routeSuccess, 
                            `Route ${routeSuccess ? 'accessible' : 'failed'}`, routeResponse);
            } catch (error) {
                this.logTest(`Frontend Route ${route}`, false, `Failed: ${error.message}`);
            }
        }
    }

    // Test Error Scenarios
    async testErrorScenarios() {
        console.log('\n🚨 Testing Error Scenarios...\n');

        // Test invalid family ID
        try {
            const invalidResponse = await this.makeRequest(`${this.apiUrl}/api/family/99999`);
            const properError = invalidResponse.status === 404 || invalidResponse.status === 400;
            this.logTest('Invalid Family ID', properError, 
                        `Invalid ID ${properError ? 'properly handled' : 'not handled'}`, invalidResponse);
        } catch (error) {
            this.logTest('Invalid Family ID', false, `Failed: ${error.message}`);
        }

        // Test unauthorized access
        try {
            const unauthorizedResponse = await this.makeRequest(`${this.apiUrl}/api/family`, {
                method: 'POST',
                body: { name: 'Test' }
            });
            const properUnauth = unauthorizedResponse.status === 401 || unauthorizedResponse.status === 403;
            this.logTest('Unauthorized Access', properUnauth, 
                        `Unauthorized requests ${properUnauth ? 'properly rejected' : 'not handled'}`, 
                        unauthorizedResponse);
        } catch (error) {
            this.logTest('Unauthorized Access', false, `Failed: ${error.message}`);
        }

        // Test malformed data
        try {
            const malformedResponse = await this.makeRequest(`${this.apiUrl}/api/auth/login`, {
                method: 'POST',
                body: { invalid: 'data' }
            });
            const properValidation = malformedResponse.status === 400 || malformedResponse.status === 422;
            this.logTest('Data Validation', properValidation, 
                        `Malformed data ${properValidation ? 'properly validated' : 'not validated'}`, 
                        malformedResponse);
        } catch (error) {
            this.logTest('Data Validation', false, `Failed: ${error.message}`);
        }
    }

    // Test Performance
    async testPerformance() {
        console.log('\n⏱️ Testing Performance...\n');

        const tests = [
            { name: 'API Family List', url: `${this.apiUrl}/api/family`, limit: 1000 },
            { name: 'API Family Details', url: `${this.apiUrl}/api/family/1`, limit: 1000 },
            { name: 'Frontend Home', url: this.frontendUrl, limit: 3000 }
        ];

        for (const test of tests) {
            const startTime = Date.now();
            try {
                const response = await this.makeRequest(test.url);
                const endTime = Date.now();
                const duration = endTime - startTime;
                const success = duration < test.limit;
                
                this.logTest(`Performance: ${test.name}`, success, 
                            `${duration}ms (limit: ${test.limit}ms)`, response);
            } catch (error) {
                this.logTest(`Performance: ${test.name}`, false, `Failed: ${error.message}`);
            }
        }
    }

    // Main test runner
    async runAllTests() {
        console.log('🧪 Starting MyFamilyTreeNet Integration Test Suite\n');
        console.log(`API: ${this.apiUrl}`);
        console.log(`Frontend: ${this.frontendUrl}\n`);

        const startTime = Date.now();

        await this.testCompleteUserWorkflow();
        await this.testApiFrontendIntegration();
        await this.testErrorScenarios();
        await this.testPerformance();

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`\n⏱️  Integration tests completed in ${duration} seconds`);
        
        return this.generateReport();
    }

    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);

        console.log('\n📊 INTEGRATION TEST REPORT');
        console.log('='.repeat(60));
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

        console.log('\n🎯 Integration Status:');
        console.log(`  User Workflow: ${this.getTestStatus('User Login')}`);
        console.log(`  API-Frontend: ${this.getTestStatus('CORS Configuration')}`);
        console.log(`  Error Handling: ${this.getTestStatus('Invalid Family ID')}`);
        console.log(`  Performance: ${this.getTestStatus('Performance: API Family List')}`);

        const overallStatus = passedTests >= totalTests * 0.85 ? '✅ EXCELLENT' : 
                            passedTests >= totalTests * 0.7 ? '✅ GOOD' : '⚠️  NEEDS WORK';
        console.log(`\n🏁 Integration Status: ${overallStatus}`);
        
        console.log('\n💡 Recommendations:');
        if (successRate >= 90) {
            console.log('   🎉 Application is ready for production deployment!');
        } else if (successRate >= 80) {
            console.log('   ✅ Application is stable with minor issues to address');
        } else if (successRate >= 70) {
            console.log('   ⚠️  Address failed tests before deployment');
        } else {
            console.log('   🚨 Major issues found - requires debugging');
        }

        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: parseFloat(successRate),
            ready: passedTests >= totalTests * 0.8
        };
    }

    getTestStatus(testName) {
        const test = this.testResults.find(r => r.test === testName);
        return test ? (test.success ? '✅' : '❌') : '⏸️';
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new IntegrationTester();
    tester.runAllTests().then(report => {
        process.exit(report.ready ? 0 : 1);
    }).catch(error => {
        console.error('Integration test suite failed:', error);
        process.exit(1);
    });
}

module.exports = IntegrationTester;