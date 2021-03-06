const Sequelize = require('sequelize');
module.exports = class Competition extends Sequelize.Model {
    static init (sequelize) {
        return super.init({
            //친구 상태를 표시하는 state만 생성(추후에 유저 모델과 관계를 가지며 request_user, accept_user생성)
            id:{
                primaryKey:true,
                autoIncrement:true,
                type:Sequelize.INTEGER
            },
            state: {
                defaultValue: false,
                type: Sequelize.BOOLEAN
            },
            //신청한 사람의 포인트
            ruPoint:{
                defaultValue: 0,
                type: Sequelize.INTEGER
            },
            //수락한 사람의 포인트
            auPoint:{
                defaultValue: 0,
                type: Sequelize.INTEGER
            },
            startAt:{
                allowNull:true,
                type:Sequelize.DATE
            }

        }, {
            sequelize,
            timestamps:true,
            paranoid:true,
            createdAt:false,
            updatedAt:false,
            deletedAt:'endAt',
            underscored: false,
            modelName: 'Competition',
            tableName: 'competition',
        });
    }
}