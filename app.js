const { MongoClient } = require('mongodb');
const { ClientEncryption } = require('mongodb-client-encryption');

async function main() {
    const masterKey = '<your-master-key>'; // Replace with your own master key
    const keyVaultNamespace = 'encryption.__keyVault'; // Default namespace for storing encryption keys

    const kmsProviders = {
        local: {
            key: Buffer.from(masterKey, 'base64'), // Convert master key to Buffer
        },
    };

    const encryptionOptions = {
        kmsProviders,
        keyVaultNamespace,
    };

    async function encryptData(data) {
        const uri = 'mongodb+srv://<username>:<password>@<cluster-url>/test?retryWrites=true&w=majority'; // Replace with your MongoDB connection string
        const client = new MongoClient(uri);

        try {
            await client.connect();

            const encryption = new ClientEncryption(client, encryptionOptions);

            const schema = {
                bsonType: 'object',
                properties: {
                    encryptedField: {
                        encrypt: {
                            keyId: 'myDataKeyId',
                            algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
                        },
                    },
                },
            };

            await encryption.createDataKey('local', { keyAltNames: ['myDataKeyId'] });

            const encryptedData = await encryption.encrypt(data, schema);

            return encryptedData;
        } finally {
            await client.close();
        }
    }

    async function decryptData(encryptedData) {
        const uri = 'mongodb+srv://<username>:<password>@<cluster-url>/test?retryWrites=true&w=majority'; // Replace with your MongoDB connection string
        const client = new MongoClient(uri);

        try {
            await client.connect();

            const encryption = new ClientEncryption(client, encryptionOptions);

            const decryptedData = await encryption.decrypt(encryptedData);

            return decryptedData;
        } finally {
            await client.close();
        }
    }

    // Usage example
    const dataToEncrypt = { secret: 'Sensitive information' };

    try {
        const encrypted = await encryptData(dataToEncrypt);
        console.log('Encrypted data:', encrypted);

        const decrypted = await decryptData(encrypted);
        console.log('Decrypted data:', decrypted);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main().catch(console.error);
