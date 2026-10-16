import {test} from 'node:test';
import assert from 'node:assert/strict';
import {battleEnvironment} from '../src/battle-environment.js';
test('a câmera de combate respeita o local e conserva a destruição do laboratório',()=>{
 assert.equal(battleEnvironment('lab'), 'battleLab');
 assert.equal(battleEnvironment('lab',{labDamaged:true}), 'battleLabDamaged');
 assert.equal(battleEnvironment('gym',{labDamaged:true}), 'battleGym');
 assert.equal(battleEnvironment('plaza'), 'battleCourtyard');
});
