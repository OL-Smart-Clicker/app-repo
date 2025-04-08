module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
    coverageReporters: ['lcov', 'text-summary'],
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.json',
        },
    },
};