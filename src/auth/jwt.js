const jwt = require('jsonwebtoken');
const fs = require('fs');
const { permission } = require('process');

const payload = {userId: '1', permission: ['read', 'write']};


const privateKey = fs.readFileSync('./private_key.pem');

const publicKey = fs.readFileSync('./public_key.pem');

//const token = jwt.sign(payload, privateKey, { algorithm: 'RS256'});
//console.log('Token:', token);

const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwicGVybWlzc2lvbiI6WyJyZWFkIiwid3JpdGUiXSwiaWF0IjoxNzU1MTI3NTg3fQ.R_mmOAoOKKi-BWGTQ2DptaVy3Rr5AyGCeZNSlLEabEZaay5jYF6s5f4cF-f9Ey_nLbBJk2FqOn5erw9txU7XJc5U9yoBVys_bIEWSi7UDvnBgPuuD_uHLibahZ3jl2zuKo5qsiRzvjzo6oK7yKvTZ2SVBGl4YYDY15Z-p9K31cbNO11W-Ie8M4VZw22NivZw2lFTSkEwqFT_1sF7Y93b3dZnrmLste60YE_cNPylIRVtYjW1JkL0jqeKlhqV7N8_irBMZolB5d9AQslVW1nxgTpJyw-Q6ufXbQ7Skvdq0Xlpo7t6cD3GEIsP43sjkCpV_i7KFrlVx78oNHVFSGT9rQ'


try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"]});
    console.log("Decoded", decoded);
} catch (err) {
    console.error("Verification failed", err);
};