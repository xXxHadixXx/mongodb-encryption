var ClientSideFieldLevelEncryptionOptions = {
    "keyVaultNamespace": "encryption.__keys",
    "kmsProviders": {
        "local": {
            "key": BinData(0, "${encryption_master_key}")
        }
    }
}

var connection = new Mongo(
    "mongodb://${mongo_root_user}:${mongo_root_password}@${mongo_host}:27017/",
    ClientSideFieldLevelEncryptionOptions
)

var keyVault = connection.getKeyVault()

var uuid = keyVault.createKey(
    "local",
    ["www"]
)