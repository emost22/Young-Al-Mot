const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');

const multer = require('multer');
const upload = multer({dest: './upload'});

const _secret = fs.readFileSync('./secret.txt','utf8').split(" ");

const db = mysql.createConnection({
    host:_secret[2],
    user:_secret[0],
    password:_secret[1],
    database:'yam'
});
db.connect();

var yam = require('../yam');

exports.roominchk = app.post('/roominchk', upload.single(), (req, res) =>{
    let sql = `SELECT * FROM user WHERE user_id=?`;
    let roomno = req.body.roomid;
    let password = req.body.password;
    let userid = req.body.userid;
    console.log("roominchk userid",userid);
    console.log("roominchk roomno",roomno);
    console.log("");
    
    db.query(sql, userid, (err, r, f) => {
        if(err) throw err;

        let sql2 = `SELECT * FROM roomuser WHERE user_name=?`;
        db.query(sql2, r[0].user_name, (err2, r2, f2) => {
            if(err2) throw err2;

            if(r2[0]){
                return res.status(400).json({
                    error: 6//이미 게임중인 아이디입니다
                });
            }
            else{
                let sql3 = `SELECT * FROM roomlist WHERE room_no=?`;
                db.query(sql3, roomno, (err3, rows, fields) => {
                    if(err3) throw err3;
            
                    if(rows[0].password == null || password == rows[0].password){
                        if(rows[0].nowplayer == rows[0].maxplayer){
                            return res.status(400).json({
                                error: 4//방이 가득찼습니다
                             });
                        }
                        else{
                            let sql4 = `UPDATE roomlist SET nowplayer=nowplayer+1 WHERE room_no=?`;
            
                            db.query(sql4, roomno, (err4) =>{
                                if(err4) throw err4;
                            })
            
                            let sql5 = `SELECT * FROM user WHERE user_id=?`;
                            db.query(sql5, userid, (err5, row, field) => {
                                if(err5) throw err5;
            
                                let sql6 = `INSERT INTO roomuser VALUES (?,?,?,?,?,?,now())`;
                                db.query(sql6, [row[0].user_no, row[0].user_name, rows[0].room_no, 0, 0, 0], (err6, r, f) => {
                                    if(err6) throw err6;

                                    return res.json({ success: true, roominfo:rows[0], count:yam.MT[roomno] });
                                })
                            })
                        }
                    }
                    else return res.status(400).json({
                        error: 5//방 비밀번호가 일치하지 않습니다
                     });
                })
            }
        })
    })
});