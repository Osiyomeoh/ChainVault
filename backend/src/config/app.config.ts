export const appConfig = () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3001,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    
    // Security
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    encryptionKey: process.env.ENCRYPTION_KEY,
    
    // Blockchain
    stacksNetwork: process.env.STACKS_NETWORK || 'testnet',
    stacksApiUrl: process.env.STACKS_API_URL || 'https://stacks-node-api.testnet.stacks.co',
    stacksPrivateKey: process.env.STACKS_PRIVATE_KEY,
    chainvaultContractAddress: process.env.CHAINVAULT_CONTRACT_ADDRESS,
    bitcoinNetwork: process.env.BITCOIN_NETWORK || 'testnet',
    bitcoinApiUrl: process.env.BITCOIN_API_URL || 'https://blockstream.info/testnet/api',
    
    // External services
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    kycProviderApiKey: process.env.KYC_PROVIDER_API_KEY,
  });