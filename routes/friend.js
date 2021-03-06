//친추, 겨루기 등등
const express = require('express');
const {getUid} = require('./middlewares');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const User = require('../models/user');
const Friends = require('../models/friend');
const logger = require('../logger');

const router = express.Router();
//친구 목록, 수락 대기중

//유저 검색(이름 검색)
router.get('/:keyword', async (req, res, next) => {
    try{
        //sequelize like문법으로 사용자 이름 검색
        const searchResult =  await User.findAll({where: { name:{[Op.like]:`${req.params.keyword}%` }}});
        logger.info(searchResult);
        if (searchResult.length) {
            return res.json({state: 'success', result: searchResult});
        }
        return res.status(400).json({state: 'fail', message:`cant found user ${req.params.keyword}`});
        
    }catch(error) {
        logger.error(error);
        next(error);
    }
});

router.get('/', getUid, async (req, res, next) => {
    try {
        const user = await User.findOne({
            attributes:[],
            where: {uid: req.uid}, 
            include:[{
                model:User,
                as:'RequestUser',
                attributes:['id', 'name', 'point'],
            },{
                model:User,
                as:'AcceptUser',
                attributes:['id', 'name', 'point'],      
            }]
        });
        if(user){
            //친구 탐색
            let friends = [];
            var acceptWaiting = user.getDataValue('RequestUser');
            var requestWaiting = user.getDataValue('AcceptUser');

            //요청, 응답 대기 리스트에서 이미 친구가 된 상태만 다른 array로 이동
            requestWaiting.forEach((user, index) => {                
                if (user.getDataValue('Firend').getDataValue('state'))                    
                    friends.push(requestWaiting.splice(index,1)[0]);
            });
            acceptWaiting.forEach((user, index) => {                
                delete requestWaiting[index]['Firend'];
                if (user.getDataValue('Firend').getDataValue('state'))
                    friends.push(acceptWaiting.splice(index,1)[0]);                
            });
            return res.json({state: 'success', friends: friends, accept_waiting: acceptWaiting, request_waiting: requestWaiting});
        }
        return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
    } catch (error) {
        logger.error(error);
        next(error);
    }
});


//친구신청
router.post('/:id/request', getUid, async (req, res, next) => {
    try{
        const requestUser = await User.findOne({where: {uid: req.uid}});
        if(requestUser){
            const acceptCheck = await Friends.findOne({where:{acceptId:requestUser.id, requestId: req.params.id}});
            if(acceptCheck){    //이미 요청이 와있는경우
                acceptCheck.update({state:true});
                return res.send(acceptCheck);
            }
            await requestUser.addAcceptUser(parseInt(req.params.id));
            return res.json({state:'success', result: req.params.id});
        } else {
            return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
        }
    } catch(error) {
        logger.error(error);
        next(error);
    }
});
//친구 수락
router.post('/:id/accept', getUid, async (req, res, next) => {
    try {
        const user = await User.findOne({where: {uid: req.uid}});
        if(user){
            const friend = await Friends.update({state: true},{ 
                where : { acceptId: user.id, requestId: req.params.id },
            });
            return res.json({state:'success', result:friend});
        }
        return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
    } catch (error) {
        logger.error(error);
        next(error);
    }
});


module.exports = router;