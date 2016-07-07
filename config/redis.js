import redis from 'redis';
import S from 'string';
import colors from 'colors';
module.exports = class Redis{
    constructor(){
        let port, host;
        this.PORT = port = '6379';
        this.HOST = host = '127.0.0.1';
        const client = redis.createClient(port, host);
        client.on('connect', () => {
            console.log(`Redis connected on: ${host}:${port}`);
            this.CLIENT = client;
        });
    }
    getClient(){
        return this.CLIENT;
    }
    keyQuery(query){
        query = S(query).replaceAll('`', '').s;
    }
    setCache({ query, formatted, err, rows }){
        const rc = this.CLIENT;
    }
    getCache(query, formatted, done){
        const rc = this.CLIENT;
        done(-1);
    }
};