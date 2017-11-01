import 'mocha';
import 'isomorphic-fetch';
import chai = require('chai');
import sinonChai = require('sinon-chai');
import chaiAsProised = require('chai-as-promised');

chai.use(sinonChai);
chai.use(chaiAsProised);
