const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
    chai.use(chaiHttp);
const expect = chai.expect;

describe('Users API', () => {
    // Test for GET /user
    it('Should get 400 without a token', (done) => {
        chai
            .request(app)
            .get('/agency')
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });
    it('Should get 400 with an invalid token', (done) => {
        chai
            .request(app)
            .get('/agency')
            .send({token: "4848"})
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property("message").eql("Your token is invalid")
                done();
            });
    });
});