import mysql from 'mysql';
import colors from 'colors';
import S from 'string';
import Redis from './redis';

module.exports = class Database{
    constructor(env){
        this.POOL = mysql.createPool(env === 'development' ? this.devDB() : this.prodDB());
        this.REDIS = new Redis();
        this.TESTING = env === 'production' ? false : false; //false;
    }
    query(query, variables, callback){
        if(typeof(variables) == 'function'){
            callback = variables;
            variables = '';
        }
        variables = variables || '';
        const pre_query = new Date().getTime();
        //When we are testing we are going to run both queries and compare them to see how often they return the same results.
        //Should be 100% of the time.
        this.REDIS.getCache(query, mysql.format(query, variables), result => {
            if(this.TESTING ? true : result == -1){
                this.POOL.getConnection((err, connection) => {
                    if(err) {
                        if (connection != undefined) {
                            connection.release();
                            connection.destroy();
                        }
                        console.log("code : 100, status : Error in connection database, err : " + err);
                        return -99;
                    }
                    connection.on('error', (err) => {
                        connection.release();
                        connection.destroy();
                        console.log("code : 101, status : Error in connection database, err : " + err);
                        return -99;
                    });
                    connection.query(query, variables, (err, rows) => {
                        connection.release();
                        connection.destroy();
                        if(this.TESTING){
                            if(result != -1){
                                const { err: RedisErr, rows: RedisRows } = result;
                                console.log(RedisRows);
                                console.log(rows);
                            }else{
                                this.REDIS.setCache({ query, formatted: mysql.format(query, variables), err, rows });
                            }
                        }else{
                            this.REDIS.setCache({ query, formatted: mysql.format(query, variables), err, rows });
                        }
                        if(err){
                            console.log(err);
                        }
                        const post_query = new Date().getTime();
                        const duration = (post_query - pre_query) / 1000;
                        console.log(mysql.format(query, variables).green + '   ' + (duration + '').yellow);
                        if(callback){
                            callback(err, rows);
                        }
                    });
                });
            }else{
                const { err, rows } = result;
                const post_query = new Date().getTime();
                const duration = (post_query - pre_query) / 1000;
                console.log(mysql.format(query, variables).red + "    Redis: " + (duration + '').yellow);
                if(callback){
                    callback(err, rows);
                }
            }
        });
    }
    format(a, b){
        return mysql.format(a, b);
    }
    devDB(){
        return {
            connectionLimit: 20,
            host: "localhost",
            user: "root",
            password: "sesgidvu",
            database: "shompass",
        };
    }
    prodDB(){
        return {
            connectionLimit: 20,
            host: "shpmpass.com",
            user: "myuser",
            password: "Sesgidvu1!",
            database: "shompass",
        };
    }
    log(obj){
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                console.log(key.blue);
                console.log(obj[key]);
            }
        }
    }
};