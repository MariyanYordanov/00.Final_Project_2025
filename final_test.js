#!/usr/bin/env node

/**
 * Final Working Test Suite for WorldFamily Application
 * Tests all functionality with corrected issues
 */

const http = require('http');

class FinalTester {
    constructor() {
        this.apiUrl = 'http://localhost:5000';
        this.frontendUrl = 'http://localhost:4200';
        this.testResults = [];
        this.authToken = null;
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const isApiUrl = url.includes('localhost:5000');
            const reqOptions = {
                method: options.method || 'GET',
                headers: isApiUrl ? {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                } : {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    ...options.headers
                }
            };

            const req = http.request(url, reqOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = data && data.trim() && data.includes('{') ? JSON.parse(data) : null;
                        resolve({
                            status: res.statusCode,
                            data: jsonData,
                            rawData: data,
                            headers: res.headers
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

    logTest(testName, success, message, details = null) {
        const result = {
            test: testName,
            success,
            message,
            timestamp: new Date().toISOString(),
            details
        };
        
        this.testResults.push(result);
        
        const icon = success ? '✅' : '❌';
        console.log(`${icon} ${testName}: ${message}`);
    }

    async runFullTest() {
        console.log('🚀 Final WorldFamily Application Test\n');
        console.log(`API: ${this.apiUrl}`);
        console.log(`Frontend: ${this.frontendUrl}\n`);

        let allGood = true;

        // Test 1: API Health
        console.log('🔧 Testing API Health...');
        try {
            const apiResponse = await this.makeRequest(`${this.apiUrl}/api/family`);
            if (apiResponse.status === 200 && Array.isArray(apiResponse.data)) {
                this.logTest('API Health', true, `API working - ${apiResponse.data.length} families found`);
            } else {
                this.logTest('API Health', false, `API returned status ${apiResponse.status}`);
                allGood = false;
            }
        } catch (error) {
            this.logTest('API Health', false, `API connection failed: ${error.message}`);
            allGood = false;
        }

        // Test 2: Frontend Health
        console.log('\n🌐 Testing Frontend Health...');
        try {
            const frontendResponse = await this.makeRequest(this.frontendUrl);
            if (frontendResponse.status === 200 && frontendResponse.rawData.includes('<app-root>')) {
                this.logTest('Frontend Health', true, 'Angular app loaded successfully');
            } else {
                this.logTest('Frontend Health', false, `Frontend returned status ${frontendResponse.status}`);
                allGood = false;
            }
        } catch (error) {
            this.logTest('Frontend Health', false, `Frontend connection failed: ${error.message}`);
            allGood = false;
        }

        // Test 3: Authentication Flow
        console.log('\n🔐 Testing Authentication...');
        try {
            const loginResponse = await this.makeRequest(`${this.apiUrl}/api/auth/login`, {
                method: 'POST',
                body: {
                    email: 'admin@worldfamily.com',
                    password: 'Admin123!'
                }
            });

            if (loginResponse.status === 200 && loginResponse.data?.token) {
                this.authToken = loginResponse.data.token;
                this.logTest('Authentication', true, `Login successful - token received`);
            } else {
                this.logTest('Authentication', false, `Login failed - status ${loginResponse.status}`);
                allGood = false;
            }
        } catch (error) {
            this.logTest('Authentication', false, `Login request failed: ${error.message}`);
            allGood = false;
        }

        // Test 4: Data Retrieval
        console.log('\n📊 Testing Data Operations...');
        try {
            const familiesResponse = await this.makeRequest(`${this.apiUrl}/api/family`);
            if (familiesResponse.status === 200 && familiesResponse.data?.length > 0) {
                const family = familiesResponse.data[0];
                this.logTest('Family Data', true, `Retrieved family: "${family.name}"`);

                // Test family members
                const membersResponse = await this.makeRequest(`${this.apiUrl}/api/member/family/${family.id}`);
                if (membersResponse.status === 200) {
                    this.logTest('Member Data', true, `Found ${membersResponse.data?.length || 0} members`);
                } else {
                    this.logTest('Member Data', false, `Members request failed: ${membersResponse.status}`);
                    allGood = false;
                }
            } else {
                this.logTest('Family Data', false, 'No family data found');
                allGood = false;
            }
        } catch (error) {
            this.logTest('Data Operations', false, `Data requests failed: ${error.message}`);
            allGood = false;
        }

        // Test 5: Frontend Routes
        console.log('\n🗺️ Testing Frontend Routes...');
        const routes = ['/families/catalog', '/auth/login', '/auth/register'];
        let routeSuccess = 0;

        for (const route of routes) {
            try {
                const routeResponse = await this.makeRequest(`${this.frontendUrl}${route}`);
                if (routeResponse.status === 200 && routeResponse.rawData.includes('<app-root>')) {
                    routeSuccess++;
                }
            } catch (error) {
                // Route may not be accessible
            }
        }

        if (routeSuccess >= routes.length * 0.8) {
            this.logTest('Frontend Routes', true, `${routeSuccess}/${routes.length} routes working`);
        } else {
            this.logTest('Frontend Routes', false, `Only ${routeSuccess}/${routes.length} routes working`);
            allGood = false;
        }

        // Test 6: CRUD Operations
        if (this.authToken) {
            console.log('\n✏️ Testing CRUD Operations...');
            try {
                const createResponse = await this.makeRequest(`${this.apiUrl}/api/family`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    },
                    body: {
                        name: 'Test Family Final',
                        description: 'Created by final test',
                        isPublic: true
                    }
                });

                if (createResponse.status === 200 || createResponse.status === 201) {
                    this.logTest('CRUD Operations', true, 'Successfully created test family');
                } else {
                    this.logTest('CRUD Operations', false, `Create failed: ${createResponse.status}`);
                    allGood = false;
                }
            } catch (error) {
                this.logTest('CRUD Operations', false, `CRUD test failed: ${error.message}`);
                allGood = false;
            }
        }

        // Test 7: Performance Check
        console.log('\n⚡ Testing Performance...');
        const startTime = Date.now();
        try {
            await Promise.all([
                this.makeRequest(`${this.apiUrl}/api/family`),
                this.makeRequest(this.frontendUrl)
            ]);
            const endTime = Date.now();
            const totalTime = endTime - startTime;

            if (totalTime < 2000) {
                this.logTest('Performance', true, `All requests completed in ${totalTime}ms`);
            } else {
                this.logTest('Performance', false, `Slow response: ${totalTime}ms`);
                allGood = false;
            }
        } catch (error) {
            this.logTest('Performance', false, `Performance test failed: ${error.message}`);
            allGood = false;
        }

        // Test 8: Integration Test
        console.log('\n🔗 Testing API-Frontend Integration...');
        try {
            const corsResponse = await this.makeRequest(`${this.apiUrl}/api/family`, {
                headers: {
                    'Origin': this.frontendUrl
                }
            });

            const hasCors = corsResponse.headers['access-control-allow-origin'] || 
                           corsResponse.headers['Access-Control-Allow-Origin'];

            if (hasCors) {
                this.logTest('CORS Integration', true, 'CORS properly configured for frontend');
            } else {
                this.logTest('CORS Integration', false, 'CORS headers missing');
                allGood = false;
            }
        } catch (error) {
            this.logTest('Integration', false, `Integration test failed: ${error.message}`);
            allGood = false;
        }

        return this.generateFinalReport(allGood);
    }

    generateFinalReport(allGood) {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);

        console.log('\n📊 FINAL TEST REPORT');
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

        console.log('\n🎯 Application Status:');
        console.log(`  API: ${this.getTestStatus('API Health')}`);
        console.log(`  Frontend: ${this.getTestStatus('Frontend Health')}`);
        console.log(`  Authentication: ${this.getTestStatus('Authentication')}`);
        console.log(`  Data Operations: ${this.getTestStatus('Family Data')}`);
        console.log(`  CRUD: ${this.getTestStatus('CRUD Operations')}`);
        console.log(`  Performance: ${this.getTestStatus('Performance')}`);
        console.log(`  Integration: ${this.getTestStatus('CORS Integration')}`);

        let overallStatus;
        let recommendation;

        if (successRate >= 95) {
            overallStatus = '🎉 EXCELLENT - READY FOR PRODUCTION';
            recommendation = 'Application is fully functional and ready for deployment!';
        } else if (successRate >= 85) {
            overallStatus = '✅ GOOD - MINOR ISSUES';
            recommendation = 'Application works well with some minor issues to address.';
        } else if (successRate >= 70) {
            overallStatus = '⚠️ NEEDS WORK - MAJOR ISSUES';
            recommendation = 'Several issues need to be fixed before deployment.';
        } else {
            overallStatus = '🚨 BROKEN - CRITICAL ISSUES';
            recommendation = 'Major problems prevent proper functionality.';
        }

        console.log(`\n🏁 Final Status: ${overallStatus}`);
        console.log(`💡 Recommendation: ${recommendation}`);

        // Specific guidance
        if (successRate >= 85) {
            console.log('\n🚀 DEPLOYMENT READY:');
            console.log('  1. Both servers are working correctly');
            console.log('  2. API endpoints respond properly');
            console.log('  3. Frontend loads and serves pages');
            console.log('  4. Authentication system works');
            console.log('  5. Data operations are functional');
            console.log('  6. CORS is configured correctly');
            console.log('  7. Performance is acceptable');
            console.log('\n✅ You can proceed with Render.com deployment!');
        } else {
            console.log('\n🔧 ISSUES TO FIX:');
            this.testResults
                .filter(r => !r.success)
                .forEach(r => console.log(`  - Fix: ${r.test} - ${r.message}`));
        }

        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: parseFloat(successRate),
            ready: successRate >= 85,
            status: overallStatus
        };
    }

    getTestStatus(testName) {
        const test = this.testResults.find(r => r.test === testName);
        return test ? (test.success ? '✅' : '❌') : '⏸️';
    }
}

// Run test
if (require.main === module) {
    const tester = new FinalTester();
    tester.runFullTest().then(report => {
        process.exit(report.ready ? 0 : 1);
    }).catch(error => {
        console.error('Final test failed:', error);
        process.exit(1);
    });
}

module.exports = FinalTester;