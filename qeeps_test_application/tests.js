const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index'); // assuming your Express app instance is in app.js

chai.use(chaiHttp);
const expect = chai.expect;

describe('Users API', () => {
});