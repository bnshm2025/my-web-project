const sql = require('mssql');
require('dotenv').config();

// Cấu hình cho CSDL Tin tức
const configPostWebDb = {
    user: process.env.POSTS_WEB_DB_USER,
    password: process.env.POSTS_WEB_DB_PASSWORD,
    server: process.env.POSTS_WEB_DB_SERVER,
    database: process.env.POSTS_WEB_DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

// Cấu hình cho BNSWebDb 
const configBNSWebDb = {
    user: process.env.BNS_WEB_DB_USER,
    password: process.env.BNS_WEB_DB_PASSWORD,
    server: process.env.BNS_WEB_DB_SERVER,
    database: process.env.BNS_WEB_DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

// Cấu hình cho CSDL PlatformAcctDb Sử dụng cho web
const configAcctWebDb = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

//Cấu hình cho PlatformAcctDb
const configPlatformAcctDb = {
    user: process.env.PLATFORM_ACCT_DB_USER,
    password: process.env.PLATFORM_ACCT_DB_PASSWORD,
    server: process.env.PLATFORM_ACCT_DB_SERVER,
    database: process.env.PLATFORM_ACCT_DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

//Cấu hình cho BlGame
const configBlGameDb = {
    user: process.env.BLGAME_DB_USER,
    password: process.env.BLGAME_DB_PASSWORD,
    server: process.env.BLGAME_DB_SERVER,
    database: process.env.BLGAME_DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

//Cấu hình cho VirtualCurrencyDb
const configVirtualCurrencyDb = {
    user: process.env.VIRTUAL_CURRENCY_DB_USER,
    password: process.env.VIRTUAL_CURRENCY_DB_PASSWORD,
    server: process.env.VIRTUAL_CURRENCY_DB_SERVER,
    database: process.env.VIRTUAL_CURRENCY_DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

//Cấu hình cho LobbyDB
const configLobbyDB = {
    user: process.env.LOBBY_DB_USER,
    password: process.env.LOBBY_DB_PASSWORD,
    server: process.env.LOBBY_DB_SERVER,
    database: process.env.LOBBY_DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

// Cấu hình cho GameWarehouseDB
const configGameWarehouseDb = {
    user: process.env.GAME_WAREHOUSE_DB_USER,
    password: process.env.GAME_WAREHOUSE_DB_PASSWORD,
    server: process.env.GAME_WAREHOUSE_DB_SERVER,
    database: process.env.GAME_WAREHOUSE_DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

// Hàm kết nối đến GameWarehouseDB
async function connectGameWarehouseDb() {
    try {
        const pool = await sql.connect(configGameWarehouseDb);
        console.log('Connected to GameWarehouseDb');
        return pool;
    } catch (err) {
        console.error('Database Connection Failed:', err);
        throw err;
    }
}

// Kết nối đến CSDL Tin tức
const connectBNSPostsWebDb = new sql.ConnectionPool(configPostWebDb)
    .connect()
    .then((pool) => {
        console.log('Connected to BNS Web Db Posts');
        return pool;
    })
    .catch((err) => console.log('Database Connection Failed: ', err));

// Hàm kết nối đến CSDL BNS Web
async function connectBNSWebDb() {
    try {
        const pool = await sql.connect(configBNSWebDb);
        console.log('Connected to BNS Web Db');
        return pool;
    } catch (err) {
        console.error('Database Connection Failed:', err);
        throw err;
    }
}

// Hàm kết nối đến CSDL PlatformAcctDb Web
async function connectAcctWebDb() {
    try {
        const pool = await sql.connect(configAcctWebDb);
        console.log('Connected to Platform Acct Web Db (WEB)');
        return pool;
    } catch (err) {
        console.error('Database Connection Failed:', err);
        throw err;
    }
}

//Hàm kết nôi PlatformAcctDb
async function connectPlatformAcctDb() {
    try {
        const pool = await sql.connect(configPlatformAcctDb);
        console.log('Connected to Platform Acct Db');
        return pool;
    } catch (err) {
        console.error('Database Connection Failed:', err);
        throw err;
    }
}

//Hàm kết nôi BlGame
async function connectBlGame() {
    try {
        const pool = await sql.connect(configBlGameDb);
        console.log('Connected to BlGame Db');
        return pool;
    } catch (err) {
        console.error('Database Connection Failed:', err);
        throw err;
    }
}

//Hàm kết nôi VirtualCurrencyDb
async function connectVirtualCurrencyDb() {
    try {
        const pool = await sql.connect(configVirtualCurrencyDb);
        console.log('Connected to VirtualCurrencyDb');
        return pool;
    } catch (err) {
        console.error('Database Connection Failed:', err);
        throw err;
    }
}

//Hàm kết nôi LobbyDB
async function connectLobbyDB() {
    try {
        const pool = await sql.connect(configLobbyDB);
        console.log('Connected to LobbyDb');
        return pool;
    } catch (err) {
        console.error('Database Connection Failed:', err);
        throw err;
    }
}

module.exports = {
    sql,
    connectBNSPostsWebDb,
    connectAcctWebDb,
    connectPlatformAcctDb,
    connectBlGame,
    connectLobbyDB,
    connectVirtualCurrencyDb,
    connectBNSWebDb,
    connectGameWarehouseDb,
};
